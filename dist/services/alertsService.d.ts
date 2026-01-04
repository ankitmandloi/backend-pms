import type { AlertRecord } from "../types/domain.js";
export declare const syncAlertsForHotel: (hotelCode: string) => Promise<{
    active: AlertRecord[];
    acknowledged: AlertRecord[];
    resolved: AlertRecord[];
}>;
export declare const acknowledgeAlert: (hotelCode: string, alertId: string, acknowledgedBy?: string) => Promise<AlertRecord>;
