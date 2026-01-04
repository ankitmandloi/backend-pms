import type { NightAuditRecord, NightAuditStepType } from "../types/domain.js";
/**
 * Night Audit Service
 * Handles end-of-day processing including:
 * - Shift closure validation
 * - Room revenue posting
 * - No-show processing
 * - Room status updates
 * - Report generation
 * - Business date rollover
 */
export declare const nightAuditService: {
    /**
     * Get all night audits for a hotel
     */
    getAudits(hotelId: string, hotelCode: string): Promise<NightAuditRecord[]>;
    /**
     * Get a specific night audit by ID
     */
    getAuditById(id: string, hotelId: string): Promise<NightAuditRecord>;
    /**
     * Get latest audit for a hotel
     */
    getLatestAudit(hotelId: string, hotelCode: string): Promise<NightAuditRecord | null>;
    /**
     * Check if audit is required for today
     */
    isAuditRequired(hotelId: string, hotelCode: string): Promise<boolean>;
    /**
     * Start night audit process
     */
    startAudit(hotelId: string, hotelCode: string, userId: string, businessDate?: string): Promise<NightAuditRecord>;
    /**
     * Execute all audit steps
     */
    executeAuditSteps(auditId: string, hotelId: string, hotelCode: string): Promise<void>;
    /**
     * Update step status
     */
    updateStepStatus(auditId: string, stepType: NightAuditStepType, status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED", message?: string): Promise<void>;
    /**
     * Mark audit as failed
     */
    markAuditFailed(auditId: string, errorMessage: string): Promise<void>;
    /**
     * Re-run a failed audit
     */
    retryAudit(auditId: string, hotelId: string, userId: string): Promise<NightAuditRecord>;
};
