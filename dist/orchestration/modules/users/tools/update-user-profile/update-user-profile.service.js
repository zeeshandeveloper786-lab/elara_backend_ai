"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let UpdateUserProfileService = class UpdateUserProfileService {
    schema = zod_1.z.object({
        name: zod_1.z
            .string()
            .min(1)
            .max(100)
            .optional()
            .describe('New display name for the user (1-100 characters)'),
        email: zod_1.z
            .string()
            .email()
            .optional()
            .describe('New email address (must be valid and unique)'),
    });
    async execute(input, state) {
        const { name, email } = input;
        console.log(`🚀 [TOOL STARTED] update_user_profile - Params: ${JSON.stringify({ name, email })} - User: ${state.user_id}`);
        const { user_id } = state;
        console.log(`⚙️ [update_user_profile] Starting profile update`);
        console.log(`   User ID: ${user_id}`);
        console.log(`   Name: ${name || 'Not changing'}`);
        console.log(`   Email: ${email || 'Not changing'}`);
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (!name && !email) {
            return '❌ **Validation Error:** At least one field (name or email) must be provided for update.';
        }
        if (name && name.trim().length === 0) {
            return '❌ **Validation Error:** Name cannot be empty.';
        }
        if (name && name.length > 100) {
            return `❌ **Validation Error:** Name is too long (${name.length} characters). Maximum 100 characters.`;
        }
        if (email && email.trim().length === 0) {
            return '❌ **Validation Error:** Email cannot be empty.';
        }
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return `❌ **Validation Error:** Invalid email format: "${email}"\n\nPlease provide a valid email address (e.g., user@example.com).`;
        }
        try {
            console.log(`   Fetching current user data...`);
            const currentUser = await prisma_client_1.prisma.user.findFirst({
                where: { id: user_id, is_deleted: false },
                select: {
                    name: true,
                    email: true,
                },
            });
            if (!currentUser) {
                return `❌ **User Not Found**

User ID "${user_id}" does not exist.

**Action Required:**
- Log out and log in again
- Contact support if issue persists`;
            }
            if (email && email !== currentUser.email) {
                console.log(`   Checking for email conflicts...`);
                const existingUser = await prisma_client_1.prisma.user.findFirst({
                    where: { email, is_deleted: false },
                });
                if (existingUser) {
                    return `❌ **Email Already Exists**

The email "${email}" is already registered to another account.

**Solutions:**
- Use a different email address
- If this is your email, contact support to resolve the conflict`;
                }
            }
            const updateData = {};
            if (name)
                updateData.name = name.trim();
            if (email)
                updateData.email = email.trim().toLowerCase();
            console.log(`   Updating user profile...`);
            const updatedUser = await prisma_client_1.prisma.user.update({
                where: { id: user_id },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    updatedAt: true,
                },
            });
            console.log(`   ✅ Profile updated successfully`);
            const changes = [];
            if (name && name !== currentUser.name) {
                changes.push(`- **Name:** "${currentUser.name || 'Not set'}" → "${updatedUser.name}"`);
            }
            if (email && email.toLowerCase() !== currentUser.email.toLowerCase()) {
                changes.push(`- **Email:** "${currentUser.email}" → "${updatedUser.email}"`);
            }
            return `✅ **Profile Updated Successfully**

**Updated Information:**
${changes.join('\n')}

**Current Profile:**
- **Name:** ${updatedUser.name || 'Not set'}
- **Email:** ${updatedUser.email}
- **Last Updated:** ${updatedUser.updatedAt.toLocaleDateString()} at ${updatedUser.updatedAt.toLocaleTimeString()}

${email && email !== currentUser.email ? '\n⚠️ **Important:** If you changed your email, you may need to verify it or use it for your next login.\n' : ''}
💡 **Next Steps:**
- Use \`get_user_profile\` to view your complete profile
- Use \`change_user_password\` if you need to update your password`;
        }
        catch (error) {
            console.error('❌ [update_user_profile] Error:', error);
            if (error.code === 'P2002') {
                return `❌ **Duplicate Email Error**

The email "${email}" is already registered to another account.

**Solutions:**
- Use a different email address
- Contact support if you believe this is an error`;
            }
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
            return `❌ **Update Error**

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
exports.UpdateUserProfileService = UpdateUserProfileService;
exports.UpdateUserProfileService = UpdateUserProfileService = __decorate([
    (0, common_1.Injectable)()
], UpdateUserProfileService);
//# sourceMappingURL=update-user-profile.service.js.map