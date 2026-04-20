"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateMessageService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const openai_model_1 = require("../../../../AI-model/openai-model");
const messages_1 = require("@langchain/core/messages");
let GenerateMessageService = class GenerateMessageService {
    generateMessageSchema = zod_1.z.object({
        type: zod_1.z
            .enum(['email', 'sms', 'whatsapp', 'linkedin'])
            .describe('The communication channel for the message'),
        prospect_name: zod_1.z
            .string()
            .min(1, 'Prospect name is required')
            .max(100, 'Prospect name must not exceed 100 characters')
            .describe('Name of the person receiving the message'),
        sender_name: zod_1.z
            .string()
            .optional()
            .describe('Name of the person/user sending the message (defaults to user_name from state)'),
        context: zod_1.z
            .string()
            .max(2000, 'Context must not exceed 2000 characters')
            .optional()
            .describe('Details about the lead, their company, pain points, or why we are reaching out'),
    });
    async execute(input, state) {
        const { type, prospect_name, sender_name, context } = input;
        if (!prospect_name || prospect_name.trim().length === 0) {
            return '❌ **Validation Error:** Prospect name is required for personalization.';
        }
        if (prospect_name.length > 100) {
            return '❌ **Validation Error:** Prospect name is too long (max 100 characters).';
        }
        if (context && context.length > 2000) {
            return '❌ **Validation Error:** Context is too long (max 2000 characters). Please provide a concise summary.';
        }
        const finalSenderName = sender_name || state.user_name || 'Our Team';
        const channelGuidelines = {
            email: {
                maxLength: 'No strict limit, but aim for 150-250 words',
                structure: 'Subject line suggestion + Body with clear sections',
                tone: 'Professional yet conversational',
                cta: 'Include 1-2 clear CTAs (reply, book meeting, etc.)',
            },
            sms: {
                maxLength: '160 characters (1 SMS segment)',
                structure: 'Hook + Value + CTA in minimal words',
                tone: 'Casual, direct, urgent',
                cta: 'Single, action-oriented CTA',
            },
            whatsapp: {
                maxLength: '300-500 characters recommended',
                structure: 'Friendly greeting + Value + CTA',
                tone: 'Conversational, emoji-friendly',
                cta: 'Encourage quick reply',
            },
            linkedin: {
                maxLength: '300 characters for connection request, 1900 for message',
                structure: 'Professional hook + Mutual value + CTA',
                tone: 'Professional, industry-focused',
                cta: 'Connect or schedule call',
            },
        };
        const guidelines = channelGuidelines[type];
        try {
            const model = (0, openai_model_1.createModel)();
            const systemPrompt = `You are an elite Sales Copywriter & Growth Hacker specializing in ${type} outreach.
Your goal is to write a ${type} message that gets a reply and drives action.

### CHANNEL-SPECIFIC GUIDELINES FOR ${type.toUpperCase()}:
- **Max Length**: ${guidelines.maxLength}
- **Structure**: ${guidelines.structure}
- **Tone**: ${guidelines.tone}
- **CTA**: ${guidelines.cta}

### UNIVERSAL BEST PRACTICES:
- **Avoid clichés**: No "I hope this finds you well" or "reaching out to you"
- **Personalization**: Use prospect's name and context naturally
- **Value-first**: Lead with what's in it for them
- **Clarity**: Be specific, not vague
- **Human touch**: Write like a real person, not a bot
- **Sender**: ${finalSenderName}
- **Recipient**: ${prospect_name}

${type === 'email' ? '**IMPORTANT**: Start with a compelling subject line on the first line, then add a blank line, then the email body.' : ''}
${type === 'sms' ? '**IMPORTANT**: Keep it under 160 characters. Every character counts.' : ''}
${type === 'whatsapp' ? '**IMPORTANT**: You can use 1-2 relevant emojis to make it friendly.' : ''}
${type === 'linkedin' ? '**IMPORTANT**: Be professional but not stiff. Reference mutual interests or connections if possible.' : ''}`;
            const userPrompt = `Draft a ${type} message for ${prospect_name}.

**Context/Background**: ${context || 'Focus on a strategic partnership opportunity and mutual growth. Highlight how we can add value to their business.'}

**Instructions**: 
- Output ONLY the message content
- No meta-commentary or explanations
- Make it sound natural and human
- Ensure it's actionable and reply-worthy
${type === 'email' ? '- Include a subject line as the first line' : ''}`;
            const response = await model.invoke([
                new messages_1.SystemMessage(systemPrompt),
                new messages_1.HumanMessage(userPrompt),
            ]);
            const draft = String(response.content).trim();
            if (!draft || draft.length === 0) {
                return '❌ **Generation Error:** AI returned an empty message. Please try again.';
            }
            let warningMessage = '';
            if (type === 'sms' && draft.length > 160) {
                const segments = Math.ceil(draft.length / 160);
                warningMessage = `\n\n⚠️ **Warning:** This SMS is ${draft.length} characters and will be sent as ${segments} segments. Consider shortening it.`;
            }
            if (type === 'whatsapp' && draft.length > 500) {
                warningMessage = `\n\n⚠️ **Note:** This WhatsApp message is ${draft.length} characters. While there's no hard limit, shorter messages tend to get better engagement.`;
            }
            const channelEmoji = {
                email: '📧',
                sms: '💬',
                whatsapp: '📱',
                linkedin: '💼',
            };
            return `${channelEmoji[type]} **Generated ${type.toUpperCase()} Draft**

${draft}

---
📊 **Message Stats:**
- **Length:** ${draft.length} characters
- **Channel:** ${type}
${warningMessage}

💡 **Next Steps:**
- Review and edit if needed
- Use send_${type === 'linkedin' ? 'email' : type} tool to send
- Or ask me to regenerate with different context`;
        }
        catch (error) {
            if (error.message?.includes('API key')) {
                return `❌ **API Configuration Error:** OpenRouter API key is missing or invalid.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** AI model took too long to respond. Please try again.`;
            }
            if (error.message?.includes('rate limit')) {
                return `❌ **Rate Limit Error:** Too many requests to AI model. Please wait a moment and try again.`;
            }
            return `❌ **Generation Error:** ${error.message}`;
        }
    }
    getSchema() {
        return this.generateMessageSchema;
    }
};
exports.GenerateMessageService = GenerateMessageService;
exports.GenerateMessageService = GenerateMessageService = __decorate([
    (0, common_1.Injectable)()
], GenerateMessageService);
//# sourceMappingURL=generate-message.service.js.map