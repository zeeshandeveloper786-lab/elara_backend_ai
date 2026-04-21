"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichAllCompaniesService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const start_enrichment_job_service_1 = require("../start-enrichment-job/start-enrichment-job.service");
let EnrichAllCompaniesService = class EnrichAllCompaniesService {
    startEnrichmentJobService;
    enrichAllCompaniesSchema = zod_1.z.object({
        limit: zod_1.z
            .number()
            .min(1, 'Limit must be at least 1')
            .max(20, 'Limit must not exceed 20')
            .optional()
            .default(5)
            .describe('Number of companies to enrich per batch (1-20)'),
    });
    constructor(startEnrichmentJobService) {
        this.startEnrichmentJobService = startEnrichmentJobService;
    }
    async execute(input, state) {
        const { limit } = input;
        const { user_id } = state;
        const batchSize = limit || 5;
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (batchSize < 1 || batchSize > 20) {
            return '❌ **Validation Error:** Batch size must be between 1 and 20.';
        }
        try {
            const companiesToEnrich = await prisma_client_1.prisma.company.findMany({
                where: {
                    user_id,
                    user: { is_deleted: false },
                    leads: { none: {} },
                },
                take: batchSize,
                orderBy: { createdAt: 'desc' },
            });
            if (companiesToEnrich.length === 0) {
                const totalCompanies = await prisma_client_1.prisma.company.count({
                    where: {
                        user_id,
                        user: { is_deleted: false },
                    },
                });
                const enrichedCompanies = await prisma_client_1.prisma.company.count({
                    where: {
                        user_id,
                        user: { is_deleted: false },
                        leads: { some: {} },
                    },
                });
                return `✅ **All Companies Enriched**

📊 **Your Database:**
- **Total Companies:** ${totalCompanies}
- **Enriched:** ${enrichedCompanies}
- **Pending:** 0

All companies in your database already have lead information!

💡 **Next Steps:**
- Use \`find_companies\` to discover new companies
- Use \`get_company_detail\` to view company information`;
            }
            const formattedCompanies = companiesToEnrich.map((c) => ({
                name: c.name,
                url: c.domain || c.name,
            }));
            const result = await this.startEnrichmentJobService.execute({ companies: formattedCompanies }, state);
            const remainingCompanies = await prisma_client_1.prisma.company.count({
                where: {
                    user_id,
                    user: { is_deleted: false },
                    leads: { none: {} },
                },
            });
            const batchSummary = `\n\n📦 **Batch Processing:**
- **Processed:** ${companiesToEnrich.length} companies
- **Remaining to Enrich:** ${remainingCompanies}

${remainingCompanies > 0 ? '💡 Run this tool again to enrich more companies.' : '✅ All companies have been enriched!'}`;
            return result + batchSummary;
        }
        catch (error) {
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Batch enrichment took too long. Please try again.`;
            }
            if (error.message?.includes('connection')) {
                return `❌ **Connection Error:** Could not connect to database. Please check your connection.`;
            }
            return `❌ **Enrichment Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.enrichAllCompaniesSchema;
    }
};
exports.EnrichAllCompaniesService = EnrichAllCompaniesService;
exports.EnrichAllCompaniesService = EnrichAllCompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [start_enrichment_job_service_1.StartEnrichmentJobService])
], EnrichAllCompaniesService);
//# sourceMappingURL=enrich-all-companies.service.js.map