import type { Role } from "../types/auth.js";
import type { UserRecord, UserStatus } from "../types/domain.js";
export type UserPayload = {
    id: string;
    hotelId: string;
    hotelCode: string;
    username: string;
    email: string;
    displayName: string;
    roles: Role[];
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
};
export type CreateUserInput = {
    hotelId: string;
    hotelCode: string;
    username: string;
    email: string;
    displayName: string;
    password: string;
    roles: Role[];
    status?: UserStatus;
};
export type UpdateUserInput = Partial<{
    email: string;
    displayName: string;
    password: string;
    roles: Role[];
    status: UserStatus;
}>;
export declare const toUserPayload: (record: UserRecord) => UserPayload;
export declare const getUsers: (hotelCode?: string) => Promise<UserPayload[]>;
export declare const getUserById: (id: string) => Promise<UserPayload | undefined>;
export declare const findByHotelCodeAndUsername: (hotelCode: string, username: string) => Promise<UserRecord | undefined>;
export declare const createUser: (input: CreateUserInput) => Promise<UserPayload>;
export declare const updateUser: (id: string, input: UpdateUserInput) => Promise<UserPayload>;
