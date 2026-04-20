import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChangeUserPasswordService {
  private readonly schema = z.object({
    old_password: z
      .string()
      .min(1)
      .describe('Current password for verification'),
    new_password: z
      .string()
      .min(8)
      .max(128)
      .describe(
        'New password (8-128 characters, mix of uppercase, lowercase, numbers, and symbols recommended)',
      ),
  });

  async execute(input: any, state: any): Promise<string> {
    const { old_password, new_password } = input;
    console.log(
      `🚀 [TOOL STARTED] change_user_password - Params: ${JSON.stringify({ old_password: '***', new_password: '***' })} - User: ${state.user_id}`,
    );
    const { user_id } = state;
    console.log(`🔑 [change_user_password] Starting password change`);
    console.log(`   User ID: ${user_id}`);

    // 1. User Context Validation
    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    // 2. Input Validation
    if (!old_password || old_password.trim().length === 0) {
      return '❌ **Validation Error:** Current password is required.';
    }

    if (!new_password || new_password.trim().length === 0) {
      return '❌ **Validation Error:** New password is required.';
    }

    if (new_password.length < 8) {
      return `❌ **Validation Error:** New password is too short (${new_password.length} characters).\n\n**Password Requirements:**\n- Minimum 8 characters\n- Recommended: Mix of uppercase, lowercase, numbers, and symbols`;
    }

    if (new_password.length > 128) {
      return `❌ **Validation Error:** New password is too long (${new_password.length} characters). Maximum 128 characters.`;
    }

    if (old_password === new_password) {
      return '❌ **Validation Error:** New password must be different from current password.';
    }

    // 3. Password Strength Check
    const hasUpperCase = /[A-Z]/.test(new_password);
    const hasLowerCase = /[a-z]/.test(new_password);
    const hasNumbers = /\d/.test(new_password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(new_password);

    const strengthScore = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    ].filter(Boolean).length;
    const strengthText =
      strengthScore === 4
        ? '🟢 Strong'
        : strengthScore === 3
          ? '🟡 Medium'
          : strengthScore === 2
            ? '🟠 Weak'
            : '🔴 Very Weak';

    try {
      console.log(`   Fetching user data...`);

      // 4. Fetch User
      const user = await prisma.user.findFirst({
        where: { id: user_id, is_deleted: false },
        select: {
          id: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        return `❌ **User Not Found**

User ID "${user_id}" does not exist.

**Action Required:**
- Log out and log in again
- Contact support if issue persists`;
      }

      console.log(`   Verifying current password for: ${user.email}`);

      // 5. Verify Old Password
      const isPasswordValid = await bcrypt.compare(old_password, user.password);

      if (!isPasswordValid) {
        console.log(`   ❌ Password verification failed`);
        return `❌ **Current Password Incorrect**

The current password you provided is incorrect.

**Troubleshooting:**
- Check for typos and try again
- Ensure Caps Lock is off
- If you forgot your password, use the password reset feature
- Contact support if you continue to have issues`;
      }

      console.log(`   ✅ Current password verified`);
      console.log(`   Hashing new password...`);

      // 6. Hash New Password
      const hashedNewPassword = await bcrypt.hash(new_password, 10);

      console.log(`   Updating password in database...`);

      // 7. Update Password
      await prisma.user.update({
        where: { id: user_id },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
      });

      console.log(`   ✅ Password changed successfully`);

      // 8. Build Response
      return `✅ **Password Changed Successfully**

Your password has been updated securely.

**Password Strength:** ${strengthText}

${strengthScore < 3 ? `\n⚠️ **Security Recommendation:**\nYour password strength is ${strengthText.split(' ')[1]}. Consider using:\n- Mix of uppercase and lowercase letters\n- Numbers\n- Special characters (!@#$%^&*)\n- At least 12 characters for better security\n` : ''}
🔒 **Security Tips:**
- Never share your password with anyone
- Use a unique password for this account
- Consider using a password manager
- Change your password regularly
- Enable two-factor authentication if available

💡 **Next Steps:**
- Log out and log in with your new password to verify
- Update your password manager if you use one
- Keep your new password secure`;
    } catch (error: any) {
      console.error('❌ [change_user_password] Error:', error);

      // Specific error handling
      if (error.code === 'P2025') {
        return `❌ **User Not Found**

User record does not exist.

**Action Required:**
- Log out and log in again
- Contact support if issue persists`;
      }

      if (error.message?.includes('timeout')) {
        return `❌ **Timeout Error:** Database update took too long.\n\nPlease try again in a moment.`;
      }

      if (error.message?.includes('bcrypt')) {
        return `❌ **Password Hashing Error:** Failed to securely hash password.\n\nPlease try again or contact support.`;
      }

      return `❌ **Password Change Error**

**Error:** ${error.message}

**Troubleshooting:**
1. Check your database connection
2. Verify your session is valid
3. Try again in a moment
4. Contact support if issue persists`;
    }
  }

  getSchema() {
    return this.schema;
  }
}
