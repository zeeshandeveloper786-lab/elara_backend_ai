"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindCompanyInDbService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let FindCompanyInDbService = class FindCompanyInDbService {
    schema = zod_1.z.object({
        query: zod_1.z
            .string()
            .min(2)
            .max(200)
            .describe('Search term for company name or domain (e.g., "Acme", "acme.com", "software")'),
    });
    async execute(input, state) {
        const { query } = input;
        console.log(`🚀 [TOOL STARTED] find_company_in_db - Params: ${JSON.stringify({ query })} - User: ${state.user_id}`);
        console.log(`🔎 [find_company_in_db] Starting company search`);
        console.log(`   Query: "${query}"`);
        const final_user_id = state.user_id;
        if (!final_user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (!query || query.trim().length === 0) {
            return '❌ **Validation Error:** Search query cannot be empty.';
        }
        if (query.length < 2) {
            return '❌ **Validation Error:** Search query must be at least 2 characters long.';
        }
        if (query.length > 200) {
            return `❌ **Validation Error:** Search query is too long (${query.length} characters). Maximum 200 characters.`;
        }
        try {
            const searchTerm = query.trim();
            console.log(`   Searching database...`);
            const companies = await prisma_client_1.prisma.company.findMany({
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { domain: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                include: {
                    _count: {
                        select: {
                            leads: true,
                            campaigns: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            });
            console.log(`   Found ${companies.length} companies`);
            if (companies.length === 0) {
                const similarCompanies = await prisma_client_1.prisma.company.findMany({
                    where: {
                        user_id: final_user_id,
                        user: { is_deleted: false },
                        OR: [
                            {
                                name: {
                                    contains: searchTerm.substring(0, Math.max(3, Math.floor(searchTerm.length / 2))),
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    take: 5,
                    select: {
                        name: true,
                        domain: true,
                    },
                });
                let response = `🔍 **No Companies Found**

No companies matching "${searchTerm}" were found in your database.`;
                if (similarCompanies.length > 0) {
                    response += `\n\n**Similar Companies:**\n${similarCompanies.map((c) => `- ${c.name} (${c.domain})`).join('\n')}`;
                }
                response += `\n\n💡 **Suggestions:**
- Check spelling and try again
- Try a shorter or more general search term
- Search by domain instead of company name
- Use \`find_companies\` to discover new companies
- Use \`get_companies_list\` to browse all companies`;
                return response;
            }
            const totalLeads = companies.reduce((sum, c) => sum + c._count.leads, 0);
            const companiesWithLeads = companies.filter((c) => c._count.leads > 0).length;
            const companiesInCampaigns = companies.filter((c) => c._count.campaigns > 0).length;
            const results = companies
                .map((c, index) => {
                const industry = c.industry ? ` | ${c.industry}` : '';
                const leadInfo = c._count.leads > 0 ? ` | ${c._count.leads} leads` : ' | No leads';
                const campaignInfo = c._count.campaigns > 0 ? ` | ${c._count.campaigns} campaigns` : '';
                return `${index + 1}. **${c.name}**
   - Domain: ${c.domain}${industry}${leadInfo}${campaignInfo}
   - Added: ${c.createdAt.toLocaleDateString()}
   - ID: ${c.id.substring(0, 8)}...`;
            })
                .join('\n\n');
            return `🔍 **Search Results for "${searchTerm}"**

📊 **Summary:**
- **Companies Found:** ${companies.length}${companies.length === 20 ? ' (showing max 20)' : ''}
- **With Leads:** ${companiesWithLeads}
- **In Campaigns:** ${companiesInCampaigns}
- **Total Leads:** ${totalLeads}

🏢 **Companies:**

${results}

💡 **Next Steps:**
- Use \`get_company_detail\` to view detailed company information
- Use \`start_enrichment_job\` to find decision-maker contacts
- Use \`create_campaign_db\` to organize outreach
- Refine search with more specific terms if needed`;
        }
        catch (error) {
            console.error('❌ [find_company_in_db] Error:', error);
            if (error.code === 'P2025') {
                return `❌ **Database Error:** Company records not found.\n\nData may have been deleted. Please refresh and try again.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Database query took too long.\n\nTry a more specific search term or try again later.`;
            }
            return `❌ **Search Error**

**Error:** ${error.message}
**Query:** "${query}"

**Troubleshooting:**
1. Check your database connection
2. Verify companies exist in your account
3. Try a different search term
4. Use \`get_companies_list\` to browse all companies
5. Contact support if issue persists`;
        }
    }
    getSchema() {
        return this.schema;
    }
};
exports.FindCompanyInDbService = FindCompanyInDbService;
exports.FindCompanyInDbService = FindCompanyInDbService = __decorate([
    (0, common_1.Injectable)()
], FindCompanyInDbService);
//# sourceMappingURL=find-company-in-db.service.js.map