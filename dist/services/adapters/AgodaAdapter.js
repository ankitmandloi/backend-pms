import { BaseOTAAdapter } from "./BaseOTAAdapter.js";
/**
 * Agoda Adapter (STUB)
 * Placeholder for future Agoda integration
 *
 * Note: This is a stub implementation showing the adapter pattern.
 * Implement actual Agoda API calls when integration is needed.
 */
export class AgodaAdapter extends BaseOTAAdapter {
    constructor() {
        super(...arguments);
        this.provider = "AIRBNB"; // Using AIRBNB as Agoda not in type
    }
    /**
     * Test connection to Agoda
     */
    async testConnection(credentials) {
        try {
            this.validateCredentials(credentials, ["hotelId", "apiKey"]);
            await this.delay(500);
            return {
                success: true,
                message: "Agoda adapter is a stub - integration pending",
                details: {
                    note: "This adapter will be implemented when Agoda integration is required",
                    hotelId: credentials.hotelId
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : "Connection failed",
                details: { error: String(error) }
            };
        }
    }
    /**
     * Push rates to Agoda (STUB)
     */
    async pushRates(credentials, mappings, rates) {
        await this.delay(300);
        return this.createResult(true, rates.length, 0, [
            { message: "Agoda adapter stub - no actual sync performed" }
        ]);
    }
    /**
     * Push inventory to Agoda (STUB)
     */
    async pushInventory(credentials, mappings, inventory) {
        await this.delay(300);
        return this.createResult(true, inventory.length, 0, [
            { message: "Agoda adapter stub - no actual sync performed" }
        ]);
    }
    /**
     * Pull reservations from Agoda (STUB)
     */
    async pullReservations(credentials, dateRange) {
        await this.delay(300);
        // Return empty array - no actual reservations
        return [];
    }
    /**
     * Get Agoda room types (STUB)
     */
    async getRoomTypes(credentials) {
        await this.delay(300);
        // Return placeholder room types
        return [
            {
                id: "agoda-placeholder-001",
                name: "Placeholder Room Type",
                description: "This is a placeholder - implement actual API call"
            }
        ];
    }
}
//# sourceMappingURL=AgodaAdapter.js.map