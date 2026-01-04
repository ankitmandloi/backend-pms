import { HttpError } from "../middlewares/errorHandler.js";
import { db } from "../db/index.js";
import { hashPassword } from "../utils/password.js";
const usersTable = db.users;
const now = () => new Date().toISOString();
export const toUserPayload = (record) => ({
    id: record.id,
    hotelId: record.hotelId,
    hotelCode: record.hotelCode,
    username: record.username,
    email: record.email,
    displayName: record.displayName,
    roles: record.roles,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
});
export const getUsers = async (hotelCode) => {
    const records = await usersTable.getAll();
    const filtered = hotelCode ? records.filter((record) => record.hotelCode === hotelCode) : records;
    return filtered.map(toUserPayload);
};
export const getUserById = async (id) => {
    const record = await usersTable.getById(id);
    if (!record) {
        return undefined;
    }
    return toUserPayload(record);
};
export const findByHotelCodeAndUsername = async (hotelCode, username) => {
    const records = await usersTable.getAll();
    const match = records.find((record) => record.hotelCode.toLowerCase() === hotelCode.toLowerCase() && record.username.toLowerCase() === username.toLowerCase());
    return match ?? undefined;
};
export const createUser = async (input) => {
    const existing = await findByHotelCodeAndUsername(input.hotelCode, input.username);
    if (existing) {
        throw new HttpError(409, "Username already exists for this hotel");
    }
    const timestamp = now();
    const passwordHash = await hashPassword(input.password);
    const record = {
        hotelId: input.hotelId,
        hotelCode: input.hotelCode,
        username: input.username,
        email: input.email,
        displayName: input.displayName,
        roles: input.roles,
        passwordHash,
        status: input.status ?? "ACTIVE",
        createdAt: timestamp,
        updatedAt: timestamp
    };
    const inserted = await usersTable.insert(record);
    return toUserPayload(inserted);
};
export const updateUser = async (id, input) => {
    const existing = await usersTable.getById(id);
    if (!existing) {
        throw new HttpError(404, "User not found");
    }
    let passwordHash = existing.passwordHash;
    if (input.password) {
        passwordHash = await hashPassword(input.password);
    }
    const updatedRecord = {
        email: input.email ?? existing.email,
        displayName: input.displayName ?? existing.displayName,
        roles: input.roles ?? existing.roles,
        status: input.status ?? existing.status,
        passwordHash,
        updatedAt: now()
    };
    const updated = await usersTable.update(id, updatedRecord);
    return toUserPayload(updated);
};
//# sourceMappingURL=userService.js.map