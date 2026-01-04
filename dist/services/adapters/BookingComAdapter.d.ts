import { BaseOTAAdapter, type OTAOperationResult, type OTAReservationData, type OTARoomType, type RatePushData, type InventoryPushData } from "./BaseOTAAdapter.js";
import type { OTAChannelConfig, OTAProvider } from "../../types/domain.js";
/**
 * Booking.com Adapter
 * Implements Booking.com Channel Manager API (v2.1)
 *
 * PRODUCTION READY STRUCTURE:
 * - Real API endpoints configured
 * - Proper authentication flow
 * - Error handling with retries
 * - Rate limiting compliance
 *
 * TO ENABLE REAL INTEGRATION:
 * 1. Obtain API credentials from https://partner.booking.com/
 * 2. Set BOOKING_COM_API_ENABLED=true in environment
 * 3. Configure credentials in channel manager UI
 * 4. Test in sandbox environment first
 *
 * API Documentation: https://connect.booking.com/user_guide/
 */
export declare class BookingComAdapter extends BaseOTAAdapter {
    provider: OTAProvider;
    private readonly USE_REAL_API;
    private readonly API_BASE_URL;
    private readonly SANDBOX_URL;
    /**
     * Test connection to Booking.com
     * Verifies credentials and property access
     */
    testConnection(credentials: OTAChannelConfig["credentials"]): Promise<{
        success: boolean;
        message: string;
        details?: Record<string, unknown>;
    }>;
    /**
     * Push rates to Booking.com
     * Updates room rates for specified date ranges
     */
    pushRates(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], rates: RatePushData[]): Promise<OTAOperationResult>;
    /**
     * Push inventory to Booking.com
     * Updates room availability for specified dates
     */
    pushInventory(credentials: OTAChannelConfig["credentials"], mappings: OTAChannelConfig["mappings"], inventory: InventoryPushData[]): Promise<OTAOperationResult>;
    /**
     * Pull reservations from Booking.com
     */
    pullReservations(credentials: OTAChannelConfig["credentials"], dateRange: {
        from: string;
        to: string;
    }): Promise<OTAReservationData[]>;
    /**
     * Get Booking.com room types for mapping
     */
    getRoomTypes(credentials: OTAChannelConfig["credentials"]): Promise<OTARoomType[]>;
}
