import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class GetLeadsOverviewService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] get_leads_overview - Params: ${JSON.stringify({ ...input })} - User: ${state.user_id}`,
    );
    console.log('📊 [get_leads_overview] Starting overview generation');
    const final_user_id = state.user_id;

    // 1. User Context Validation
    if (!final_user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    try {
      console.log(`   User: ${final_user_id}`);
      console.log(`   Calculating lead statistics...`);

      // 2. Get Total Lead Count
      const totalLeads = await prisma.lead.count({
        where: {
          company: {
            user_id: final_user_id,
            user: { is_deleted: false },
          },
        },
      });

      console.log(`   Total leads: ${totalLeads}`);

      // 3. Get Lead Statistics by Position
      const positionStats = await prisma.lead.groupBy({
        by: ['position'],
        where: {
          company: {
            user_id: final_user_id,
            user: { is_deleted: false },
          },
        },
        _count: true,
        orderBy: { _count: { position: 'desc' } },
        take: 5,
      });

      // 4. Get Communication Statistics
      const communicationStats = await prisma.communicationLog.groupBy({
        by: ['type', 'status'],
        where: {
          user_id: final_user_id,
          user: { is_deleted: false },
        },
        _count: true,
        orderBy: { _count: { type: 'desc' } },
      });

      console.log(`   Communication logs: ${communicationStats.length} types`);

      // 5. Calculate Communication Totals
      const totalCommunications = communicationStats.reduce(
        (sum, stat) => sum + stat._count,
        0,
      );
      const successfulCommunications = communicationStats
        .filter(
          (stat) =>
            stat.status === 'Sent' ||
            stat.status === 'Generated' ||
            stat.status === 'Scheduled',
        )
        .reduce((sum, stat) => sum + stat._count, 0);

      // 6. Group Communications by Type
      const commByType: Record<string, number> = {};
      communicationStats.forEach((stat) => {
        if (!commByType[stat.type]) {
          commByType[stat.type] = 0;
        }
        commByType[stat.type] += stat._count;
      });

      // 7. Handle No Data
      if (totalLeads === 0 && totalCommunications === 0) {
        return `📊 **Leads & Communication Overview**

ℹ️ **No Data Yet**

You haven't added any leads or sent any communications yet.

💡 **Get Started:**
- Use \`find_companies\` to discover companies
- Use \`enrich_all_companies\` to find decision-maker contacts
- Use \`generate_message\` to create outreach content
- Use communication tools to start engaging prospects`;
      }

      // 8. Format Position Breakdown
      let positionBreakdown = '';
      if (positionStats.length > 0) {
        positionBreakdown = positionStats
          .map((stat, index) => {
            const percentage =
              totalLeads > 0 ? Math.round((stat._count / totalLeads) * 100) : 0;
            return `${index + 1}. **${stat.position}**: ${stat._count} (${percentage}%)`;
          })
          .join('\n');
      } else {
        positionBreakdown = 'No position data available';
      }

      // 9. Format Communication Stats
      let formattedStats = '';
      if (communicationStats.length > 0) {
        // Group by type for cleaner display
        const typeGroups: Record<
          string,
          Array<{ status: string; count: number }>
        > = {};
        communicationStats.forEach((stat) => {
          if (!typeGroups[stat.type]) {
            typeGroups[stat.type] = [];
          }
          typeGroups[stat.type].push({
            status: stat.status,
            count: stat._count,
          });
        });

        formattedStats = Object.entries(typeGroups)
          .map(([type, statuses]) => {
            const total = statuses.reduce((sum, s) => sum + s.count, 0);
            const statusBreakdown = statuses
              .map((s) => `${s.status}: ${s.count}`)
              .join(', ');
            return `- **${type}**: ${total} total (${statusBreakdown})`;
          })
          .join('\n');
      } else {
        formattedStats = 'No communications logged yet';
      }

      // 10. Calculate Engagement Rate
      const engagementRate =
        totalLeads > 0
          ? Math.round((totalCommunications / totalLeads) * 100)
          : 0;

      // 11. Build Response
      return `📊 **Leads & Communication Overview**

👥 **Lead Statistics:**
- **Total Leads:** ${totalLeads}
- **Engagement Rate:** ${engagementRate}% (${totalCommunications} communications / ${totalLeads} leads)

📈 **Top Positions:**
${positionBreakdown}

📬 **Communication History:**
- **Total Communications:** ${totalCommunications}
- **Successful:** ${successfulCommunications} (${totalCommunications > 0 ? Math.round((successfulCommunications / totalCommunications) * 100) : 0}%)

📊 **By Channel:**
${formattedStats}

💡 **Insights:**
${totalLeads > 0 && totalCommunications === 0 ? '- You have leads but no communications yet - start reaching out!\n' : ''}${engagementRate < 50 ? '- Low engagement rate - consider increasing outreach frequency\n' : ''}${engagementRate > 100 ? "- High engagement rate - you're actively communicating with prospects!\n" : ''}${positionStats.length > 0 ? `- Most common position: **${positionStats[0].position}** (${positionStats[0]._count} leads)\n` : ''}
💡 **Next Steps:**
- Use \`get_prospects_list\` to view detailed lead information
- Use \`generate_message\` to create personalized outreach
- Use \`get_campaign_analytics\` to track campaign performance
- Use \`create_campaign_db\` to organize your outreach efforts`;
    } catch (error: any) {
      console.error('❌ [get_leads_overview] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **Database Error:** Records not found.\n\nData may have been deleted. Please refresh and try again.`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Database query took too long.\n\nPlease try again in a moment.`;
      }

      return `❌ **Overview Error**

**Error:** ${error.message}

**Troubleshooting:**
1. Check your database connection
2. Verify data exists in your account
3. Try again in a moment
4. Contact support if issue persists`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
