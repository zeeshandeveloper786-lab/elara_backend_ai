import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

/**
 * Get Campaigns List Service
 * Retrieves user's marketing campaigns with filtering and detailed information
 * Features: Pagination, status filtering, budget tracking, activity counts
 */
@Injectable()
export class GetCampaignsListService {
  private readonly getCampaignsListSchema = z.object({
    limit: z
      .number()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .optional()
      .default(10)
      .describe('Maximum number of campaigns to retrieve (1-100, default: 10)'),
    status: z
      .enum(['draft', 'active', 'paused', 'completed', 'archived'])
      .optional()
      .describe(
        'Filter campaigns by status (optional). Valid values: draft, active, paused, completed, archived',
      ),
  });

  async execute(input: any, state: any): Promise<string> {
    const { limit, status } = input;
    const { user_id } = state;

    console.log(
      `📋 [get_campaigns_list] Fetching campaigns for user: ${user_id}`,
    );

    // 1. Validate user context
    if (!user_id) {
      console.error('❌ [get_campaigns_list] Missing user_id in state');
      return '❌ Error: User authentication required. Cannot retrieve campaigns.';
    }

    // 2. Validate limit parameter
    const validLimit = Math.min(Math.max(limit || 10, 1), 100); // Between 1 and 100
    if (limit && (limit < 1 || limit > 100)) {
      console.warn(
        `⚠️ [get_campaigns_list] Invalid limit ${limit}, using ${validLimit}`,
      );
    }

    // 3. Validate status filter if provided
    const validStatuses = [
      'draft',
      'active',
      'paused',
      'completed',
      'archived',
    ];
    if (status && !validStatuses.includes(status)) {
      console.warn(`❌ [get_campaigns_list] Invalid status filter: ${status}`);
      return `❌ Error: Invalid status "${status}". Valid statuses: ${validStatuses.join(', ')}`;
    }

    try {
      // 4. Build query with optional status filter
      const whereClause: any = {
        user_id,
        user: { is_deleted: false },
      };
      if (status) {
        whereClause.status = status;
      }

      console.log(
        `🔍 [get_campaigns_list] Querying with limit: ${validLimit}, status: ${status || 'all'}`,
      );

      // 5. Fetch campaigns with related data
      const campaigns = await prisma.campaign.findMany({
        where: whereClause,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              ad_contents: true,
              comm_logs: true,
            },
          },
        },
      });

      // 6. Handle empty results
      if (campaigns.length === 0) {
        const filterMsg = status ? ` with status "${status}"` : '';
        console.log(`ℹ️ [get_campaigns_list] No campaigns found${filterMsg}`);

        return `ℹ️ **No Campaigns Found**

${status ? `No campaigns found with status "${status}".` : "You haven't created any campaigns yet."}

**Get Started:**
- Create your first campaign using the create_campaign_db tool
- Link campaigns to companies for better organization
- Track your marketing efforts in one place`;
      }

      console.log(
        `✅ [get_campaigns_list] Found ${campaigns.length} campaigns`,
      );

      // 7. Calculate summary statistics
      const totalBudget = campaigns.reduce(
        (sum, c) => sum + (c.budget || 0),
        0,
      );
      const statusCounts = campaigns.reduce(
        (acc, c) => {
          acc[c.status] = (acc[c.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      // 8. Format budget display
      const formatBudget = (amount: number) => {
        if (amount === 0) return 'Not set';
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount);
      };

      // 9. Create table rows with enhanced information
      const rows = campaigns
        .map((c) => {
          const budgetDisplay = formatBudget(c.budget || 0);
          const companyDisplay = c.company?.name || 'None';
          const adsCount = c._count.ad_contents;
          const activityCount = c._count.comm_logs;

          return `| ${c.name} | ${c.status} | ${c.type} | ${budgetDisplay} | ${companyDisplay} | ${adsCount} | ${activityCount} |`;
        })
        .join('\n');

      // 10. Build status summary
      const statusSummary = Object.entries(statusCounts)
        .map(([status, count]) => `${status}: ${count}`)
        .join(', ');

      // 11. Return formatted response with summary
      return `### 📋 Your Campaigns ${status ? `(Status: ${status})` : ''}

**Summary:**
- Total Campaigns: ${campaigns.length}
- Total Budget: ${formatBudget(totalBudget)}
- By Status: ${statusSummary}

**Campaign List:**

| Name | Status | Type | Budget | Company | Ads | Activities |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: |
${rows}

---

💡 **Tips:**
- Click on a campaign name to view details
- Use status filters to focus on specific campaigns
- Link campaigns to companies for better tracking`;
    } catch (error: any) {
      console.error('❌ [get_campaigns_list] Error:', error);

      // Enhanced error handling
      if (error.code === 'P2025') {
        return '❌ Database Error: Unable to find campaigns. Please try again.';
      }

      if (error.message?.includes('timeout')) {
        return '❌ Timeout Error: Database query took too long. Please try again.';
      }

      if (error.message?.includes('connection')) {
        return '❌ Connection Error: Unable to connect to database. Please check your connection.';
      }

      // Generic error fallback
      return `❌ Error retrieving campaigns: ${error.message || 'Unknown error occurred'}. Please try again or contact support if the issue persists.`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.getCampaignsListSchema;
  }
}
