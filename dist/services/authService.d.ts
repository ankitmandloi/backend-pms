import { type UserPayload } from "./userService.js";
import { type ShiftPayload } from "./shiftService.js";
export type LoginInput = {
    hotelCode: string;
    username: string;
    password: string;
    shiftName: string;
};
export type LoginResponse = {
    token: string;
    user: UserPayload;
    shift: ShiftPayload;
};
export declare const login: (input: LoginInput) => Promise<LoginResponse>;
export declare const logout: (userId: string) => Promise<ShiftPayload | undefined>;
export declare const getCurrentUser: (userId: string) => Promise<{
    user: UserPayload;
    shift?: ShiftPayload;
}>;
