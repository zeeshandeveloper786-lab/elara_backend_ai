"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCompanyDetailService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
let GetCompanyDetailService = class GetCompanyDetailService {
    getCompanyDetailSchema = zod_1.z.object({
        name_or_url: zod_1.z
            .string()
            .min(1, 'Company name or URL is required')
            .max(200, 'Search term must not exceed 200 characters')
            .describe('Company name or domain to search for'),
    });
    async execute(input, state) {
        const { name_or_url } = input;
        const { user_id } = state;
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (!name_or_url || name_or_url.trim().length === 0) {
            return '❌ **Validation Error:** Company name or URL is required.';
        }
        if (name_or_url.length > 200) {
            return `❌ **Validation Error:** Search term is too long. Maximum 200 characters.`;
        }
        try {
            const searchTerm = name_or_url.trim();
            const company = await prisma_client_1.prisma.company.findFirst({
                where: {
                    user_id,
                    user: { is_deleted: false },
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { domain: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                include: {
                    leads: {
                        orderBy: { createdAt: 'desc' },
                    },
                    campaigns: {
                        select: {
                            id: true,
                            name: true,
                            status: true,
                            type: true,
                        },
                    },
                    _count: {
                        select: {
                            leads: true,
                            campaigns: true,
                        },
                    },
                },
            });
            if (!company) {
                const similarCompanies = await prisma_client_1.prisma.company.findMany({
                    where: {
                        user_id,
                        user: { is_deleted: false },
                        OR: [
                            {
                                name: {
                                    contains: searchTerm.substring(0, 5),
                                    mode: 'insensitive',
                                },
                            },
                            {
                                domain: {
                                    contains: searchTerm.substring(0, 5),
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    take: 5,
                    select: {
                        name: true,
                        domain: true,
                    },
                });
                let response = `❌ **Company Not Found**

No company matching "${searchTerm}" was found in your database.`;
                if (similarCompanies.length > 0) {
                    response += `\n\n**Similar Companies:**\n${similarCompanies.map((c) => `- ${c.name} (${c.domain})`).join('\n')}`;
                }
                response += `\n\n💡 **Suggestions:**
- Check spelling and try again
- Use \`find_companies\` to discover new companies
- Try searching by domain instead of name`;
                return response;
            }
            const communicationStats = await prisma_client_1.prisma.communicationLog.count({
                where: {
                    user_id,
                    company_id: company.id,
                },
            });
            let response = `🏢 **Company Details**

**Basic Information:**
- **Name:** ${company.name}
- **Domain:** ${company.domain || 'Not available'}
- **Added:** ${company.createdAt.toLocaleDateString()}
- **Last Updated:** ${company.updatedAt.toLocaleDateString()}

📊 **Statistics:**
- **Total Leads:** ${company._count.leads}
- **Active Campaigns:** ${company._count.campaigns}
- **Communications Sent:** ${communicationStats}`;
            if (company.leads.length > 0) {
                response += `\n\n👥 **Leads (${company.leads.length}):**\n\n`;
                company.leads.forEach((lead, index) => {
                    response += `**${index + 1}. ${lead.name}**\n`;
                    response += `   - **Position:** ${lead.position}\n`;
                    response += `   - **Email:** ${lead.email !== 'N/A' ? lead.email : 'Not available'}\n`;
                    if (lead.phone && lead.phone !== 'N/A') {
                        response += `   - **Phone:** ${lead.phone}\n`;
                    }
                    if (lead.linkedIn && lead.linkedIn !== 'N/A') {
                        response += `   - **LinkedIn:** ${lead.linkedIn}\n`;
                    }
                    response += `   - **Added:** ${lead.createdAt.toLocaleDateString()}\n\n`;
                });
            }
            else {
                response += `\n\n👥 **Leads:** None found

💡 Use \`start_enrichment_job\` to find decision-maker contacts for this company.`;
            }
            if (company.campaigns.length > 0) {
                response += `\n📢 **Campaigns (${company.campaigns.length}):**\n\n`;
                const campaignTable = company.campaigns
                    .map((c) => `| ${c.name} | ${c.status} | ${c.type} |`)
                    .join('\n');
                response += `| Campaign Name | Status | Type |\n| :------------ | :----- | :--- |\n${campaignTable}`;
            }
            else {
                response += `\n\n📢 **Campaigns:** Not linked to any campaigns`;
            }
            response += `\n\n💡 **Next Steps:**`;
            if (company.leads.length === 0) {
                response += `\n- Use \`start_enrichment_job\` to find contacts`;
            }
            else {
                response += `\n- Use \`generate_message\` to create personalized outreach`;
                response += `\n- Use \`send_email\` or \`send_sms\` to contact leads`;
            }
            if (company.campaigns.length === 0) {
                response += `\n- Create a campaign to organize outreach`;
            }
            response += `\n- Use \`create_proposal\` to generate business proposals`;
            return response;
        }
        catch (error) {
            if (error.code === 'P2025') {
                return `❌ **Database Error:** Company record not found.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Database query took too long. Please try again.`;
            }
            if (error.message?.includes('connection')) {
                return `❌ **Database Connection Error:** Could not connect to database.`;
            }
            return `❌ **Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.getCompanyDetailSchema;
    }
};
exports.GetCompanyDetailService = GetCompanyDetailService;
exports.GetCompanyDetailService = GetCompanyDetailService = __decorate([
    (0, common_1.Injectable)()
], GetCompanyDetailService);
//# sourceMappingURL=get-company-detail.service.js.map