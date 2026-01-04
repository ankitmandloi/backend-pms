import type { OTAChannelConfig, OTAProvider, OTAReservationImport, OTASyncLog, ReservationRecord } from "../types/domain.js";
/**
 * OTA Service
 * Handles integration with Online Travel Agencies:
 * - Channel configuration and mapping
 * - Rate and inventory synchronization
 * - Reservation import from OTAs
 * - Two-way sync with booking engines
 */
export declare const otaService: {
    /**
     * Get all OTA channels for a hotel
     */
    getChannels(hotelId: string, hotelCode: string): Promise<OTAChannelConfig[]>;
    /**
     * Get a specific OTA channel
     */
    getChannelById(id: string, hotelId: string): Promise<OTAChannelConfig>;
    /**
     * Create a new OTA channel configuration
     */
    createChannel(hotelId: string, hotelCode: string, input: {
        provider: OTAProvider;
        credentials: OTAChannelConfig["credentials"];
        mappings: OTAChannelConfig["mappings"];
        syncSettings: OTAChannelConfig["syncSettings"];
    }): Promise<OTAChannelConfig>;
    /**
     * Update OTA channel configuration
     */
    updateChannel(id: string, hotelId: string, updates: Partial<Omit<OTAChannelConfig, "id" | "hotelId" | "hotelCode" | "createdAt">>): Promise<OTAChannelConfig>;
    /**
     * Delete OTA channel
     */
    deleteChannel(id: string, hotelId: string): Promise<void>;
    /**
     * Test OTA connection using adapter
     */
    testConnection(id: string, hotelId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Sync rates to OTA using adapter
     */
    syncRates(channelId: string, hotelId: string, dateRange: {
        from: string;
        to: string;
    }): Promise<OTASyncLog>;
    /**
     * Sync inventory to OTA using adapter
     */
    syncInventory(channelId: string, hotelId: string, dateRange: {
        from: string;
        to: string;
    }): Promise<OTASyncLog>;
    /**
     * Import reservation from OTA
     */
    importReservation(channelId: string, hotelId: string, otaReservationData: Record<string, unknown>): Promise<ReservationRecord>;
    /**
     * Get sync logs
     */
    getSyncLogs(hotelId: string, hotelCode: string, filters?: {
        channelId?: string;
        syncType?: OTASyncLog["syncType"];
        limit?: number;
    }): Promise<OTASyncLog[]>;
    /**
     * Get imported reservations
     */
    getImportedReservations(hotelId: string, hotelCode: string, provider?: OTAProvider): Promise<OTAReservationImport[]>;
    /**
     * Helper: Calculate days between dates
     */
    getDaysBetween(from: string, to: string): number;
    /**
     * Helper: Get array of dates in range
     */
    getDateRange(from: string, to: string): string[];
};
