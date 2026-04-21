"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProspectsListService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let GetProspectsListService = class GetProspectsListService {
    schema = zod_1.z.object({
        company_name: zod_1.z
            .string()
            .max(200)
            .nullable()
            .optional()
            .describe('Optional company name filter (case-insensitive partial match)'),
        limit: zod_1.z
            .number()
            .min(1)
            .max(100)
            .default(10)
            .optional()
            .describe('Number of prospects to return (1-100, default: 10)'),
        offset: zod_1.z
            .number()
            .min(0)
            .default(0)
            .optional()
            .describe('Number of prospects to skip (default: 0)'),
    });
    async execute(input, state) {
        const { company_name, limit, offset } = input;
        console.log(`🚀 [TOOL STARTED] get_prospects_list - Params: ${JSON.stringify({ company_name, limit, offset })} - User: ${state.user_id}`);
        console.log(`📋 [get_prospects_list] Starting prospect retrieval`);
        console.log(`   Company filter: "${company_name || 'All'}"`);
        console.log(`   Limit: ${limit || 10}`);
        console.log(`   Offset: ${offset || 0}`);
        const final_user_id = state.user_id;
        if (!final_user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        const requestedLimit = limit || 10;
        if (requestedLimit < 1 || requestedLimit > 100) {
            return '❌ **Validation Error:** Limit must be between 1 and 100.';
        }
        if (company_name && company_name.length > 200) {
            return `❌ **Validation Error:** Company name is too long (${company_name.length} characters). Maximum 200 characters.`;
        }
        try {
            console.log(`   Querying database...`);
            const whereConditions = {
                company: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                },
            };
            if (company_name) {
                whereConditions.company.name = {
                    contains: company_name,
                    mode: 'insensitive',
                };
            }
            const leads = await prisma_client_1.prisma.lead.findMany({
                where: whereConditions,
                take: requestedLimit,
                skip: offset || 0,
                include: {
                    company: {
                        select: {
                            name: true,
                            domain: true,
                            industry: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            console.log(`   Found ${leads.length} prospects`);
            if (leads.length === 0) {
                if (company_name) {
                    return `ℹ️ **No Prospects Found**

No prospects found for company: "${company_name}"

**Suggestions:**
- Check spelling and try again
- Remove company filter to see all prospects
- Use \`find_companies\` to discover companies
- Use \`enrich_all_companies\` to find contacts`;
                }
                else {
                    return `ℹ️ **No Prospects Found**

You haven't added any prospects to your database yet.

💡 **Get Started:**
- Use \`find_companies\` to discover companies
- Use \`start_enrichment_job\` to find decision-maker contacts
- Use \`enrich_all_companies\` for batch enrichment`;
                }
            }
            const companiesRepresented = new Set(leads.map((l) => l.company.name))
                .size;
            const leadsWithEmail = leads.filter((l) => l.email && l.email !== 'N/A').length;
            const leadsWithPhone = leads.filter((l) => l.phone && l.phone !== 'N/A').length;
            const leadsWithLinkedIn = leads.filter((l) => l.linkedIn && l.linkedIn !== 'N/A').length;
            const list = leads
                .map((l, index) => {
                const contactMethods = [];
                if (l.email && l.email !== 'N/A')
                    contactMethods.push('📧 Email');
                if (l.phone && l.phone !== 'N/A')
                    contactMethods.push('📱 Phone');
                if (l.linkedIn && l.linkedIn !== 'N/A')
                    contactMethods.push('💼 LinkedIn');
                return `**${index + 1}. ${l.name}**
   - **Position:** ${l.position}
   - **Company:** ${l.company.name}${l.company.industry ? ` (${l.company.industry})` : ''}
   - **Email:** ${l.email !== 'N/A' ? l.email : 'Not available'}
   ${l.phone && l.phone !== 'N/A' ? `- **Phone:** ${l.phone}\n   ` : ''}${l.linkedIn && l.linkedIn !== 'N/A' ? `- **LinkedIn:** ${l.linkedIn}\n   ` : ''}- **Contact Methods:** ${contactMethods.join(', ') || 'None available'}
   - **Added:** ${l.createdAt.toLocaleDateString()}`;
            })
                .join('\n\n');
            return `📋 **Prospects List**${company_name ? ` (Filtered by: "${company_name}")` : ''}

📊 **Summary:**
- **Total Prospects:** ${leads.length}${leads.length === requestedLimit ? ' (showing max limit)' : ''}
- **Companies Represented:** ${companiesRepresented}
- **With Email:** ${leadsWithEmail} (${Math.round((leadsWithEmail / leads.length) * 100)}%)
- **With Phone:** ${leadsWithPhone} (${Math.round((leadsWithPhone / leads.length) * 100)}%)
- **With LinkedIn:** ${leadsWithLinkedIn} (${Math.round((leadsWithLinkedIn / leads.length) * 100)}%)

👥 **Prospects:**

${list}

💡 **Next Steps:**
- Use \`generate_message\` to create personalized outreach
- Use \`send_email\` or \`send_sms\` to contact prospects
- Use \`get_company_detail\` for more company information
- Create campaigns to organize your outreach`;
        }
        catch (error) {
            console.error('❌ [get_prospects_list] Error:', error);
            if (error.code === 'P2025') {
                return `❌ **Database Error:** Prospect records not found.\n\nData may have been deleted. Please refresh and try again.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Database query took too long.\n\nTry reducing the limit or removing filters.`;
            }
            return `❌ **Prospects List Error**

**Error:** ${error.message}
${company_name ? `**Company Filter:** "${company_name}"\n` : ''}**Limit:** ${limit || 10}

**Troubleshooting:**
1. Check your database connection
2. Verify prospects exist in your account
3. Try removing company filter
4. Reduce the limit parameter
5. Contact support if issue persists`;
        }
    }
    getSchema() {
        return this.schema;
    }
};
exports.GetProspectsListService = GetProspectsListService;
exports.GetProspectsListService = GetProspectsListService = __decorate([
    (0, common_1.Injectable)()
], GetProspectsListService);
//# sourceMappingURL=get-prospects-list.service.js.map