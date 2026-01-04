export declare const getDashboardSummary: (hotelCode: string, date?: string) => Promise<{
    date: string;
    totals: {
        occupancyPercent: number;
        roomsSold: number;
        occupiedRooms: number;
        totalRooms: number;
        arr: number;
        revpar: number;
        roomRevenue: number;
        addonRevenue: number;
        otherRevenue: number;
        totalRevenue: number;
        paymentsCollected: number;
    };
    revenueSplit: {
        room: number;
        addon: number;
        other: number;
    };
    housekeeping: {
        pendingTasks: number;
        dirtyRooms: number;
    };
}>;
export declare const getDailyReport: (hotelCode: string, date?: string) => Promise<{
    date: string;
    summary: {
        occupancyPercent: number;
        roomsSold: number;
        occupiedRooms: number;
        totalRooms: number;
        arr: number;
        revpar: number;
        roomRevenue: number;
        addonRevenue: number;
        otherRevenue: number;
        totalRevenue: number;
        paymentsCollected: number;
    };
    arrivals: {
        count: number;
        reservations: {
            id: string;
            guestId: string;
            roomId: string | undefined;
            status: import("../types/domain.js").ReservationStatus;
            arrivalDate: string;
            departureDate: string;
        }[];
    };
    departures: {
        count: number;
        reservations: {
            id: string;
            guestId: string;
            roomId: string | undefined;
            status: import("../types/domain.js").ReservationStatus;
            arrivalDate: string;
            departureDate: string;
        }[];
    };
    stayovers: {
        count: number;
        reservations: {
            id: string;
            guestId: string;
            roomId: string | undefined;
            status: import("../types/domain.js").ReservationStatus;
            arrivalDate: string;
            departureDate: string;
        }[];
    };
}>;
export declare const getRevenueReport: (hotelCode: string, params?: {
    startDate?: string;
    endDate?: string;
}) => Promise<{
    range: {
        startDate: string;
        endDate: string;
    };
    totals: {
        roomRevenue: number;
        addonRevenue: number;
        otherRevenue: number;
        totalRevenue: number;
        paymentsCollected: number;
    };
    daily: {
        date: string;
        roomRevenue: number;
        addonRevenue: number;
        otherRevenue: number;
        totalRevenue: number;
        paymentsCollected: number;
    }[];
}>;
