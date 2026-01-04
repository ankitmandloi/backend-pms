import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { HttpError } from "../middlewares/errorHandler.js";
const whatsappTemplatesTable = db.whatsappTemplates;
const whatsappMessagesTable = db.whatsappMessages;
const whatsappConfigTable = db.whatsappConfig;
const reservationsTable = db.reservations;
const guestsTable = db.guests;
const now = () => new Date().toISOString();
/**
 * WhatsApp Service
 * Handles WhatsApp Business API integration:
 * - Template management
 * - Message sending with dynamic parameters
 * - Automated messages for booking lifecycle
 * - Message status tracking
 */
export const whatsappService = {
    /**
     * Get WhatsApp configuration
     */
    async getConfig(hotelId, hotelCode) {
        const configs = await whatsappConfigTable.find({ hotelId, hotelCode });
        return configs.length > 0 ? configs[0] : null;
    },
    /**
     * Create or update WhatsApp configuration
     */
    async upsertConfig(hotelId, hotelCode, input) {
        const existing = await this.getConfig(hotelId, hotelCode);
        if (existing) {
            const updated = {
                ...existing,
                ...input,
                updatedAt: now()
            };
            await whatsappConfigTable.update(existing.id, updated);
            return updated;
        }
        const config = {
            id: nanoid(),
            hotelId,
            hotelCode,
            ...input,
            createdAt: now(),
            updatedAt: now()
        };
        await whatsappConfigTable.insert(config);
        return config;
    },
    /**
     * Test WhatsApp connection
     */
    async testConnection(hotelId, hotelCode) {
        const config = await this.getConfig(hotelId, hotelCode);
        if (!config) {
            throw new HttpError(404, "WhatsApp configuration not found");
        }
        if (!config.isEnabled) {
            throw new HttpError(400, "WhatsApp is not enabled");
        }
        // Simulate connection test
        // In production, this would make actual API call to WhatsApp Business API
        const hasValidCredentials = (config.provider === "TWILIO" && config.credentials.accountSid && config.credentials.authToken) ||
            (config.provider === "META" && config.credentials.accessToken && config.credentials.phoneNumberId) ||
            (config.provider === "GUPSHUP" && config.credentials.apiKey);
        if (!hasValidCredentials) {
            config.lastTestStatus = "FAILED";
            config.lastTestError = "Invalid credentials";
            config.lastTestedAt = now();
            config.updatedAt = now();
            await whatsappConfigTable.update(config.id, config);
            return {
                success: false,
                message: "Invalid credentials configuration"
            };
        }
        config.lastTestStatus = "SUCCESS";
        config.lastTestError = undefined;
        config.lastTestedAt = now();
        config.updatedAt = now();
        await whatsappConfigTable.update(config.id, config);
        return {
            success: true,
            message: "Successfully connected to WhatsApp Business API"
        };
    },
    /**
     * Get all templates
     */
    async getTemplates(hotelId, hotelCode) {
        return await whatsappTemplatesTable.find({ hotelId, hotelCode });
    },
    /**
     * Get template by ID
     */
    async getTemplateById(id, hotelId) {
        const template = await whatsappTemplatesTable.findById(id);
        if (!template || template.hotelId !== hotelId) {
            throw new HttpError(404, "Template not found");
        }
        return template;
    },
    /**
     * Create template
     */
    async createTemplate(hotelId, hotelCode, input) {
        const template = {
            id: nanoid(),
            hotelId,
            hotelCode,
            ...input,
            createdAt: now(),
            updatedAt: now()
        };
        await whatsappTemplatesTable.insert(template);
        return template;
    },
    /**
     * Update template
     */
    async updateTemplate(id, hotelId, updates) {
        const template = await this.getTemplateById(id, hotelId);
        const updated = {
            ...template,
            ...updates,
            updatedAt: now()
        };
        await whatsappTemplatesTable.update(id, updated);
        return updated;
    },
    /**
     * Delete template
     */
    async deleteTemplate(id, hotelId) {
        await this.getTemplateById(id, hotelId);
        await whatsappTemplatesTable.delete(id);
    },
    /**
     * Send message
     */
    async sendMessage(hotelId, hotelCode, input) {
        const config = await this.getConfig(hotelId, hotelCode);
        if (!config || !config.isEnabled) {
            throw new HttpError(400, "WhatsApp is not enabled for this property");
        }
        const template = await this.getTemplateById(input.templateId, hotelId);
        if (!template.isActive) {
            throw new HttpError(400, "Template is not active");
        }
        // Validate parameters
        for (const param of template.parameters) {
            if (!input.parameters[param]) {
                throw new HttpError(400, `Missing required parameter: ${param}`);
            }
        }
        const message = {
            id: nanoid(),
            hotelId,
            hotelCode,
            templateId: template.id,
            templateType: template.type,
            recipientPhone: input.recipientPhone,
            recipientName: input.recipientName,
            parameters: input.parameters,
            status: "QUEUED",
            relatedEntityType: input.relatedEntityType,
            relatedEntityId: input.relatedEntityId,
            createdAt: now(),
            updatedAt: now()
        };
        await whatsappMessagesTable.insert(message);
        // Simulate sending (in production, this would call WhatsApp API)
        setTimeout(async () => {
            await this.updateMessageStatus(message.id, "SENT");
        }, 1000);
        return message;
    },
    /**
     * Update message status
     */
    async updateMessageStatus(messageId, status, errorMessage) {
        const message = await whatsappMessagesTable.findById(messageId);
        if (!message)
            return;
        message.status = status;
        message.updatedAt = now();
        if (status === "SENT") {
            message.sentAt = now();
        }
        else if (status === "DELIVERED") {
            message.deliveredAt = now();
        }
        else if (status === "READ") {
            message.readAt = now();
        }
        else if (status === "FAILED") {
            message.failedAt = now();
            message.errorMessage = errorMessage;
        }
        await whatsappMessagesTable.update(messageId, message);
    },
    /**
     * Get messages
     */
    async getMessages(hotelId, hotelCode, filters) {
        let messages = await whatsappMessagesTable.find({ hotelId, hotelCode });
        if (filters?.status) {
            messages = messages.filter(m => m.status === filters.status);
        }
        if (filters?.templateType) {
            messages = messages.filter(m => m.templateType === filters.templateType);
        }
        if (filters?.relatedEntityId) {
            messages = messages.filter(m => m.relatedEntityId === filters.relatedEntityId);
        }
        messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        if (filters?.limit) {
            messages = messages.slice(0, filters.limit);
        }
        return messages;
    },
    /**
     * Send booking confirmation (automated)
     */
    async sendBookingConfirmation(reservationId) {
        const reservation = await reservationsTable.findById(reservationId);
        if (!reservation)
            return null;
        const guest = await guestsTable.findById(reservation.guestId);
        if (!guest || !guest.phone)
            return null;
        const config = await this.getConfig(reservation.hotelId, reservation.hotelCode);
        if (!config || !config.isEnabled || !config.automationSettings.sendBookingConfirmation) {
            return null;
        }
        const templates = await this.getTemplates(reservation.hotelId, reservation.hotelCode);
        const template = templates.find(t => t.type === "BOOKING_CONFIRMATION" && t.isActive);
        if (!template)
            return null;
        const parameters = {
            guestName: `${guest.firstName} ${guest.lastName || ""}`.trim(),
            confirmationNumber: reservation.id.slice(0, 8).toUpperCase(),
            checkInDate: new Date(reservation.arrivalDate).toLocaleDateString(),
            checkOutDate: new Date(reservation.departureDate).toLocaleDateString(),
            roomType: reservation.roomType,
            hotelName: reservation.hotelCode
        };
        return await this.sendMessage(reservation.hotelId, reservation.hotelCode, {
            templateId: template.id,
            recipientPhone: guest.phone,
            recipientName: parameters.guestName,
            parameters,
            relatedEntityType: "RESERVATION",
            relatedEntityId: reservation.id
        });
    },
    /**
     * Send check-in reminder (automated)
     */
    async sendCheckinReminder(reservationId) {
        const reservation = await reservationsTable.findById(reservationId);
        if (!reservation || reservation.status !== "CONFIRMED")
            return null;
        const guest = await guestsTable.findById(reservation.guestId);
        if (!guest || !guest.phone)
            return null;
        const config = await this.getConfig(reservation.hotelId, reservation.hotelCode);
        if (!config || !config.isEnabled || !config.automationSettings.sendCheckinReminder) {
            return null;
        }
        const templates = await this.getTemplates(reservation.hotelId, reservation.hotelCode);
        const template = templates.find(t => t.type === "CHECKIN_REMINDER" && t.isActive);
        if (!template)
            return null;
        const parameters = {
            guestName: `${guest.firstName} ${guest.lastName || ""}`.trim(),
            checkInDate: new Date(reservation.arrivalDate).toLocaleDateString(),
            checkInTime: "2:00 PM",
            hotelName: reservation.hotelCode
        };
        return await this.sendMessage(reservation.hotelId, reservation.hotelCode, {
            templateId: template.id,
            recipientPhone: guest.phone,
            recipientName: parameters.guestName,
            parameters,
            relatedEntityType: "RESERVATION",
            relatedEntityId: reservation.id
        });
    },
    /**
     * Process automated messages (should be called by scheduler)
     */
    async processAutomatedMessages(hotelId, hotelCode) {
        const config = await this.getConfig(hotelId, hotelCode);
        if (!config || !config.isEnabled) {
            return { sent: 0, skipped: 0 };
        }
        let sent = 0;
        let skipped = 0;
        // Get upcoming check-ins
        if (config.automationSettings.sendCheckinReminder) {
            const hoursBeforeCheckin = config.automationSettings.checkinReminderHoursBefore;
            const targetDate = new Date();
            targetDate.setHours(targetDate.getHours() + hoursBeforeCheckin);
            const targetDateStr = targetDate.toISOString().split("T")[0];
            const upcomingReservations = await reservationsTable.find({
                hotelId,
                hotelCode,
                status: "CONFIRMED",
                arrivalDate: targetDateStr
            });
            for (const reservation of upcomingReservations) {
                // Check if reminder already sent
                const existingMessage = await whatsappMessagesTable.findOne({
                    hotelId,
                    relatedEntityId: reservation.id,
                    templateType: "CHECKIN_REMINDER"
                });
                if (!existingMessage) {
                    const message = await this.sendCheckinReminder(reservation.id);
                    if (message)
                        sent++;
                    else
                        skipped++;
                }
            }
        }
        return { sent, skipped };
    }
};
//# sourceMappingURL=whatsappService.js.map