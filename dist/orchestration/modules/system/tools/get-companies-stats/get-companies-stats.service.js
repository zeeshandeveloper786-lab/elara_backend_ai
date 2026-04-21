"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompaniesStatsService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let GetCompaniesStatsService = class GetCompaniesStatsService {
    schema = zod_1.z.object({});
    async execute(input, state) {
        console.log(`🚀 [TOOL STARTED] get_companies_stats - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`);
        console.log('🏢 [get_companies_stats] Starting statistics calculation');
        const final_user_id = state.user_id;
        if (!final_user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        try {
            console.log(`   User: ${final_user_id}`);
            console.log(`   Calculating company statistics...`);
            const totalCompanies = await prisma_client_1.prisma.company.count({
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                },
            });
            console.log(`   Total companies: ${totalCompanies}`);
            if (totalCompanies === 0) {
                return `ℹ️ **No Companies Found**

You haven't added any companies to your database yet.

💡 **Get Started:**
- Use \`find_companies\` to discover companies
- Companies are automatically saved during discovery
- Build your B2B prospect database`;
            }
            const industryStats = await prisma_client_1.prisma.company.groupBy({
                by: ['industry'],
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                    NOT: { industry: null },
                },
                _count: true,
                orderBy: { _count: { industry: 'desc' } },
                take: 10,
            });
            console.log(`   Industry groups: ${industryStats.length}`);
            const companiesWithoutIndustry = await prisma_client_1.prisma.company.count({
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                    industry: null,
                },
            });
            const companiesWithLeads = await prisma_client_1.prisma.company.count({
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                    leads: { some: {} },
                },
            });
            const enrichmentRate = totalCompanies > 0
                ? Math.round((companiesWithLeads / totalCompanies) * 100)
                : 0;
            let industryBreakdown = '';
            if (industryStats.length > 0) {
                industryBreakdown = industryStats
                    .map((stat, index) => {
                    const percentage = Math.round((stat._count / totalCompanies) * 100);
                    return `${index + 1}. **${stat.industry || 'Other'}**: ${stat._count} companies (${percentage}%)`;
                })
                    .join('\n');
            }
            else {
                industryBreakdown = 'No industry data available';
            }
            return `🏢 **Company Statistics**

📊 **Overview:**
- **Total Companies:** ${totalCompanies}
- **With Leads:** ${companiesWithLeads} (${enrichmentRate}% enriched)
- **Without Industry:** ${companiesWithoutIndustry}

📈 **Top Industries:**
${industryBreakdown}

💡 **Insights:**
${enrichmentRate < 50 ? '- Consider enriching more companies with `enrich_all_companies`\n' : ''}${companiesWithoutIndustry > 0 ? `- ${companiesWithoutIndustry} companies need industry classification\n` : ''}${industryStats.length > 0 ? `- Your top industry is **${industryStats[0].industry}** with ${industryStats[0]._count} companies\n` : ''}
💡 **Next Steps:**
- Use \`find_companies\` to discover more companies
- Use \`enrich_all_companies\` to find decision-maker contacts
- Use \`get_company_detail\` to view specific company information`;
        }
        catch (error) {
            console.error('❌ [get_companies_stats] Error:', error);
            if (error.code === 'P2025') {
                return `❌ **Database Error:** Company records not found.\n\nData may have been deleted. Please refresh and try again.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Database query took too long.\n\nPlease try again in a moment.`;
            }
            return `❌ **Statistics Error**

**Error:** ${error.message}

**Troubleshooting:**
1. Check your database connection
2. Verify companies exist in your account
3. Try again in a moment
4. Contact support if issue persists`;
        }
    }
    getSchema() {
        return this.schema;
    }
};
exports.GetCompaniesStatsService = GetCompaniesStatsService;
exports.GetCompaniesStatsService = GetCompaniesStatsService = __decorate([
    (0, common_1.Injectable)()
], GetCompaniesStatsService);
//# sourceMappingURL=get-companies-stats.service.js.map