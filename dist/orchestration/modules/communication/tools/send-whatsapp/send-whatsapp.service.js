"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendWhatsappService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const twilio_1 = require("twilio");
const phone_normalize_1 = require("../../../../utils/phone-normalize");
let SendWhatsappService = class SendWhatsappService {
    client = null;
    lastConfigHash = '';
    sendWhatsappSchema = zod_1.z.object({
        to_number: zod_1.z
            .string()
            .min(1, 'Phone number is required')
            .describe('Recipient WhatsApp phone number'),
        body: zod_1.z
            .string()
            .min(1, 'WhatsApp message cannot be empty')
            .max(4096, 'Message must not exceed 4096 characters')
            .describe('WhatsApp message content'),
    });
    getClient() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const configHash = `${accountSid}:${authToken}`;
        if (this.client && this.lastConfigHash === configHash) {
            return this.client;
        }
        if (!accountSid || !authToken) {
            return null;
        }
        this.client = new twilio_1.Twilio(accountSid, authToken);
        this.lastConfigHash = configHash;
        return this.client;
    }
    async execute(input, state) {
        const { to_number, body } = input;
        const { user_id, company_id, campaign_id } = state;
        try {
            const client = this.getClient();
            const fromNumber = process.env.TWILIO_PHONE_NUMBER;
            if (!client || !fromNumber) {
                return `❌ **Twilio Configuration Error**

Missing required environment variables for WhatsApp.`;
            }
            if (!body || body.trim().length === 0) {
                return '❌ **Validation Error:** WhatsApp message body cannot be empty.';
            }
            if (body.length > 4096) {
                return `❌ **Validation Error:** Message is too long (${body.length} characters).`;
            }
            if (!to_number || to_number.trim().length === 0) {
                return '❌ **Validation Error:** Recipient phone number is required.';
            }
            let normalized;
            try {
                normalized = (0, phone_normalize_1.normalizeToE164)(to_number);
            }
            catch {
                return `❌ **Phone Number Error:** Could not normalize "${to_number}".`;
            }
            const formattedFrom = fromNumber.startsWith('whatsapp:')
                ? fromNumber
                : `whatsapp:${fromNumber}`;
            const formattedTo = normalized.startsWith('whatsapp:')
                ? normalized
                : `whatsapp:${normalized}`;
            const message = await client.messages.create({
                body: body.trim(),
                from: formattedFrom,
                to: formattedTo,
            });
            await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'WhatsApp',
                    status: 'Sent',
                    content: body.trim(),
                    recipient: normalized,
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
                },
            });
            return `✅ **WhatsApp Message Sent Successfully!**

**Recipient:** ${normalized}
**Message Length:** ${body.length} characters
**Message SID:** ${message.sid}
**Status:** ${message.status}

---
💡 **Tips:**
- WhatsApp messages are free (only need Twilio WhatsApp setup)
- Response rates are typically higher than SMS
- Messages support emojis and formatting
- Monitor delivery in Twilio console`;
        }
        catch (error) {
            if (error.code === 21211) {
                return `❌ **Invalid Phone Number:** The WhatsApp number format is invalid.`;
            }
            if (error.message?.includes('not a valid')) {
                return `❌ **Invalid Recipient:** This number is not registered for WhatsApp.`;
            }
            if (error.message?.includes('timeout')) {
                return '❌ **Timeout Error:** Message delivery took too long. Please try again.';
            }
            return `❌ **WhatsApp Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.sendWhatsappSchema;
    }
};
exports.SendWhatsappService = SendWhatsappService;
exports.SendWhatsappService = SendWhatsappService = __decorate([
    (0, common_1.Injectable)()
], SendWhatsappService);
//# sourceMappingURL=send-whatsapp.service.js.map