/**
 * Abstract base class for OTA adapters
 * Provides common utilities and enforces interface
 */
export class BaseOTAAdapter {
    /**
     * Helper: Validate credentials
     */
    validateCredentials(credentials, requiredFields) {
        for (const field of requiredFields) {
            if (!credentials[field]) {
                throw new Error(`Missing required credential: ${field}`);
            }
        }
    }
    /**
     * Helper: Create operation result
     */
    createResult(success, processed, failed, errors) {
        return {
            success,
            itemsProcessed: processed,
            itemsFailed: failed,
            errors: errors && errors.length > 0 ? errors : undefined
        };
    }
    /**
     * Helper: Simulate API delay (for development)
     */
    async delay(ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=BaseOTAAdapter.js.map