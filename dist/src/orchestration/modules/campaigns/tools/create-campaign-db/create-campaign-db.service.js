"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCampaignDbService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const ownership_1 = require("../../../../utils/ownership");
let CreateCampaignDbService = class CreateCampaignDbService {
    createCampaignSchema = zod_1.z.object({
        name: zod_1.z
            .string()
            .min(3, 'Campaign name must be at least 3 characters')
            .max(100, 'Campaign name must not exceed 100 characters')
            .describe('The name of the marketing campaign'),
        type: zod_1.z
            .enum([
            'outreach',
            'ads',
            'email',
            'social',
            'content',
            'seo',
            'ppc',
            'cold-calling',
            'events',
            'other',
        ])
            .optional()
            .default('outreach')
            .describe('The type of campaign (outreach, ads, email, social, content, seo, ppc, cold-calling, events, other)'),
        budget: zod_1.z
            .number()
            .min(0, 'Budget cannot be negative')
            .max(10000000, 'Budget exceeds maximum allowed value')
            .optional()
            .describe('Budget allocated for this campaign'),
        duration: zod_1.z
            .string()
            .optional()
            .describe('Campaign duration (e.g., "30 days", "Q2 2024", "ongoing")'),
    });
    async execute(input, state) {
        const { name, type, budget, duration } = input;
        const { user_id, company_id } = state;
        console.log(`🚀 [create_campaign_db] Starting campaign creation: "${name}"`);
        const sanitizedName = name.trim();
        if (sanitizedName.length < 3) {
            console.warn('❌ [create_campaign_db] Campaign name too short');
            return '❌ Error: Campaign name must be at least 3 characters long.';
        }
        if (sanitizedName.length > 100) {
            console.warn('❌ [create_campaign_db] Campaign name too long');
            return '❌ Error: Campaign name is too long (max 100 characters).';
        }
        if (budget !== undefined && budget < 0) {
            console.warn('❌ [create_campaign_db] Negative budget provided');
            return '❌ Error: Budget cannot be negative. Please provide a valid budget amount.';
        }
        if (budget !== undefined && budget > 10000000) {
            console.warn('❌ [create_campaign_db] Budget exceeds reasonable limit');
            return '❌ Error: Budget exceeds maximum allowed value (10,000,000).';
        }
        const validTypes = [
            'outreach',
            'ads',
            'email',
            'social',
            'content',
            'seo',
            'ppc',
            'cold-calling',
            'events',
            'other',
        ];
        const sanitizedType = (type || 'outreach').toLowerCase().trim();
        if (!validTypes.includes(sanitizedType)) {
            console.warn(`⚠️ [create_campaign_db] Invalid campaign type: ${sanitizedType}`);
            return `❌ Error: Invalid campaign type "${sanitizedType}". Valid types: ${validTypes.join(', ')}`;
        }
        try {
            if (company_id) {
                console.log(`🔐 [create_campaign_db] Verifying ownership for company: ${company_id}`);
                try {
                    await (0, ownership_1.assertCompanyOwnedByUser)({ user_id, company_id });
                    console.log(`✅ [create_campaign_db] Ownership verified for company: ${company_id}`);
                }
                catch (err) {
                    console.error(`❌ [create_campaign_db] Ownership verification failed:`, err.message);
                    return `❌ Ownership Error: You do not have permission to create a campaign for Company ID: ${company_id}. Please verify the company belongs to your account.`;
                }
            }
            const existingCampaign = await prisma_client_1.prisma.campaign.findFirst({
                where: {
                    user_id,
                    user: { is_deleted: false },
                    name: sanitizedName,
                },
            });
            if (existingCampaign) {
                console.warn(`⚠️ [create_campaign_db] Duplicate campaign name detected: ${sanitizedName}`);
                return `⚠️ Warning: A campaign named "${sanitizedName}" already exists (ID: ${existingCampaign.id}). 

**Options:**
- Use a different name for this campaign
- Update the existing campaign instead
- Add a suffix to make it unique (e.g., "${sanitizedName} - Q2 2024")`;
            }
            console.log(`💾 [create_campaign_db] Creating campaign in database`);
            const campaign = await prisma_client_1.prisma.campaign.create({
                data: {
                    name: sanitizedName,
                    type: sanitizedType,
                    user_id,
                    status: 'draft',
                    budget: budget || 0,
                    duration: duration || 'ongoing',
                    company_id: company_id || null,
                },
                include: {
                    company: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
            console.log(`✅ [create_campaign_db] Campaign created successfully (ID: ${campaign.id})`);
            const formattedBudget = campaign.budget
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                }).format(campaign.budget)
                : 'Not set';
            return `✅ **Campaign Created Successfully!**

**Campaign Details:**
- **Name:** ${campaign.name}
- **Type:** ${campaign.type}
- **Status:** ${campaign.status}
- **Budget:** ${formattedBudget}
- **Duration:** ${campaign.duration}
- **Linked Company:** ${campaign.company ? `${campaign.company.name}` : 'None'}
- **Created:** ${campaign.createdAt.toLocaleDateString()}

---

**Next Steps:**
1. 🎯 Find and enrich leads for this campaign
2. 📝 Generate ad content or marketing materials
3. 📊 Set up tracking and analytics
4. 🚀 Change status to "active" when ready to launch

💡 **Tip:** Link this campaign to a company for better organization and reporting.`;
        }
        catch (error) {
            console.error('❌ [create_campaign_db] Error:', error);
            if (error.code === 'P2002') {
                return `❌ Database Error: A campaign with this name already exists. Please choose a different name.`;
            }
            if (error.code === 'P2003') {
                return `❌ Database Error: Invalid company_id reference. The company may have been deleted.`;
            }
            if (error.message?.includes('timeout')) {
                return '❌ Timeout Error: Database operation took too long. Please try again.';
            }
            if (error.message?.includes('connection')) {
                return '❌ Connection Error: Unable to connect to database. Please check your connection.';
            }
            return `❌ Error creating campaign: ${error.message || 'Unknown error occurred'}. Please try again or contact support if the issue persists.`;
        }
    }
    getSchema() {
        return this.createCampaignSchema;
    }
};
exports.CreateCampaignDbService = CreateCampaignDbService;
exports.CreateCampaignDbService = CreateCampaignDbService = __decorate([
    (0, common_1.Injectable)()
], CreateCampaignDbService);
//# sourceMappingURL=create-campaign-db.service.js.map