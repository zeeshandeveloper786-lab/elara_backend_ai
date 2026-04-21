"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookAppointmentService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const luxon_1 = require("luxon");
const http_client_1 = require("../../../../utils/http-client");
let BookAppointmentService = class BookAppointmentService {
    bookAppointmentSchema = zod_1.z.object({
        prospect_id: zod_1.z
            .string()
            .min(1, 'Prospect ID is required')
            .describe('Unique identifier for the prospect'),
        prospect_name: zod_1.z.string().optional().describe('Full name of the prospect'),
        prospect_email: zod_1.z
            .string()
            .email('Invalid email format')
            .optional()
            .describe('Email address of the prospect'),
        date_time: zod_1.z
            .string()
            .describe('Appointment date and time in ISO 8601 format (e.g., "2024-05-10T14:30:00")'),
        title: zod_1.z.string().optional().describe('Appointment title or meeting topic'),
        description: zod_1.z
            .string()
            .optional()
            .describe('Detailed description of the appointment'),
    });
    async execute(input, state) {
        const { prospect_id, prospect_name, prospect_email, date_time, title } = input;
        const { user_id, company_id, campaign_id } = state;
        if (!user_id) {
            return '❌ Error: User authentication required. Cannot create appointment without user context.';
        }
        const calendlyApiKey = process.env.CALENDLY_API_KEY?.trim();
        if (!calendlyApiKey) {
            return `❌ **Configuration Error: Calendly API Key Missing**

To enable appointment scheduling:
1. Go to Calendly Settings → Integrations → API & Webhooks
2. Generate a Personal Access Token
3. Add CALENDLY_API_KEY to your .env file`;
        }
        if (!prospect_id || prospect_id.trim().length === 0) {
            return '❌ Error: prospect_id is required and cannot be empty.';
        }
        if (prospect_email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(prospect_email)) {
                return `❌ Error: Invalid email format "${prospect_email}".`;
            }
        }
        const scheduledAt = luxon_1.DateTime.fromISO(date_time);
        if (!scheduledAt.isValid) {
            return `❌ Error: Invalid date format "${date_time}". Required format: ISO 8601 (e.g., "2024-05-10T14:30:00")`;
        }
        const now = luxon_1.DateTime.now();
        if (scheduledAt < now) {
            return `❌ Error: The scheduled time is in the past. Please provide a future date and time.`;
        }
        const oneYearFromNow = now.plus({ years: 1 });
        if (scheduledAt > oneYearFromNow) {
            return `❌ Error: The scheduled time is more than 1 year in the future. Please choose a date within the next year.`;
        }
        const sanitizedTitle = (title || 'Strategic Discovery Call').trim();
        if (sanitizedTitle.length > 100) {
            return '❌ Error: Appointment title is too long (max 100 characters).';
        }
        try {
            const userRes = await (0, http_client_1.httpGet)('https://api.calendly.com/users/me', {
                headers: {
                    Authorization: `Bearer ${calendlyApiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            if (!userRes.data?.resource?.uri) {
                return '❌ Error: Unable to retrieve Calendly user information. Please verify your API key.';
            }
            const userUri = userRes.data.resource.uri;
            const eventTypesRes = await (0, http_client_1.httpGet)('https://api.calendly.com/event_types', {
                params: { user: userUri, active: true },
                headers: {
                    Authorization: `Bearer ${calendlyApiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            const eventTypes = eventTypesRes.data?.collection || [];
            if (eventTypes.length === 0) {
                return `❌ **No Active Event Types Found**

To create appointments, create at least one active event type in Calendly.`;
            }
            const eventType = eventTypes[0];
            const linkRes = await (0, http_client_1.httpPost)('https://api.calendly.com/scheduling_links', {
                max_event_count: 1,
                owner: eventType.uri,
                owner_type: 'EventType',
            }, {
                headers: {
                    Authorization: `Bearer ${calendlyApiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            if (!linkRes.data?.resource?.booking_url) {
                return '❌ Error: Failed to create scheduling link. Please try again.';
            }
            let bookingUrl = linkRes.data.resource.booking_url;
            if (prospect_name || prospect_email || scheduledAt.isValid) {
                const url = new URL(bookingUrl);
                if (prospect_name) {
                    url.searchParams.set('name', prospect_name);
                }
                if (prospect_email) {
                    url.searchParams.set('email', prospect_email);
                }
                if (scheduledAt.isValid) {
                    url.searchParams.set('month', scheduledAt.toFormat('yyyy-MM'));
                    const isoDate = scheduledAt.toISODate();
                    if (isoDate) {
                        url.searchParams.set('date', isoDate);
                    }
                }
                bookingUrl = url.toString();
            }
            const appointment = await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'Appointment',
                    status: 'Scheduled',
                    content: `Title: ${sanitizedTitle} | Proposed Time: ${scheduledAt.toFormat('ffff')}`,
                    recipient: prospect_email || prospect_id,
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
                },
            });
            return `✅ **Appointment Booking Link Created!**

**Link:** ${bookingUrl}

**Appointment Details:**
- **Title:** ${sanitizedTitle}
- **Proposed Time:** ${scheduledAt.toFormat('ffff')}
- **Prospect:** ${prospect_name || prospect_id}
- **Appointment ID:** ${appointment.id}
${prospect_email ? `- **Email:** ${prospect_email}` : ''}

---
💡 **Next Steps:**
- Share the booking link with the prospect
- They can select their preferred time slot
- Calendar invite will be sent automatically`;
        }
        catch (error) {
            return `❌ **Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.bookAppointmentSchema;
    }
};
exports.BookAppointmentService = BookAppointmentService;
exports.BookAppointmentService = BookAppointmentService = __decorate([
    (0, common_1.Injectable)()
], BookAppointmentService);
//# sourceMappingURL=book-appointment.service.js.map