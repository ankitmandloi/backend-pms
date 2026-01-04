import { BaseOTAAdapter, type OTAOperationResult, type OTAReservationData, type OTARoomType, type RatePushData, type InventoryPushData } from "./BaseOTAAdapter.js";
import type { OTAChannelConfig, OTAProvider } from "../../types/domain.js";
/**
 * MakeMyTrip Adapter
 * Implements MakeMyTrip-specific API integration
 *
 * Note: This is a simulated implementation for development.
 * In production, replace with actual MakeMyTrip API calls.
 */
export declare class MakeMyTripAdapter extends BaseOTAAdapter {
    provider: OTAProvider;
    /**
     * Test connection to MakeMyTrip
     */
    testConnection(credentials: OTAChannelConfig["credentials"]): Promise<{
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    }>;
    /**
     * Push rates to MakeMyTrip
     */
    pushRates(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], rates: RatePushData[]): Promise<OTAOperationResult>;
    /**
     * Push inventory to MakeMyTrip
     */
    pushInventory(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], inventory: InventoryPushData[]): Promise<OTAOperationResult>;
    /**
     * Pull reservations from MakeMyTrip
     */
    pullReservations(credentials: OTAChannelConfig["credentials"], dateRange: {
        from: string;
        to: string;
    }): Promise<OTAReservationData[]>;
    /**
     * Get MakeMyTrip room types for mapping
     */
    getRoomTypes(credentials: OTAChannelConfig["credentials"]): Promise<OTARoomType[]>;
}
