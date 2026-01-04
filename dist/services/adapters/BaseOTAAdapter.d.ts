import type { OTAChannelConfig, OTAProvider } from "../../types/domain.js";
/**
 * Base OTA Adapter Interface
 * All OTA adapters must implement this interface
 */
export interface IOTAAdapter {
    provider: OTAProvider;
    /**
     * Test connection to OTA
     */
    testConnection(credentials: OTAChannelConfig["credentials"]): Promise<{
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    }>;
    /**
     * Push rates to OTA
     */
    pushRates(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], rates: RatePushData[]): Promise<OTAOperationResult>;
    /**
     * Push inventory availability to OTA
     */
    pushInventory(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], inventory: InventoryPushData[]): Promise<OTAOperationResult>;
    /**
     * Pull reservations from OTA
     */
    pullReservations(credentials: OTAChannelConfig["credentials"], dateRange: {
        from: string;
        to: string;
    }): Promise<OTAReservationData[]>;
    /**
     * Get OTA-specific room type list (for mapping)
     */
    getRoomTypes(credentials: OTAChannelConfig["credentials"]): Promise<OTARoomType[]>;
}
/**
 * Rate data to push to OTA
 */
export type RatePushData = {
    date: string;
    roomTypeId: string;
    otaRoomTypeId: string;
    rate: number;
    currency: string;
    minStay?: number;
    maxStay?: number;
    closedToArrival?: boolean;
    closedToDeparture?: boolean;
};
/**
 * Inventory data to push to OTA
 */
export type InventoryPushData = {
    date: string;
    roomTypeId: string;
    otaRoomTypeId: string;
    available: number;
    sold: number;
    blocked: number;
};
/**
 * OTA operation result
 */
export type OTAOperationResult = {
    success: boolean;
    itemsProcessed: number;
    itemsFailed: number;
    errors?: Array<{
        date?: string;
        roomTypeId?: string;
        message: string;
    }>;
    details?: Record<string, unknown>;
};
/**
 * OTA reservation data (generic format)
 */
export type OTAReservationData = {
    confirmationCode: string;
    bookingDate: string;
    guest: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        countryCode?: string;
    };
    reservation: {
        checkIn: string;
        checkOut: string;
        roomTypeId: string;
        roomTypeName: string;
        adults: number;
        children: number;
        rate: number;
        currency: string;
        totalAmount: number;
        status: "CONFIRMED" | "CANCELLED" | "MODIFIED";
        specialRequests?: string;
    };
    payment?: {
        method: string;
        status: string;
        amount: number;
    };
    rawData: Record<string, unknown>;
};
/**
 * OTA room type (for mapping)
 */
export type OTARoomType = {
    id: string;
    name: string;
    description?: string;
    maxOccupancy?: number;
    bedTypes?: string[];
};
/**
 * Abstract base class for OTA adapters
 * Provides common utilities and enforces interface
 */
export declare abstract class BaseOTAAdapter implements IOTAAdapter {
    abstract provider: OTAProvider;
    abstract testConnection(credentials: OTAChannelConfig["credentials"]): Promise<{
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    }>;
    abstract pushRates(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], rates: RatePushData[]): Promise<OTAOperationResult>;
    abstract pushInventory(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], inventory: InventoryPushData[]): Promise<OTAOperationResult>;
    abstract pullReservations(credentials: OTAChannelConfig["credentials"], dateRange: {
        from: string;
        to: string;
    }): Promise<OTAReservationData[]>;
    abstract getRoomTypes(credentials: OTAChannelConfig["credentials"]): Promise<OTARoomType[]>;
    /**
     * Helper: Validate credentials
     */
    protected validateCredentials(credentials: OTAChannelConfig["credentials"], requiredFields: string[]): void;
    /**
     * Helper: Create operation result
     */
    protected createResult(success: boolean, processed: number, failed: number, errors?: OTAOperationResult["errors"]): OTAOperationResult;
    /**
     * Helper: Simulate API delay (for development)
     */
    protected delay(ms?: number): Promise<void>;
}
