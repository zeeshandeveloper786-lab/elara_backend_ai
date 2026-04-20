"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitiateAiCallService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const http_client_1 = require("../../../../utils/http-client");
const phone_normalize_1 = require("../../../../utils/phone-normalize");
let InitiateAiCallService = class InitiateAiCallService {
    initiateAiCallSchema = zod_1.z.object({
        to_number: zod_1.z
            .string()
            .min(1, 'Phone number is required')
            .describe('Recipient phone number (with or without country code)'),
        prospect_name: zod_1.z
            .string()
            .optional()
            .describe('Name of the prospect being called'),
    });
    async execute(input, state) {
        const { to_number, prospect_name } = input;
        const { user_id, company_id, campaign_id } = state;
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        try {
            const vapiApiKey = process.env.VAPI_API_KEY;
            const assistantId = process.env.VAPI_ASSISTANT_ID;
            const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;
            if (!vapiApiKey || !assistantId) {
                return `❌ **Vapi Configuration Error**

Missing required environment variables:
${!vapiApiKey ? '- VAPI_API_KEY\n' : ''}${!assistantId ? '- VAPI_ASSISTANT_ID\n' : ''}${!phoneNumberId ? '- VAPI_PHONE_NUMBER_ID (optional)\n' : ''}

**Vapi Setup Instructions:**
1. Sign up at https://vapi.ai/
2. Create an AI Assistant in the Vapi dashboard
3. Get your API Key from Settings
4. Copy your Assistant ID from assistant details
5. Add these to your .env file`;
            }
            if (!to_number || to_number.trim().length === 0) {
                return '❌ **Validation Error:** Recipient phone number is required.';
            }
            if (prospect_name && prospect_name.length > 100) {
                return '❌ **Validation Error:** Prospect name is too long (max 100 characters).';
            }
            let normalizedNumber;
            try {
                normalizedNumber = (0, phone_normalize_1.normalizeToE164)(to_number);
            }
            catch {
                return `❌ **Phone Number Error:** Could not normalize "${to_number}".`;
            }
            if (!normalizedNumber.startsWith('+')) {
                return `❌ **Phone Number Error:** Normalized number must include country code.`;
            }
            if (normalizedNumber.length < 10 || normalizedNumber.length > 16) {
                return `❌ **Phone Number Error:** Phone number has invalid length.`;
            }
            const callContext = {
                userId: user_id,
                userName: state.user_name || 'Our Representative',
                companyId: company_id || 'N/A',
                campaignId: campaign_id || 'N/A',
                prospectName: prospect_name || 'Prospect',
                prospectNumber: normalizedNumber,
            };
            const requestBody = {
                assistantId: assistantId,
                customer: {
                    number: normalizedNumber,
                    name: prospect_name || 'Prospect',
                },
                metadata: callContext,
            };
            if (phoneNumberId) {
                requestBody.phoneNumberId = phoneNumberId;
            }
            const response = await (0, http_client_1.httpPost)('https://api.vapi.ai/call', requestBody, {
                headers: {
                    Authorization: `Bearer ${vapiApiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            });
            if (!response.data?.id) {
                return '❌ Error: Failed to initiate AI call. Please verify your Vapi configuration.';
            }
            const callId = response.data.id;
            await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'AI Call',
                    status: 'Initiated',
                    content: `Assistant ID: ${assistantId} | Prospect: ${prospect_name || 'Unknown'}`,
                    recipient: normalizedNumber,
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
                },
            });
            return `✅ **AI Call Initiated Successfully!**

**Call ID:** ${callId}
**Recipient:** ${normalizedNumber}
**Prospect:** ${prospect_name || 'Prospect'}
**Assistant:** ${assistantId}
**Status:** In Progress

---
💡 **What's Happening:**
- AI assistant is calling the prospect now
- The call will follow your pre-configured script
- Monitor the call status in Vapi dashboard
- Listen to recordings after completion

**Dashboard:** https://dashboard.vapi.ai/calls/${callId}`;
        }
        catch (error) {
            if (error.response?.status === 401) {
                return '❌ **Authentication Error:** Invalid Vapi API key.';
            }
            if (error.response?.status === 400) {
                return '❌ **Configuration Error:** Invalid request body. Check your Vapi configuration.';
            }
            if (error.message?.includes('timeout')) {
                return '❌ **Timeout Error:** Call initiation took too long. Please try again.';
            }
            return `❌ **Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.initiateAiCallSchema;
    }
};
exports.InitiateAiCallService = InitiateAiCallService;
exports.InitiateAiCallService = InitiateAiCallService = __decorate([
    (0, common_1.Injectable)()
], InitiateAiCallService);
//# sourceMappingURL=initiate-ai-call.service.js.map