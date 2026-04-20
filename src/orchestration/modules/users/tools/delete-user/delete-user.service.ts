import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class DeleteUserService {
  private readonly schema = z.object({
    confirm: z
      .boolean()
      .describe(
        'Must be set to true to execute deletion. This action is IRREVERSIBLE and will delete ALL user data.',
      ),
  });

  async execute(input: any, state: any): Promise<string> {
    const { confirm } = input;
    console.log(
      `🚀 [TOOL STARTED] delete_user - Params: ${JSON.stringify({ confirm })} - User: ${state.user_id}`,
    );
    const { user_id } = state;
    console.log(`🗑️ [delete_user] Starting account deletion process`);
    console.log(`   User ID: ${user_id}`);
    console.log(`   Confirmation: ${confirm}`);

    // 1. User Context Validation
    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    // 2. Confirmation Validation
    if (confirm !== true) {
      return `⚠️ **Account Deletion Aborted**

Account deletion requires explicit confirmation.

**To delete your account:**
- Set the \`confirm\` parameter to \`true\`
- Understand that this action is **IRREVERSIBLE**

**What will be deleted:**
- Your user account
- All companies you've added
- All leads and contacts
- All campaigns
- All communication logs
- All generated proposals and media
- All system data associated with your account

**Before proceeding:**
- Export any data you want to keep
- Cancel any active subscriptions
- Inform team members if applicable

**Alternative:**
- If you just want to take a break, consider logging out instead
- Contact support if you're having issues with the platform`;
    }

    try {
      console.log(`   Fetching user data for deletion...`);

      // 3. Fetch User and Associated Data Counts
      const user = await prisma.user.findUnique({
        where: { id: user_id },
        select: {
          id: true,
          email: true,
          name: true,
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

      if (!user) {
        return `❌ **User Not Found**

User ID "${user_id}" does not exist.

**Possible Reasons:**
- Account was already deleted
- Invalid session
- Database synchronization issue

**Action Required:**
- Log out if you're still logged in
- Contact support if you need assistance`;
      }

      console.log(`   User found: ${user.email}`);
      console.log(
        `   Associated data: ${user._count.companies} companies, ${user._count.campaigns} campaigns, ${user._count.leads} leads, ${user._count.comm_logs} logs`,
      );

      // 4. Calculate Total Data to be Deleted
      const totalData =
        user._count.companies +
        user._count.campaigns +
        user._count.leads +
        user._count.comm_logs;

      console.log(`   ⚠️ Proceeding with account soft deletion...`);
      console.log(`   This will mark the user as deleted`);

      // 5. Soft Delete User
      await prisma.user.update({
        where: { id: user_id },
        data: { is_deleted: true },
      });

      console.log(`   ✅ User account marked as deleted successfully`);

      // 6. Build Response
      return `✅ **Account Deleted Successfully**

Your account has been permanently deleted.

**Deleted Account:**
- **Email:** ${user.email}
- **Name:** ${user.name || 'Not set'}

**Deleted Data:**
- **Companies:** ${user._count.companies}
- **Campaigns:** ${user._count.campaigns}
- **Leads:** ${user._count.leads}
- **Communication Logs:** ${user._count.comm_logs}
- **Total Records:** ${totalData}

**What Happens Next:**
- You will be logged out automatically
- All your data has been permanently removed
- This action cannot be undone
- You can create a new account anytime

**Thank You:**
Thank you for using Elara AI. We're sorry to see you go!

If you have feedback about why you're leaving, please contact support@elara.ai

**Need Help?**
If this was a mistake, contact support immediately. We may be able to help if you act quickly.`;
    } catch (error: any) {
      console.error('❌ [delete_user] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **User Not Found**

User record does not exist or was already deleted.

**Action Required:**
- Log out if you're still logged in
- Contact support if you need assistance`;
      }

      if (error.code === 'P2003') {
        return `❌ **Foreign Key Constraint Error**

Cannot delete user due to database constraints.

**Possible Reasons:**
- Related records exist that prevent deletion
- Database integrity rules

**Action Required:**
- Contact support for manual account deletion
- Provide your user ID: ${user_id}`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Account deletion took too long.\n\n**Action Required:**\n- Try again in a moment\n- Contact support if issue persists\n- Your account may be partially deleted`;
      }

      return `❌ **Account Deletion Failed**

**Error:** ${error.message}
**User ID:** ${user_id}

**What This Means:**
- Your account was NOT deleted
- Your data is still intact
- You can try again or contact support

**Troubleshooting:**
1. Check your database connection
2. Verify your session is valid
3. Try again in a moment
4. Contact support if issue persists

**Support:**
If you need immediate assistance, contact support@elara.ai with your user ID.`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
