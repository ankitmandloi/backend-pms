import { HttpError } from "../middlewares/errorHandler.js";
import { db } from "../db/index.js";
import { ensureRoomAvailable, ensureRoomBelongsToHotel, getReservationById, nightsBetween } from "./reservationService.js";
import { addGuestIdDocument, getGuestById } from "./guestService.js";
import { settleReservation } from "./billingService.js";
const reservationsTable = db.reservations;
const roomsTable = db.rooms;
const now = () => new Date().toISOString();
const getReservationOrThrow = async (reservationId) => {
    const reservation = await reservationsTable.getById(reservationId);
    if (!reservation) {
        throw new HttpError(404, "Reservation not found");
    }
    return reservation;
};
const getRoomOrThrow = async (roomId) => {
    const room = await roomsTable.getById(roomId);
    if (!room) {
        throw new HttpError(404, "Room not found");
    }
    return room;
};
export const assignRoom = async (reservationId, roomId) => {
    const reservation = await getReservationOrThrow(reservationId);
    const room = await getRoomOrThrow(roomId);
    ensureRoomBelongsToHotel(room, reservation.hotelCode);
    await ensureRoomAvailable(room.id, reservation.arrivalDate, reservation.departureDate, reservation.id);
    await reservationsTable.update(reservation.id, {
        roomId: room.id,
        roomType: room.type,
        updatedAt: now()
    });
    const payload = await getReservationById(reservation.id);
    if (!payload) {
        throw new HttpError(500, "Unable to load updated reservation");
    }
    return payload;
};
export const captureGuestId = async (guestId, document) => {
    const guest = await getGuestById(guestId);
    if (!guest) {
        throw new HttpError(404, "Guest not found");
    }
    const payload = await addGuestIdDocument(guestId, {
        ...document,
        capturedAt: document.capturedAt ?? now()
    });
    return payload;
};
export const checkIn = async (input) => {
    const reservation = await getReservationOrThrow(input.reservationId);
    if (!["CONFIRMED", "DRAFT"].includes(reservation.status)) {
        throw new HttpError(400, "Reservation cannot be checked in from current status");
    }
    const roomId = input.roomId ?? reservation.roomId;
    if (!roomId) {
        throw new HttpError(400, "Room assignment is required for check-in");
    }
    const room = await getRoomOrThrow(roomId);
    ensureRoomBelongsToHotel(room, reservation.hotelCode);
    await ensureRoomAvailable(room.id, reservation.arrivalDate, reservation.departureDate, reservation.id);
    const timestamp = now();
    const previousReservation = { ...reservation };
    await reservationsTable.update(reservation.id, {
        status: "CHECKED_IN",
        roomId: room.id,
        roomType: room.type,
        checkInAt: timestamp,
        updatedAt: timestamp
    });
    try {
        await roomsTable.update(room.id, { status: "OCCUPIED", updatedAt: timestamp });
    }
    catch (error) {
        await reservationsTable.update(reservation.id, previousReservation);
        throw error;
    }
    const payload = await getReservationById(reservation.id);
    if (!payload) {
        throw new HttpError(500, "Unable to load updated reservation");
    }
    return payload;
};
export const checkOut = async (input) => {
    const reservation = await getReservationOrThrow(input.reservationId);
    if (reservation.status !== "CHECKED_IN") {
        throw new HttpError(400, "Reservation is not currently checked in");
    }
    if (!reservation.roomId) {
        throw new HttpError(400, "Reservation does not have an assigned room");
    }
    const room = await getRoomOrThrow(reservation.roomId);
    const nights = nightsBetween(reservation.arrivalDate, reservation.departureDate);
    const settlement = settleReservation(reservation, {
        lateCheckout: input.lateCheckout,
        extraCharges: input.extraCharges
    });
    const timestamp = now();
    const previousReservation = { ...reservation };
    await reservationsTable.update(reservation.id, {
        status: "CHECKED_OUT",
        checkOutAt: timestamp,
        billing: settlement.billing,
        updatedAt: timestamp
    });
    try {
        await roomsTable.update(room.id, { status: "DIRTY", updatedAt: timestamp });
    }
    catch (error) {
        await reservationsTable.update(reservation.id, previousReservation);
        throw error;
    }
    const payload = await getReservationById(reservation.id);
    if (!payload) {
        throw new HttpError(500, "Unable to load updated reservation");
    }
    return {
        reservation: payload,
        settlement,
        nights
    };
};
//# sourceMappingURL=checkinService.js.map