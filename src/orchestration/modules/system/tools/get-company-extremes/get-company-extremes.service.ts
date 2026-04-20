import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class GetCompanyExtremesService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] get_company_extremes - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`,
    );
    console.log(`🔝 [get_company_extremes] Starting company ranking`);
    const final_user_id = state.user_id;

    // 1. User Context Validation
    if (!final_user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    try {
      console.log(`   User: ${final_user_id}`);
      console.log(`   Fetching top companies...`);

      // 2. Fetch Top Companies by Lead Count
      const companies = await prisma.company.findMany({
        where: {
          user_id: final_user_id,
          user: { is_deleted: false },
        },
        select: {
          id: true,
          name: true,
          domain: true,
          industry: true,
          createdAt: true,
          _count: {
            select: {
              leads: true,
              campaigns: true,
            },
          },
        },
        orderBy: {
          leads: { _count: 'desc' },
        },
        take: 10, // Top 10 companies
      });

      console.log(`   Found ${companies.length} companies`);

      // 3. Handle No Companies
      if (companies.length === 0) {
        return `ℹ️ **No Companies Found**

You haven't added any companies to your database yet.

💡 **Get Started:**
- Use \`find_companies\` to discover companies
- Use \`enrich_all_companies\` to find decision-maker contacts
- Build your B2B prospect database`;
      }

      // 4. Calculate Statistics
      const totalLeads = companies.reduce((sum, c) => sum + c._count.leads, 0);
      const companiesWithLeads = companies.filter(
        (c) => c._count.leads > 0,
      ).length;
      const companiesWithCampaigns = companies.filter(
        (c) => c._count.campaigns > 0,
      ).length;

      // 5. Format Company Rankings
      const report = companies
        .map((c, index) => {
          const rank = index + 1;
          const medal =
            rank === 1
              ? '🥇'
              : rank === 2
                ? '🥈'
                : rank === 3
                  ? '🥉'
                  : `${rank}.`;
          const industry = c.industry ? ` | ${c.industry}` : '';
          const campaigns =
            c._count.campaigns > 0 ? ` | ${c._count.campaigns} campaigns` : '';

          return `${medal} **${c.name}**
   - Domain: ${c.domain}${industry}
   - Leads: ${c._count.leads}${campaigns}
   - Added: ${c.createdAt.toLocaleDateString()}`;
        })
        .join('\n\n');

      // 6. Build Response
      return `🔝 **Top Companies by Lead Count**

📊 **Overview:**
- **Total Companies Shown:** ${companies.length}
- **Companies with Leads:** ${companiesWithLeads}
- **Companies in Campaigns:** ${companiesWithCampaigns}
- **Total Leads:** ${totalLeads}

🏆 **Rankings:**

${report}

💡 **Insights:**
${companies[0]._count.leads > 0 ? `- **${companies[0].name}** is your top company with ${companies[0]._count.leads} leads\n` : ''}${companiesWithLeads < companies.length ? `- ${companies.length - companiesWithLeads} companies need enrichment\n` : ''}${companiesWithCampaigns === 0 ? '- No companies are linked to campaigns yet\n' : ''}
💡 **Next Steps:**
- Use \`get_company_detail\` to view detailed company information
- Use \`enrich_all_companies\` to find more contacts
- Use \`create_campaign_db\` to organize outreach
- Focus on top companies for highest ROI`;
    } catch (error: any) {
      console.error('❌ [get_company_extremes] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **Database Error:** Company records not found.\n\nData may have been deleted. Please refresh and try again.`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Database query took too long.\n\nPlease try again in a moment.`;
      }

      return `❌ **Company Rankings Error**

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
}
