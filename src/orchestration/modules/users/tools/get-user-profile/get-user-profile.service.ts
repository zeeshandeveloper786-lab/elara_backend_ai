import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class GetUserProfileService {
  private readonly schema = z.object({});

  async execute(input: any, state: any): Promise<string> {
    console.log(
      `🚀 [TOOL STARTED] get_user_profile - Params: ${JSON.stringify({})} - User: ${state.user_id}`,
    );
    const { user_id } = state;
    console.log(`👤 [get_user_profile] Starting profile retrieval`);
    console.log(`   User ID: ${user_id}`);

    // 1. User Context Validation
    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    try {
      console.log(`   Fetching user profile...`);

      // 2. Fetch User Profile with Statistics
      const user = await prisma.user.findFirst({
        where: { id: user_id, is_deleted: false },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              companies: true,
              campaigns: true,
              leads: true,
              comm_logs: true,
            },
          },
        },
      });

      // 3. Handle User Not Found
      if (!user) {
        return `❌ **User Not Found**

User ID "${user_id}" does not exist in the database.

**Possible Reasons:**
- Account was deleted
- Invalid user ID in session
- Database synchronization issue

**Action Required:**
- Log out and log in again
- Contact support if issue persists`;
      }

      console.log(`   ✅ Profile retrieved for: ${user.email}`);

      // 4. Calculate Additional Statistics
      const companiesWithLeads = await prisma.company.count({
        where: {
          user_id,
          user: { is_deleted: false },
          leads: { some: {} },
        },
      });

      const activeCampaigns = await prisma.campaign.count({
        where: {
          user_id,
          user: { is_deleted: false },
          status: 'active',
        },
      });

      const enrichmentRate =
        user._count.companies > 0
          ? Math.round((companiesWithLeads / user._count.companies) * 100)
          : 0;

      // 5. Calculate Account Age
      const accountAge = Math.floor(
        (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24),
      );
      const accountAgeText =
        accountAge === 0
          ? 'Today'
          : accountAge === 1
            ? '1 day'
            : accountAge < 30
              ? `${accountAge} days`
              : accountAge < 365
                ? `${Math.floor(accountAge / 30)} months`
                : `${Math.floor(accountAge / 365)} years`;

      // 6. Determine Activity Level
      const totalActivity =
        user._count.companies + user._count.campaigns + user._count.comm_logs;
      const activityLevel =
        totalActivity === 0
          ? '🆕 New User'
          : totalActivity < 10
            ? '🌱 Getting Started'
            : totalActivity < 50
              ? '📈 Active'
              : totalActivity < 200
                ? '🔥 Power User'
                : '⭐ Expert';

      // 7. Build Response
      return `👤 **User Profile**

**Account Information:**
- **Name:** ${user.name || 'Not set'}
- **Email:** ${user.email}
- **Role:** ${user.role}
- **Account Age:** ${accountAgeText}
- **Activity Level:** ${activityLevel}

📊 **Statistics:**
- **Companies:** ${user._count.companies}
- **Enriched Companies:** ${companiesWithLeads} (${enrichmentRate}%)
- **Total Leads:** ${user._count.leads}
- **Campaigns:** ${user._count.campaigns}
- **Active Campaigns:** ${activeCampaigns}
- **Communications Sent:** ${user._count.comm_logs}

📅 **Account Dates:**
- **Created:** ${user.createdAt.toLocaleDateString()} at ${user.createdAt.toLocaleTimeString()}
- **Last Updated:** ${user.updatedAt.toLocaleDateString()} at ${user.updatedAt.toLocaleTimeString()}

💡 **Quick Actions:**
- Use \`update_user_profile\` to update name or email
- Use \`change_user_password\` to change password
- Use \`get_companies_stats\` to view company breakdown
- Use \`get_campaign_analytics\` to view campaign performance

${totalActivity === 0 ? '\n🎯 **Getting Started:**\n- Use `find_companies` to discover companies\n- Use `enrich_all_companies` to find contacts\n- Use `create_campaign_db` to organize outreach\n' : ''}${enrichmentRate < 50 && user._count.companies > 0 ? '\n💡 **Tip:** Your enrichment rate is low. Use `enrich_all_companies` to find more contacts.\n' : ''}`;
    } catch (error: any) {
      console.error('❌ [get_user_profile] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **Database Error:** User record not found.\n\nPlease log out and log in again.`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Database query took too long.\n\nPlease try again in a moment.`;
      }

      return `❌ **Profile Error**

**Error:** ${error.message}

**Troubleshooting:**
1. Check your database connection
2. Verify your session is valid
3. Try logging out and logging in again
4. Contact support if issue persists`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
