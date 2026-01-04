import type { GuestIdDocument } from "../types/domain.js";
export declare const assignRoom: (reservationId: string, roomId: string) => Promise<import("./reservationService.js").ReservationPayload>;
export type GuestIdDocumentInput = Omit<GuestIdDocument, "capturedAt"> & {
    capturedAt?: string;
};
export declare const captureGuestId: (guestId: string, document: GuestIdDocumentInput) => Promise<import("./guestService.js").GuestPayload>;
export type CheckInInput = {
    reservationId: string;
    roomId?: string;
};
export declare const checkIn: (input: CheckInInput) => Promise<import("./reservationService.js").ReservationPayload>;
export type CheckOutInput = {
    reservationId: string;
    lateCheckout?: boolean;
    extraCharges?: {
        description: string;
        amount: number;
    }[];
};
export declare const checkOut: (input: CheckOutInput) => Promise<{
    reservation: import("./reservationService.js").ReservationPayload;
    settlement: import("./billingService.js").SettlementResult;
    nights: number;
}>;
