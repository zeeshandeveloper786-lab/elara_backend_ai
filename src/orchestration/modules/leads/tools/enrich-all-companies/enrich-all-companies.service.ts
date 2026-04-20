import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import { StartEnrichmentJobService } from '../start-enrichment-job/start-enrichment-job.service';

@Injectable()
export class EnrichAllCompaniesService {
  private readonly enrichAllCompaniesSchema = z.object({
    limit: z
      .number()
      .min(1, 'Limit must be at least 1')
      .max(20, 'Limit must not exceed 20')
      .optional()
      .default(5)
      .describe('Number of companies to enrich per batch (1-20)'),
  });

  constructor(private startEnrichmentJobService: StartEnrichmentJobService) {}

  async execute(input: any, state: any): Promise<string> {
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
      const companiesToEnrich = await prisma.company.findMany({
        where: {
          user_id,
          user: { is_deleted: false },
          leads: { none: {} },
        },
        take: batchSize,
        orderBy: { createdAt: 'desc' },
      });

      if (companiesToEnrich.length === 0) {
        const totalCompanies = await prisma.company.count({
          where: {
            user_id,
            user: { is_deleted: false },
          },
        });

        const enrichedCompanies = await prisma.company.count({
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

      const result = await this.startEnrichmentJobService.execute(
        { companies: formattedCompanies },
        state,
      );

      const remainingCompanies = await prisma.company.count({
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
    } catch (error: any) {
      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Batch enrichment took too long. Please try again.`;
      }

      if (error.message?.includes('connection')) {
        return `❌ **Connection Error:** Could not connect to database. Please check your connection.`;
      }

      return `❌ **Enrichment Error:** ${error.message || 'Unknown error occurred'}`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.enrichAllCompaniesSchema;
  }
}
