import type { WhatsAppTemplate, WhatsAppTemplateType, WhatsAppMessage, WhatsAppConfig } from "../types/domain.js";
/**
 * WhatsApp Service
 * Handles WhatsApp Business API integration:
 * - Template management
 * - Message sending with dynamic parameters
 * - Automated messages for booking lifecycle
 * - Message status tracking
 */
export declare const whatsappService: {
    /**
     * Get WhatsApp configuration
     */
    getConfig(hotelId: string, hotelCode: string): Promise<WhatsAppConfig | null>;
    /**
     * Create or update WhatsApp configuration
     */
    upsertConfig(hotelId: string, hotelCode: string, input: Omit<WhatsAppConfig, "id" | "hotelId" | "hotelCode" | "createdAt" | "updatedAt">): Promise<WhatsAppConfig>;
    /**
     * Test WhatsApp connection
     */
    testConnection(hotelId: string, hotelCode: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get all templates
     */
    getTemplates(hotelId: string, hotelCode: string): Promise<WhatsAppTemplate[]>;
    /**
     * Get template by ID
     */
    getTemplateById(id: string, hotelId: string): Promise<WhatsAppTemplate>;
    /**
     * Create template
     */
    createTemplate(hotelId: string, hotelCode: string, input: Omit<WhatsAppTemplate, "id" | "hotelId" | "hotelCode" | "createdAt" | "updatedAt">): Promise<WhatsAppTemplate>;
    /**
     * Update template
     */
    updateTemplate(id: string, hotelId: string, updates: Partial<Omit<WhatsAppTemplate, "id" | "hotelId" | "hotelCode" | "createdAt">>): Promise<WhatsAppTemplate>;
    /**
     * Delete template
     */
    deleteTemplate(id: string, hotelId: string): Promise<void>;
    /**
     * Send message
     */
    sendMessage(hotelId: string, hotelCode: string, input: {
        templateId: string;
        recipientPhone: string;
        recipientName?: string;
        parameters: Record<string, string>;
        relatedEntityType?: "RESERVATION" | "GUEST" | "BILL";
        relatedEntityId?: string;
    }): Promise<WhatsAppMessage>;
    /**
     * Update message status
     */
    updateMessageStatus(messageId: string, status: WhatsAppMessage["status"], errorMessage?: string): Promise<void>;
    /**
     * Get messages
     */
    getMessages(hotelId: string, hotelCode: string, filters?: {
        status?: WhatsAppMessage["status"];
        templateType?: WhatsAppTemplateType;
        relatedEntityId?: string;
        limit?: number;
    }): Promise<WhatsAppMessage[]>;
    /**
     * Send booking confirmation (automated)
     */
    sendBookingConfirmation(reservationId: string): Promise<WhatsAppMessage | null>;
    /**
     * Send check-in reminder (automated)
     */
    sendCheckinReminder(reservationId: string): Promise<WhatsAppMessage | null>;
    /**
     * Process automated messages (should be called by scheduler)
     */
    processAutomatedMessages(hotelId: string, hotelCode: string): Promise<{
        sent: number;
        skipped: number;
    }>;
};
