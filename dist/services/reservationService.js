import { HttpError } from "../middlewares/errorHandler.js";
import { db } from "../db/index.js";
import { recordGuestStay } from "./guestService.js";
import { listRooms } from "./propertyService.js";
const reservationsTable = db.reservations;
const roomsTable = db.rooms;
const ACTIVE_RESERVATION_STATUSES = ["DRAFT", "CONFIRMED", "CHECKED_IN"];
const now = () => new Date().toISOString();
const toDate = (value) => new Date(value);
const normalizeRatePlan = (value) => {
    const allowed = ["BAR", "CORPORATE", "PACKAGE"];
    if (!allowed.includes(value)) {
        throw new HttpError(400, "Invalid rate plan");
    }
    return value;
};
const normalizeSource = (value) => {
    const allowed = ["DIRECT", "OTA", "CORPORATE", "WALK_IN"];
    if (!allowed.includes(value)) {
        throw new HttpError(400, "Invalid reservation source");
    }
    return value;
};
export const nightsBetween = (arrival, departure) => {
    const start = toDate(arrival);
    const end = toDate(departure);
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) {
        throw new HttpError(400, "Departure must be after arrival");
    }
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
const rangesOverlap = (startA, endA, startB, endB) => {
    const aStart = toDate(startA);
    const aEnd = toDate(endA);
    const bStart = toDate(startB);
    const bEnd = toDate(endB);
    return aStart < bEnd && bStart < aEnd;
};
const computeBilling = (nightlyRate, nights, currency = "INR") => {
    const base = nightlyRate * nights;
    return {
        currency,
        totalAmount: base,
        balanceDue: base,
        charges: [
            {
                description: `${nights} night(s) @ ${nightlyRate.toFixed(2)} ${currency}`,
                amount: base
            }
        ]
    };
};
export const ensureRoomAvailable = async (roomId, arrivalDate, departureDate, reservationIdToIgnore) => {
    const reservations = await reservationsTable.getAll();
    const conflicting = reservations.find((reservation) => {
        if (!reservation.roomId) {
            return false;
        }
        if (reservation.roomId !== roomId) {
            return false;
        }
        if (reservationIdToIgnore && reservation.id === reservationIdToIgnore) {
            return false;
        }
        if (!ACTIVE_RESERVATION_STATUSES.includes(reservation.status)) {
            return false;
        }
        return rangesOverlap(reservation.arrivalDate, reservation.departureDate, arrivalDate, departureDate);
    });
    if (conflicting) {
        throw new HttpError(409, "Room is not available for the selected dates");
    }
};
export const ensureRoomBelongsToHotel = (room, hotelCode) => {
    if (!room || room.hotelCode !== hotelCode) {
        throw new HttpError(400, "Room does not belong to this property");
    }
};
const ensureAvailabilityForType = async (hotelCode, roomType, arrivalDate, departureDate, reservationIdToIgnore) => {
    const rooms = await roomsTable.getAll();
    const relevantRooms = rooms.filter((room) => room.hotelCode === hotelCode && room.type === roomType);
    if (relevantRooms.length === 0) {
        throw new HttpError(400, "No rooms available for the specified type");
    }
    let availableCount = 0;
    for (const room of relevantRooms) {
        try {
            await ensureRoomAvailable(room.id, arrivalDate, departureDate, reservationIdToIgnore);
            availableCount += 1;
        }
        catch {
            // ignore conflict
        }
    }
    if (availableCount === 0) {
        throw new HttpError(409, "No availability for the requested room type and dates");
    }
};
const toPayload = (reservation) => ({
    ...reservation,
    billing: reservation.billing
});
export const listReservations = async (hotelCode) => {
    const records = await reservationsTable.getAll();
    const filtered = hotelCode ? records.filter((reservation) => reservation.hotelCode === hotelCode) : records;
    return filtered.map(toPayload);
};
export const getReservationById = async (id) => {
    const record = await reservationsTable.getById(id);
    return record ? toPayload(record) : undefined;
};
export const createReservation = async (input) => {
    const nights = nightsBetween(input.arrivalDate, input.departureDate);
    const ratePlan = normalizeRatePlan(input.ratePlan);
    const source = normalizeSource(input.source);
    const status = input.status ?? (input.isWalkIn ? "CHECKED_IN" : "CONFIRMED");
    let roomType = input.roomType;
    if (!roomType) {
        throw new HttpError(400, "roomType is required");
    }
    if (input.roomId) {
        const room = await roomsTable.getById(input.roomId);
        ensureRoomBelongsToHotel(room, input.hotelCode);
        if (input.roomType && room && room.type !== input.roomType) {
            throw new HttpError(400, "Room type does not match selected room");
        }
        if (room) {
            roomType = room.type;
        }
        await ensureRoomAvailable(input.roomId, input.arrivalDate, input.departureDate);
    }
    else {
        await ensureAvailabilityForType(input.hotelCode, roomType, input.arrivalDate, input.departureDate);
    }
    const billing = computeBilling(input.nightlyRate, nights, input.currency);
    const timestamp = now();
    const record = {
        hotelId: input.hotelId,
        hotelCode: input.hotelCode,
        guestId: input.guestId,
        roomType,
        roomId: input.roomId,
        status,
        arrivalDate: input.arrivalDate,
        departureDate: input.departureDate,
        adults: input.adults,
        children: input.children,
        nightlyRate: input.nightlyRate,
        ratePlan,
        source,
        otaReference: input.otaReference,
        isWalkIn: input.isWalkIn ?? false,
        notes: input.notes,
        billing,
        checkInAt: status === "CHECKED_IN" ? timestamp : undefined,
        checkOutAt: undefined,
        createdAt: timestamp,
        updatedAt: timestamp
    };
    const inserted = await reservationsTable.insert(record);
    await recordGuestStay(inserted.guestId, inserted.id);
    return toPayload(inserted);
};
const assertEditable = (reservation) => {
    if (reservation.status === "CHECKED_OUT") {
        throw new HttpError(400, "Cannot modify a checked-out reservation");
    }
};
export const updateReservation = async (id, input) => {
    const existing = await reservationsTable.getById(id);
    if (!existing) {
        throw new HttpError(404, "Reservation not found");
    }
    assertEditable(existing);
    const arrivalDate = input.arrivalDate ?? existing.arrivalDate;
    const departureDate = input.departureDate ?? existing.departureDate;
    const nights = nightsBetween(arrivalDate, departureDate);
    let roomId = input.roomId ?? existing.roomId;
    let roomType = input.roomType ?? existing.roomType;
    if (roomId) {
        const room = await roomsTable.getById(roomId);
        ensureRoomBelongsToHotel(room, existing.hotelCode);
        if (input.roomType && room && room.type !== input.roomType) {
            throw new HttpError(400, "Room type does not match selected room");
        }
        roomType = room?.type ?? roomType;
        await ensureRoomAvailable(roomId, arrivalDate, departureDate, existing.id);
    }
    else {
        await ensureAvailabilityForType(existing.hotelCode, roomType, arrivalDate, departureDate, existing.id);
    }
    const ratePlan = input.ratePlan ? normalizeRatePlan(input.ratePlan) : existing.ratePlan;
    const source = input.source ? normalizeSource(input.source) : existing.source;
    const updates = {
        roomId,
        roomType,
        status: input.status ?? existing.status,
        arrivalDate,
        departureDate,
        adults: input.adults ?? existing.adults,
        children: input.children ?? existing.children,
        nightlyRate: input.nightlyRate ?? existing.nightlyRate,
        ratePlan,
        source,
        otaReference: input.otaReference ?? existing.otaReference,
        isWalkIn: input.isWalkIn ?? existing.isWalkIn,
        notes: input.notes ?? existing.notes,
        billing: computeBilling(input.nightlyRate ?? existing.nightlyRate, nights, input.currency ?? existing.billing.currency),
        updatedAt: now()
    };
    if (input.status === "CHECKED_IN" && !existing.checkInAt) {
        updates.checkInAt = now();
    }
    if (input.status === "CHECKED_OUT" && !existing.checkOutAt) {
        updates.checkOutAt = now();
    }
    const updated = await reservationsTable.update(id, updates);
    return toPayload(updated);
};
export const deleteReservation = async (id) => {
    const existing = await reservationsTable.getById(id);
    if (!existing) {
        throw new HttpError(404, "Reservation not found");
    }
    if (existing.status === "CHECKED_IN" || existing.status === "CHECKED_OUT") {
        throw new HttpError(400, "Cannot delete reservation during or after stay");
    }
    await reservationsTable.delete(id);
};
export const getAvailability = async (hotelCode, query) => {
    const rooms = await listRooms();
    const relevantRooms = rooms.filter((room) => room.hotelCode === hotelCode && (!query.roomType || room.type === query.roomType));
    const availableRooms = [];
    for (const room of relevantRooms) {
        try {
            await ensureRoomAvailable(room.id, query.arrivalDate, query.departureDate);
            availableRooms.push(room);
        }
        catch {
            // skip
        }
    }
    return {
        arrivalDate: query.arrivalDate,
        departureDate: query.departureDate,
        roomType: query.roomType,
        availableRooms,
        totalAvailable: availableRooms.length
    };
};
//# sourceMappingURL=reservationService.js.map