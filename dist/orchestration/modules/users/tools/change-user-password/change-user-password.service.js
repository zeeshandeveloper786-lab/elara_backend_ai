"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeUserPasswordService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const bcrypt = __importStar(require("bcrypt"));
let ChangeUserPasswordService = class ChangeUserPasswordService {
    schema = zod_1.z.object({
        old_password: zod_1.z
            .string()
            .min(1)
            .describe('Current password for verification'),
        new_password: zod_1.z
            .string()
            .min(8)
            .max(128)
            .describe('New password (8-128 characters, mix of uppercase, lowercase, numbers, and symbols recommended)'),
    });
    async execute(input, state) {
        const { old_password, new_password } = input;
        console.log(`🚀 [TOOL STARTED] change_user_password - Params: ${JSON.stringify({ old_password: '***', new_password: '***' })} - User: ${state.user_id}`);
        const { user_id } = state;
        console.log(`🔑 [change_user_password] Starting password change`);
        console.log(`   User ID: ${user_id}`);
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
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
        const strengthText = strengthScore === 4
            ? '🟢 Strong'
            : strengthScore === 3
                ? '🟡 Medium'
                : strengthScore === 2
                    ? '🟠 Weak'
                    : '🔴 Very Weak';
        try {
            console.log(`   Fetching user data...`);
            const user = await prisma_client_1.prisma.user.findFirst({
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
            const hashedNewPassword = await bcrypt.hash(new_password, 10);
            console.log(`   Updating password in database...`);
            await prisma_client_1.prisma.user.update({
                where: { id: user_id },
                data: {
                    password: hashedNewPassword,
                    updatedAt: new Date(),
                },
            });
            console.log(`   ✅ Password changed successfully`);
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
        }
        catch (error) {
            console.error('❌ [change_user_password] Error:', error);
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
};
exports.ChangeUserPasswordService = ChangeUserPasswordService;
exports.ChangeUserPasswordService = ChangeUserPasswordService = __decorate([
    (0, common_1.Injectable)()
], ChangeUserPasswordService);
//# sourceMappingURL=change-user-password.service.js.map