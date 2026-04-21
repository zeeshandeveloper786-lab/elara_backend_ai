"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendSmsService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const twilio_1 = require("twilio");
const phone_normalize_1 = require("../../../../utils/phone-normalize");
let SendSmsService = class SendSmsService {
    client = null;
    lastConfigHash = '';
    sendSmsSchema = zod_1.z.object({
        to_number: zod_1.z
            .string()
            .min(1, 'Phone number is required')
            .describe('Recipient phone number (with or without country code)'),
        body: zod_1.z
            .string()
            .min(1, 'SMS body cannot be empty')
            .max(1600, 'Message must not exceed 1600 characters (10 SMS segments)')
            .describe('SMS message content'),
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

Missing required environment variables:
${!process.env.TWILIO_ACCOUNT_SID ? '- TWILIO_ACCOUNT_SID\n' : ''}${!process.env.TWILIO_AUTH_TOKEN ? '- TWILIO_AUTH_TOKEN\n' : ''}${!fromNumber ? '- TWILIO_PHONE_NUMBER\n' : ''}`;
            }
            if (!body || body.trim().length === 0) {
                return '❌ **Validation Error:** SMS body cannot be empty.';
            }
            if (body.length > 1600) {
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
            const segments = Math.ceil(body.length / 160);
            const message = await client.messages.create({
                body: body.trim(),
                from: fromNumber,
                to: normalized,
            });
            const estimatedCost = segments * 0.0075;
            await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'SMS',
                    status: 'Sent',
                    content: body.trim(),
                    recipient: normalized,
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
                },
            });
            return `✅ **SMS Sent Successfully!**

**Recipient:** ${normalized}
**Message Length:** ${body.length} characters (${segments} segment${segments > 1 ? 's' : ''})
**Message SID:** ${message.sid}
**Status:** ${message.status}
**Estimated Cost:** $${estimatedCost.toFixed(4)} USD

---
💡 **Tips:**
- SMS segments are billed separately
- Shorter messages (under 160 chars) are often more effective
- Monitor delivery status in Twilio console`;
        }
        catch (error) {
            if (error.code === 21211) {
                return `❌ **Invalid Phone Number:** The number format is invalid.`;
            }
            if (error.code === 21608) {
                return `❌ **Restricted Number:** This number cannot receive SMS.`;
            }
            if (error.message?.includes('timeout')) {
                return '❌ **Timeout Error:** SMS delivery took too long. Please try again.';
            }
            return `❌ **SMS Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.sendSmsSchema;
    }
};
exports.SendSmsService = SendSmsService;
exports.SendSmsService = SendSmsService = __decorate([
    (0, common_1.Injectable)()
], SendSmsService);
//# sourceMappingURL=send-sms.service.js.map