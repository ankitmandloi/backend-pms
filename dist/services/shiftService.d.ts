export type ShiftPayload = {
    id: string;
    hotelId: string;
    hotelCode: string;
    userId: string;
    shiftName: string;
    startedAt: string;
    endedAt?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};
export type StartShiftInput = {
    hotelId: string;
    hotelCode: string;
    userId: string;
    shiftName: string;
};
export declare const getActiveShiftForUser: (userId: string) => Promise<ShiftPayload | undefined>;
export declare const getActiveShifts: (hotelCode?: string) => Promise<ShiftPayload[]>;
export declare const startShift: (input: StartShiftInput) => Promise<ShiftPayload>;
export declare const endShiftById: (shiftId: string) => Promise<ShiftPayload>;
export declare const endActiveShiftForUser: (userId: string) => Promise<ShiftPayload | undefined>;
