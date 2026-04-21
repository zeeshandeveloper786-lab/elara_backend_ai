"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartEnrichmentJobService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const http_client_1 = require("../../../../utils/http-client");
let StartEnrichmentJobService = class StartEnrichmentJobService {
    startEnrichmentJobSchema = zod_1.z.object({
        companies: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string().min(1, 'Company name is required'),
            url: zod_1.z.string().min(1, 'Company URL is required'),
        }))
            .min(1, 'At least one company is required')
            .max(50, 'Maximum 50 companies per batch')
            .describe('Array of companies with name and URL to enrich'),
    });
    async execute(input, state) {
        const { companies } = input;
        const { user_id } = state;
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (!companies || companies.length === 0) {
            return '❌ **Validation Error:** At least one company is required for enrichment.';
        }
        if (companies.length > 50) {
            return `❌ **Validation Error:** Too many companies (${companies.length}). Maximum 50 companies per batch.`;
        }
        for (const company of companies) {
            if (!company.name || company.name.trim().length === 0) {
                return `❌ **Validation Error:** Company name is required for all companies.`;
            }
            if (!company.url || company.url.trim().length === 0) {
                return `❌ **Validation Error:** Company URL is required for all companies.`;
            }
        }
        const apolloKey = process.env.APOLLO_API_KEY?.trim();
        if (!apolloKey) {
            return `❌ **Apollo Configuration Error**

Missing APOLLO_API_KEY in environment variables.

**Setup Instructions:**
1. Sign up at https://www.apollo.io/
2. Navigate to Settings → Integrations → API
3. Generate an API key
4. Add to your .env file: APOLLO_API_KEY=your_api_key_here`;
        }
        try {
            const results = [];
            const failures = [];
            let successCount = 0;
            let failureCount = 0;
            for (const c of companies) {
                try {
                    const domain = c.url
                        .replace(/https?:\/\/(www\.)?/, '')
                        .split('/')[0]
                        .split('?')[0]
                        .toLowerCase()
                        .trim();
                    const res = await (0, http_client_1.httpPost)('https://api.apollo.io/v1/people/match', {
                        domain,
                        reveal_personal_emails: true,
                        titles: [
                            'Founder',
                            'Co-Founder',
                            'CEO',
                            'Chief Executive Officer',
                            'Owner',
                            'Managing Director',
                            'CTO',
                            'Chief Technology Officer',
                            'President',
                            'VP',
                        ],
                    }, {
                        headers: {
                            'X-Api-Key': apolloKey,
                            'Content-Type': 'application/json',
                        },
                        timeout: 10000,
                    });
                    const person = res.data?.person;
                    if (person && person.first_name && person.last_name) {
                        const companyRecord = await prisma_client_1.prisma.company.upsert({
                            where: {
                                domain_user_id: {
                                    domain,
                                    user_id,
                                },
                            },
                            update: {
                                name: c.name,
                                updatedAt: new Date(),
                            },
                            create: {
                                name: c.name,
                                domain,
                                user_id,
                            },
                        });
                        const email = person.email || person.personal_emails?.[0] || null;
                        const phoneNumber = person.phone_numbers?.[0]?.sanitized_number || null;
                        const lead = await prisma_client_1.prisma.lead.create({
                            data: {
                                name: `${person.first_name} ${person.last_name}`,
                                email: email || 'N/A',
                                phone: phoneNumber || 'N/A',
                                position: person.title || 'Decision Maker',
                                linkedIn: person.linkedin_url || 'N/A',
                                user_id,
                                company_id: companyRecord.id,
                            },
                        });
                        successCount++;
                        results.push({
                            company: c.name,
                            contact: lead.name,
                            position: lead.position,
                            email: email || 'Not available',
                            linkedin: person.linkedin_url ? 'Available' : 'Not available',
                        });
                    }
                    else {
                        failureCount++;
                        failures.push({
                            company: c.name,
                            domain,
                            reason: 'No decision-maker found in Apollo database',
                        });
                    }
                }
                catch (companyError) {
                    failureCount++;
                    const errorMessage = companyError.response?.data?.message || companyError.message;
                    failures.push({
                        company: c.name,
                        domain: c.url,
                        reason: errorMessage,
                    });
                    continue;
                }
            }
            if (successCount === 0) {
                return `⚠️ **No Contacts Found**

Attempted to enrich ${companies.length} companies, but no decision-maker contacts were found.

**Failed Companies:**
${failures
                    .slice(0, 10)
                    .map((f) => `- **${f.company}**: ${f.reason}`)
                    .join('\n')}
${failures.length > 10 ? `\n...and ${failures.length - 10} more` : ''}`;
            }
            let response_text = `✅ **Enrichment Complete**

📊 **Summary:**
- **Total Companies:** ${companies.length}
- **Contacts Found:** ${successCount}
- **No Data:** ${failureCount}
- **Success Rate:** ${Math.round((successCount / companies.length) * 100)}%

💎 **Enriched Leads:**

| Company | Contact | Position | Email | LinkedIn |
| :------ | :------ | :------- | :---- | :------- |
${results.map((r) => `| ${r.company} | ${r.contact} | ${r.position} | ${r.email} | ${r.linkedin} |`).join('\n')}`;
            if (failures.length > 0 && failures.length <= 5) {
                response_text += `\n\n⚠️ **Companies Without Data:**\n${failures.map((f) => `- **${f.company}**: ${f.reason}`).join('\n')}`;
            }
            else if (failures.length > 5) {
                response_text += `\n\n⚠️ **${failures.length} companies** had no available contact data.`;
            }
            response_text += `\n\n💡 **Next Steps:**
- Use \`get_company_detail\` to view full company information
- Use \`generate_message\` to create personalized outreach
- Use \`send_email\` or \`send_sms\` to contact leads`;
            return response_text;
        }
        catch (error) {
            if (error.response?.status === 401) {
                return `❌ **Apollo Authentication Failed**

Your Apollo API key is invalid or expired.

**Solutions:**
1. Verify APOLLO_API_KEY in your .env file
2. Generate a new API key from Apollo.io dashboard`;
            }
            if (error.response?.status === 429) {
                return `❌ **Rate Limit Error:** Too many requests to Apollo API. Please wait and try again.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Enrichment took too long. Please try again.`;
            }
            return `❌ **Enrichment Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.startEnrichmentJobSchema;
    }
};
exports.StartEnrichmentJobService = StartEnrichmentJobService;
exports.StartEnrichmentJobService = StartEnrichmentJobService = __decorate([
    (0, common_1.Injectable)()
], StartEnrichmentJobService);
//# sourceMappingURL=start-enrichment-job.service.js.map