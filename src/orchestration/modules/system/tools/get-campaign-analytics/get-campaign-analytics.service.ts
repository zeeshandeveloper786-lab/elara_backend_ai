import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class GetCampaignAnalyticsService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] get_campaign_analytics - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`,
    );
    const { user_id } = state;
    console.log(`📈 [get_campaign_analytics] Starting analytics generation`);
    console.log(`   User: ${user_id}`);

    // 1. User Context Validation
    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    try {
      console.log(`   Querying campaigns...`);

      // 2. Fetch Campaigns with Activity Counts
      const campaigns = await prisma.campaign.findMany({
        where: {
          user_id,
          user: { is_deleted: false },
        },
        include: {
          _count: {
            select: {
              comm_logs: true,
            },
          },
          company: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`   Found ${campaigns.length} campaigns`);

      // 3. Handle No Campaigns
      if (campaigns.length === 0) {
        return `ℹ️ **No Campaigns Found**

You haven't created any campaigns yet.

💡 **Get Started:**
- Use \`create_campaign_db\` to create your first campaign
- Link campaigns to companies for organized outreach
- Track all communications under campaign context`;
      }

      // 4. Calculate Summary Statistics
      const totalBudget = campaigns.reduce(
        (sum, c) => sum + (c.budget || 0),
        0,
      );
      const totalActivities = campaigns.reduce(
        (sum, c) => sum + c._count.comm_logs,
        0,
      );
      const activeCampaigns = campaigns.filter(
        (c) => c.status === 'active',
      ).length;
      const draftCampaigns = campaigns.filter(
        (c) => c.status === 'draft',
      ).length;
      const completedCampaigns = campaigns.filter(
        (c) => c.status === 'completed',
      ).length;

      // 5. Format Campaign Table
      const tableRows = campaigns
        .map((c) => {
          const budget = c.budget ? `$${c.budget.toLocaleString()}` : 'N/A';
          const company = c.company?.name || 'No company';
          return `| ${c.name} | ${c.status} | ${c.type} | ${budget} | ${c._count.comm_logs} | ${company} |`;
        })
        .join('\n');

      // 6. Build Response
      return `📈 **Campaign Analytics Report**

📊 **Summary Statistics:**
- **Total Campaigns:** ${campaigns.length}
- **Active:** ${activeCampaigns}
- **Draft:** ${draftCampaigns}
- **Completed:** ${completedCampaigns}
- **Total Budget:** $${totalBudget.toLocaleString()}
- **Total Activities:** ${totalActivities}

📋 **Campaign Details:**

| Campaign Name | Status | Type | Budget | Activities | Company |
| :------------ | :----- | :--- | :----- | :--------- | :------ |
${tableRows}

💡 **Next Steps:**
- Use \`get_company_detail\` to view campaign targets
- Use \`generate_message\` to create campaign content
- Use communication tools to execute campaigns
- Track ROI and adjust budgets accordingly`;
    } catch (error: any) {
      console.error('❌ [get_campaign_analytics] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **Database Error:** Campaign records not found.\n\nData may have been deleted. Please refresh and try again.`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Database query took too long.\n\nPlease try again in a moment.`;
      }

      return `❌ **Analytics Error**

**Error:** ${error.message}

**Troubleshooting:**
1. Check your database connection
2. Verify campaigns exist in your account
3. Try again in a moment
4. Contact support if issue persists`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
