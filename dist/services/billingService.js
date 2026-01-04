import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { HttpError } from "../middlewares/errorHandler.js";
import { getGuestById } from "./guestService.js";
import { getPropertyProfile, getTaxConfig } from "./propertyService.js";
const billsTable = db.bills;
const paymentsTable = db.payments;
const reservationsTable = db.reservations;
const DEFAULT_FOLIO_NAME = "Primary";
const DEFAULT_CURRENCY = "INR";
const LATE_CHECKOUT_RATE = 0.25;
const now = () => new Date().toISOString();
const toISODate = (value) => new Date(value).toISOString().split("T")[0];
const roundCurrency = (amount) => Number(amount.toFixed(2));
const enumerateStayNights = (arrival, departure) => {
    const nights = [];
    const start = new Date(arrival);
    const end = new Date(departure);
    if (!(start < end)) {
        return nights;
    }
    const cursor = new Date(start);
    while (cursor < end) {
        nights.push(cursor.toISOString().split("T")[0]);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return nights;
};
const calculateTax = async (hotelCode, amount) => {
    const taxes = await getTaxConfig();
    const gstPercent = taxes ? (taxes.cgst + taxes.sgst) : 0;
    const taxAmount = roundCurrency(amount * (gstPercent / 100));
    const totalAmount = roundCurrency(amount + taxAmount);
    return { taxAmount, totalAmount, gstPercent };
};
const ensureDefaultFolio = (timestamp) => ({
    id: nanoid(),
    name: DEFAULT_FOLIO_NAME,
    createdAt: timestamp,
    updatedAt: timestamp
});
const ensureBillForReservation = async (reservation) => {
    const bills = await billsTable.getAll();
    const existing = bills.find((bill) => bill.reservationId === reservation.id);
    if (existing) {
        return existing;
    }
    const timestamp = now();
    const record = {
        hotelId: reservation.hotelId,
        hotelCode: reservation.hotelCode,
        reservationId: reservation.id,
        folios: [ensureDefaultFolio(timestamp)],
        charges: [],
        createdAt: timestamp,
        updatedAt: timestamp
    };
    return billsTable.insert(record);
};
const resolveReservation = async (reservationId) => {
    const reservation = await reservationsTable.getById(reservationId);
    if (!reservation) {
        throw new HttpError(404, "Reservation not found");
    }
    return reservation;
};
const resolveFolio = async (bill, folioId, folioName) => {
    if (folioId) {
        const existing = bill.folios.find((folio) => folio.id === folioId);
        if (!existing) {
            throw new HttpError(404, "Folio not found");
        }
        return { bill, folioId };
    }
    if (folioName) {
        const match = bill.folios.find((folio) => folio.name.toLowerCase() === folioName.toLowerCase());
        if (match) {
            return { bill, folioId: match.id };
        }
        const timestamp = now();
        const newFolio = {
            id: nanoid(),
            name: folioName,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        const updated = await billsTable.update(bill.id, {
            folios: [...bill.folios, newFolio],
            updatedAt: timestamp
        });
        return { bill: updated, folioId: newFolio.id };
    }
    const defaultFolio = bill.folios[0];
    if (!defaultFolio) {
        const timestamp = now();
        const newFolio = ensureDefaultFolio(timestamp);
        const updated = await billsTable.update(bill.id, {
            folios: [newFolio],
            updatedAt: timestamp
        });
        return { bill: updated, folioId: newFolio.id };
    }
    return { bill, folioId: defaultFolio.id };
};
const getPaymentsForReservation = async (reservationId) => {
    const payments = await paymentsTable.getAll();
    return payments.filter((payment) => payment.reservationId === reservationId);
};
const computeTotals = (bill, payments) => {
    const subTotal = roundCurrency(bill.charges.reduce((sum, charge) => sum + charge.amount, 0));
    const taxTotal = roundCurrency(bill.charges.reduce((sum, charge) => sum + charge.taxAmount, 0));
    const grandTotal = roundCurrency(bill.charges.reduce((sum, charge) => sum + charge.totalAmount, 0));
    const paymentsTotal = roundCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0));
    const balanceDue = roundCurrency(grandTotal - paymentsTotal);
    return {
        subTotal,
        taxTotal,
        grandTotal,
        paymentsTotal,
        balanceDue
    };
};
const toBillSummary = async (bill, reservation) => {
    const payments = await getPaymentsForReservation(reservation.id);
    const totals = computeTotals(bill, payments);
    return {
        bill,
        payments,
        totals
    };
};
const syncReservationBilling = async (reservation, bill) => {
    const payments = await getPaymentsForReservation(reservation.id);
    const totals = computeTotals(bill, payments);
    const currency = reservation.billing?.currency ?? DEFAULT_CURRENCY;
    await reservationsTable.update(reservation.id, {
        billing: {
            currency,
            totalAmount: totals.grandTotal,
            balanceDue: totals.balanceDue,
            charges: bill.charges.map((charge) => ({
                description: charge.description,
                amount: charge.totalAmount
            }))
        }
    });
    return totals;
};
const ensureDatesWithinStay = (nights, stayNights) => {
    const staySet = new Set(stayNights);
    nights.forEach((night) => {
        if (!staySet.has(night)) {
            throw new HttpError(400, `Night ${night} is outside the reservation stay`);
        }
    });
};
const hasRoomChargeForDate = (bill, date) => bill.charges.some((charge) => {
    const metadata = (charge.metadata ?? {});
    return metadata.nightDate === date && charge.type === "ROOM";
});
export const postRoomCharges = async (input) => {
    const reservation = await resolveReservation(input.reservationId);
    const bill = await ensureBillForReservation(reservation);
    const stayNights = enumerateStayNights(reservation.arrivalDate, reservation.departureDate);
    if (stayNights.length === 0) {
        throw new HttpError(400, "Reservation does not span an overnight stay");
    }
    const targetNights = input.dates?.length ? input.dates.map(toISODate) : stayNights;
    ensureDatesWithinStay(targetNights, stayNights);
    const { bill: resolvedBill, folioId } = await resolveFolio(bill, input.folioId, input.folioName);
    const newCharges = [];
    for (const night of targetNights) {
        if (!hasRoomChargeForDate(resolvedBill, night)) {
            const baseAmount = input.nightlyRate ?? reservation.nightlyRate;
            const { taxAmount, totalAmount, gstPercent } = await calculateTax(reservation.hotelCode, baseAmount);
            newCharges.push({
                id: nanoid(),
                folioId,
                type: "ROOM",
                description: `Room charge for ${night}`,
                amount: baseAmount,
                taxAmount,
                totalAmount,
                postedAt: now(),
                metadata: {
                    nightDate: night,
                    rate: baseAmount,
                    gstPercent
                }
            });
        }
    }
    if (newCharges.length === 0) {
        return toBillSummary(resolvedBill, reservation);
    }
    const updated = await billsTable.update(resolvedBill.id, {
        charges: [...resolvedBill.charges, ...newCharges],
        updatedAt: now()
    });
    const totals = await syncReservationBilling(reservation, updated);
    return {
        bill: updated,
        payments: await getPaymentsForReservation(reservation.id),
        totals,
        addedCharges: newCharges
    };
};
export const addAddonCharge = async (input) => {
    if (input.amount <= 0) {
        throw new HttpError(400, "Amount must be greater than zero");
    }
    const reservation = await resolveReservation(input.reservationId);
    const bill = await ensureBillForReservation(reservation);
    const { bill: resolvedBill, folioId } = await resolveFolio(bill, input.folioId, input.folioName);
    const quantity = input.quantity && input.quantity > 0 ? input.quantity : 1;
    const baseAmount = input.amount * quantity;
    const { taxAmount, totalAmount, gstPercent } = await calculateTax(reservation.hotelCode, baseAmount);
    const charge = {
        id: nanoid(),
        folioId,
        type: "ADDON",
        description: input.description,
        amount: baseAmount,
        taxAmount,
        totalAmount,
        postedAt: now(),
        metadata: {
            quantity,
            gstPercent,
            ...(input.metadata ?? {})
        }
    };
    const updated = await billsTable.update(resolvedBill.id, {
        charges: [...resolvedBill.charges, charge],
        updatedAt: now()
    });
    const totals = await syncReservationBilling(reservation, updated);
    return {
        bill: updated,
        payments: await getPaymentsForReservation(reservation.id),
        totals,
        addedCharge: charge
    };
};
export const getBillSummary = async (reservationId) => {
    const reservation = await resolveReservation(reservationId);
    const bill = await ensureBillForReservation(reservation);
    return toBillSummary(bill, reservation);
};
export const settleBill = async (input) => {
    if (!input.payments.length) {
        throw new HttpError(400, "No payments provided");
    }
    const reservation = await resolveReservation(input.reservationId);
    const bill = await ensureBillForReservation(reservation);
    const createdPayments = [];
    let currentBill = bill;
    for (const payment of input.payments) {
        if (payment.amount <= 0) {
            throw new HttpError(400, "Payment amount must be greater than zero");
        }
        const { bill: resolvedBill, folioId } = await resolveFolio(currentBill, payment.folioId, payment.folioName);
        currentBill = resolvedBill;
        const record = {
            hotelId: reservation.hotelId,
            hotelCode: reservation.hotelCode,
            reservationId: reservation.id,
            folioId,
            amount: roundCurrency(payment.amount),
            currency: payment.currency ?? reservation.billing?.currency ?? DEFAULT_CURRENCY,
            mode: payment.mode,
            reference: payment.reference,
            receivedAt: now(),
            metadata: payment.metadata,
            createdAt: now(),
            updatedAt: now()
        };
        const inserted = await paymentsTable.insert(record);
        createdPayments.push(inserted);
    }
    const totals = await syncReservationBilling(reservation, currentBill);
    const payments = await getPaymentsForReservation(reservation.id);
    return {
        bill: currentBill,
        payments,
        totals,
        newPayments: createdPayments
    };
};
export const generateInvoice = async (reservationId) => {
    const reservation = await resolveReservation(reservationId);
    const bill = await ensureBillForReservation(reservation);
    const payments = await getPaymentsForReservation(reservation.id);
    const totals = computeTotals(bill, payments);
    const property = await getPropertyProfile();
    const taxes = await getTaxConfig();
    const guest = reservation.guestId ? await getGuestById(reservation.guestId) : undefined;
    return {
        generatedAt: now(),
        property,
        reservation,
        guest,
        bill,
        payments,
        totals,
        taxes: {
            gstPercent: taxes ? (taxes.cgst + taxes.sgst) : 0,
            serviceChargePercent: taxes?.serviceChargePercentage ?? 0
        }
    };
};
export const settleReservation = (reservation, options = {}) => {
    const charges = [...reservation.billing.charges];
    if (options.lateCheckout) {
        const lateFee = Number((reservation.billing.totalAmount * LATE_CHECKOUT_RATE).toFixed(2));
        charges.push({
            description: "Late checkout fee",
            amount: lateFee
        });
    }
    if (options.extraCharges) {
        charges.push(...options.extraCharges);
    }
    const totalAmount = charges.reduce((sum, charge) => sum + charge.amount, 0);
    return {
        billing: {
            currency: reservation.billing.currency,
            charges,
            totalAmount,
            balanceDue: 0
        }
    };
};
//# sourceMappingURL=billingService.js.map