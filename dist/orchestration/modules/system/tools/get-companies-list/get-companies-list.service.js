"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompaniesListService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let GetCompaniesListService = class GetCompaniesListService {
    schema = zod_1.z.object({
        limit: zod_1.z
            .number()
            .min(1)
            .max(100)
            .default(10)
            .optional()
            .describe('Number of companies to return (1-100, default: 10)'),
    });
    async execute(input, state) {
        const { limit } = input;
        console.log(`🚀 [TOOL STARTED] get_companies_list - Params: ${JSON.stringify({ limit })} - User: ${state.user_id}`);
        const final_user_id = state.user_id;
        console.log(`🏢 [get_companies_list] Starting company list retrieval`);
        console.log(`   Limit: ${limit || 10}`);
        if (!final_user_id) {
            return JSON.stringify({
                success: false,
                error: 'Authentication Error: User context is missing. Please log in again.',
                companies: [],
            });
        }
        const requestedLimit = limit || 10;
        if (requestedLimit < 1 || requestedLimit > 100) {
            return JSON.stringify({
                success: false,
                error: 'Validation Error: Limit must be between 1 and 100.',
                companies: [],
            });
        }
        try {
            console.log(`   User: ${final_user_id}`);
            console.log(`   Querying database...`);
            const companies = await prisma_client_1.prisma.company.findMany({
                where: {
                    user_id: final_user_id,
                    user: { is_deleted: false },
                },
                take: requestedLimit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: {
                            leads: true,
                            campaigns: true,
                        },
                    },
                },
            });
            console.log(`   Found ${companies.length} companies`);
            if (companies.length === 0) {
                return JSON.stringify({
                    success: true,
                    message: 'No companies found in your account.',
                    companies: [],
                    suggestions: [
                        'Use find_companies to discover new companies',
                        'Companies are automatically saved during discovery',
                        'Build your B2B prospect database',
                    ],
                });
            }
            const formattedList = companies.map((c) => ({
                id: c.id,
                name: c.name,
                domain: c.domain,
                industry: c.industry || 'N/A',
                leadCount: c._count.leads,
                campaignCount: c._count.campaigns,
                createdAt: c.createdAt.toISOString(),
                hasLeads: c._count.leads > 0,
                inCampaigns: c._count.campaigns > 0,
            }));
            const totalLeads = formattedList.reduce((sum, c) => sum + c.leadCount, 0);
            const companiesWithLeads = formattedList.filter((c) => c.hasLeads).length;
            const companiesInCampaigns = formattedList.filter((c) => c.inCampaigns).length;
            return JSON.stringify({
                success: true,
                message: `Found ${companies.length} recent companies.`,
                summary: {
                    totalCompanies: companies.length,
                    companiesWithLeads: companiesWithLeads,
                    companiesInCampaigns: companiesInCampaigns,
                    totalLeads: totalLeads,
                    enrichmentRate: companies.length > 0
                        ? Math.round((companiesWithLeads / companies.length) * 100)
                        : 0,
                },
                companies: formattedList,
                nextSteps: [
                    'Use get_company_detail to view detailed company information',
                    'Use enrich_all_companies to find decision-maker contacts',
                    'Use create_campaign_db to organize outreach efforts',
                ],
            }, null, 2);
        }
        catch (error) {
            console.error('❌ [get_companies_list] Error:', error);
            return JSON.stringify({
                success: false,
                error: error.message,
                errorCode: error.code,
                companies: [],
                troubleshooting: [
                    'Check your database connection',
                    'Verify companies exist in your account',
                    'Try reducing the limit parameter',
                    'Contact support if issue persists',
                ],
            }, null, 2);
        }
    }
    getSchema() {
        return this.schema;
    }
};
exports.GetCompaniesListService = GetCompaniesListService;
exports.GetCompaniesListService = GetCompaniesListService = __decorate([
    (0, common_1.Injectable)()
], GetCompaniesListService);
//# sourceMappingURL=get-companies-list.service.js.map