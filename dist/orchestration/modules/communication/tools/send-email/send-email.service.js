"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const nodemailer = __importStar(require("nodemailer"));
let SendEmailService = class SendEmailService {
    transporter = null;
    lastConfigHash = '';
    sendEmailSchema = zod_1.z.object({
        to: zod_1.z
            .array(zod_1.z.string().email('Invalid email format'))
            .min(1, 'At least one recipient email is required')
            .max(50, 'Maximum 50 recipients per email')
            .describe('Array of recipient email addresses'),
        subject: zod_1.z
            .string()
            .min(1, 'Subject is required')
            .max(200, 'Subject must not exceed 200 characters')
            .describe('Email subject line'),
        body: zod_1.z
            .string()
            .min(1, 'Email body cannot be empty')
            .max(100000, 'Email body must not exceed 100,000 characters')
            .describe('Email content (supports HTML)'),
    });
    getTransporter() {
        const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
        const configHash = `${SMTP_HOST}:${SMTP_PORT}:${SMTP_USER}:${SMTP_PASS}`;
        if (this.transporter && this.lastConfigHash === configHash) {
            return this.transporter;
        }
        if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
            return null;
        }
        const port = parseInt(SMTP_PORT || '587');
        this.transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: port,
            secure: port === 465,
            auth: { user: SMTP_USER, pass: SMTP_PASS },
        });
        this.lastConfigHash = configHash;
        return this.transporter;
    }
    async execute(input, state) {
        const { to, subject, body } = input;
        const { user_id, company_id, campaign_id } = state;
        if (!to || to.length === 0) {
            return '❌ **Validation Error:** At least one recipient email address is required.';
        }
        if (to.length > 50) {
            return `❌ **Validation Error:** Too many recipients (${to.length}). Maximum 50 recipients per email.`;
        }
        if (!subject || subject.trim().length === 0) {
            return '❌ **Validation Error:** Email subject is required.';
        }
        if (subject.length > 200) {
            return `❌ **Validation Error:** Subject is too long. Keep it under 200 characters.`;
        }
        if (!body || body.trim().length === 0) {
            return '❌ **Validation Error:** Email body cannot be empty.';
        }
        if (body.length > 100000) {
            return `❌ **Validation Error:** Email body is too large. Maximum 100,000 characters.`;
        }
        try {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const validRecipients = to.filter((email) => emailRegex.test(email.trim()));
            const invalidRecipients = to.filter((email) => !emailRegex.test(email.trim()));
            if (validRecipients.length === 0) {
                return `❌ **Validation Error:** No valid email addresses found.`;
            }
            const transporter = this.getTransporter();
            if (!transporter) {
                const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
                return `❌ **SMTP Configuration Error**

Missing required environment variables:
${!SMTP_HOST ? '- SMTP_HOST (e.g., smtp.gmail.com)\n' : ''}${!SMTP_USER ? '- SMTP_USER (your email address)\n' : ''}${!SMTP_PASS ? '- SMTP_PASS (your email password or app password)\n' : ''}`;
            }
            const { SMTP_FROM_NAME, SMTP_USER } = process.env;
            const mailOptions = {
                from: SMTP_FROM_NAME ? `${SMTP_FROM_NAME} <${SMTP_USER}>` : SMTP_USER,
                to: validRecipients.join(', '),
                subject: subject.trim(),
                html: body.trim(),
            };
            const info = await transporter.sendMail(mailOptions);
            await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'Email',
                    status: 'Sent',
                    content: body.trim(),
                    recipient: validRecipients.join('; '),
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
                },
            });
            return `✅ **Email Sent Successfully!**

**Recipients:** ${validRecipients.length}
**Subject:** ${subject}
**Message ID:** ${info.messageId || 'Generated'}

${invalidRecipients.length > 0 ? `\n⚠️ **Skipped Invalid Recipients:**\n${invalidRecipients.map((e) => `- ${e}`).join('\n')}` : ''}

---
💡 **Next Steps:**
- Monitor delivery status
- Track opens and clicks if supported by your email provider`;
        }
        catch (error) {
            if (error.code === 'EAUTH') {
                return '❌ **SMTP Authentication Error:** Invalid email or password. Please check your SMTP credentials.';
            }
            if (error.code === 'ECONNREFUSED') {
                return '❌ **SMTP Connection Error:** Cannot connect to email server. Please verify SMTP_HOST and SMTP_PORT.';
            }
            return `❌ **Email Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.sendEmailSchema;
    }
};
exports.SendEmailService = SendEmailService;
exports.SendEmailService = SendEmailService = __decorate([
    (0, common_1.Injectable)()
], SendEmailService);
//# sourceMappingURL=send-email.service.js.map