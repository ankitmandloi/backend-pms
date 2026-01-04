import type { IOTAAdapter } from "./BaseOTAAdapter.js";
import type { OTAProvider } from "../../types/domain.js";
export * from "./BaseOTAAdapter.js";
export * from "./BookingComAdapter.js";
export * from "./MakeMyTripAdapter.js";
export * from "./AgodaAdapter.js";
/**
 * OTA Adapter Registry
 * Central registry for all OTA adapters
 */
export declare class OTAAdapterRegistry {
    private static adapters;
    /**
     * Initialize all adapters
     */
    static initialize(): void;
    /**
     * Get adapter for a provider
     */
    static getAdapter(provider: OTAProvider): IOTAAdapter;
    /**
     * Check if adapter exists for provider
     */
    static hasAdapter(provider: OTAProvider): boolean;
    /**
     * Get all available providers
     */
    static getAvailableProviders(): OTAProvider[];
}
