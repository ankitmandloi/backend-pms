import { BaseOTAAdapter, type OTAOperationResult, type OTAReservationData, type OTARoomType, type RatePushData, type InventoryPushData } from "./BaseOTAAdapter.js";
import type { OTAChannelConfig, OTAProvider } from "../../types/domain.js";
/**
 * Agoda Adapter (STUB)
 * Placeholder for future Agoda integration
 *
 * Note: This is a stub implementation showing the adapter pattern.
 * Implement actual Agoda API calls when integration is needed.
 */
export declare class AgodaAdapter extends BaseOTAAdapter {
    provider: OTAProvider;
    /**
     * Test connection to Agoda
     */
    testConnection(credentials: OTAChannelConfig["credentials"]): Promise<{
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    }>;
    /**
     * Push rates to Agoda (STUB)
     */
    pushRates(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], rates: RatePushData[]): Promise<OTAOperationResult>;
    /**
     * Push inventory to Agoda (STUB)
     */
    pushInventory(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], inventory: InventoryPushData[]): Promise<OTAOperationResult>;
    /**
     * Pull reservations from Agoda (STUB)
     */
    pullReservations(credentials: OTAChannelConfig["credentials"], dateRange: {
        from: string;
        to: string;
    }): Promise<OTAReservationData[]>;
    /**
     * Get Agoda room types (STUB)
     */
    getRoomTypes(credentials: OTAChannelConfig["credentials"]): Promise<OTARoomType[]>;
}
