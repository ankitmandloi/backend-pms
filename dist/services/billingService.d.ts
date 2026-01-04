import type { BillCharge, BillRecord, PaymentMode, PaymentRecord, ReservationBilling, ReservationCharge, ReservationRecord } from "../types/domain.js";
import { type GuestPayload } from "./guestService.js";
import { getPropertyProfile } from "./propertyService.js";
type BillTotals = {
    subTotal: number;
    taxTotal: number;
    grandTotal: number;
    paymentsTotal: number;
    balanceDue: number;
};
export type RoomChargeInput = {
    reservationId: string;
    dates?: string[];
    folioId?: string;
    folioName?: string;
    nightlyRate?: number;
};
export type AddonChargeInput = {
    reservationId: string;
    description: string;
    amount: number;
    quantity?: number;
    folioId?: string;
    folioName?: string;
    metadata?: Record<string, unknown>;
};
export type SettlementPaymentInput = {
    amount: number;
    mode: PaymentMode;
    reference?: string;
    folioId?: string;
    folioName?: string;
    currency?: string;
    metadata?: Record<string, unknown>;
};
export type SettleBillInput = {
    reservationId: string;
    payments: SettlementPaymentInput[];
};
export declare const postRoomCharges: (input: RoomChargeInput) => Promise<{
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
} | {
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
    addedCharges: BillCharge[];
}>;
export declare const addAddonCharge: (input: AddonChargeInput) => Promise<{
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
    addedCharge: BillCharge;
}>;
export declare const getBillSummary: (reservationId: string) => Promise<{
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
}>;
export declare const settleBill: (input: SettleBillInput) => Promise<{
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
    newPayments: PaymentRecord[];
}>;
export type InvoicePayload = {
    generatedAt: string;
    property: Awaited<ReturnType<typeof getPropertyProfile>>;
    reservation: ReservationRecord;
    guest?: GuestPayload;
    bill: BillRecord;
    payments: PaymentRecord[];
    totals: BillTotals;
    taxes: {
        gstPercent: number;
        serviceChargePercent: number;
    };
};
export declare const generateInvoice: (reservationId: string) => Promise<InvoicePayload>;
export type SettlementOptions = {
    lateCheckout?: boolean;
    extraCharges?: ReservationCharge[];
};
export type SettlementResult = {
    billing: ReservationBilling;
};
export declare const settleReservation: (reservation: ReservationRecord, options?: SettlementOptions) => SettlementResult;
export {};
