import { HttpError } from "../middlewares/errorHandler.js";
import { db } from "../db/index.js";
const shiftsTable = db.shifts;
const now = () => new Date().toISOString();
const toPayload = (record) => ({
    id: record.id,
    hotelId: record.hotelId,
    hotelCode: record.hotelCode,
    userId: record.userId,
    shiftName: record.shiftName,
    startedAt: record.startedAt,
    endedAt: record.endedAt,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
});
export const getActiveShiftForUser = async (userId) => {
    const records = await shiftsTable.getAll();
    const active = records.find((record) => record.userId === userId && record.isActive);
    return active ? toPayload(active) : undefined;
};
export const getActiveShifts = async (hotelCode) => {
    const records = await shiftsTable.getAll();
    const filtered = records.filter((record) => record.isActive && (!hotelCode || record.hotelCode === hotelCode));
    return filtered.map(toPayload);
};
export const startShift = async (input) => {
    const existing = await shiftsTable.getAll();
    const activeForUser = existing.find((record) => record.userId === input.userId && record.isActive);
    if (activeForUser) {
        await shiftsTable.update(activeForUser.id, {
            isActive: false,
            endedAt: now(),
            updatedAt: now()
        });
    }
    const timestamp = now();
    const record = {
        hotelId: input.hotelId,
        hotelCode: input.hotelCode,
        userId: input.userId,
        shiftName: input.shiftName,
        startedAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
        isActive: true
    };
    const inserted = await shiftsTable.insert(record);
    return toPayload(inserted);
};
export const endShiftById = async (shiftId) => {
    const record = await shiftsTable.getById(shiftId);
    if (!record) {
        throw new HttpError(404, "Shift not found");
    }
    if (!record.isActive) {
        return toPayload(record);
    }
    const updated = await shiftsTable.update(record.id, {
        isActive: false,
        endedAt: now(),
        updatedAt: now()
    });
    return toPayload(updated);
};
export const endActiveShiftForUser = async (userId) => {
    const active = await getActiveShiftForUser(userId);
    if (!active) {
        return undefined;
    }
    return endShiftById(active.id);
};
//# sourceMappingURL=shiftService.js.map