"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCompanyOwnedByUser = assertCompanyOwnedByUser;
exports.assertCampaignOwnedByUser = assertCampaignOwnedByUser;
exports.assertCampaignCompanyMatch = assertCampaignCompanyMatch;
const prisma_client_1 = require("../../prisma-client");
async function assertCompanyOwnedByUser(params) {
    const { user_id, company_id } = params;
    const company = await prisma_client_1.prisma.company.findFirst({
        where: {
            id: company_id,
            user_id,
            user: { is_deleted: false },
        },
        select: { id: true },
    });
    if (!company) {
        throw new Error('Access denied: company_id is missing or does not belong to the current user.');
    }
}
async function assertCampaignOwnedByUser(params) {
    const { user_id, campaign_id } = params;
    const campaign = await prisma_client_1.prisma.campaign.findFirst({
        where: {
            id: campaign_id,
            user_id,
            user: { is_deleted: false },
        },
        select: { id: true, company_id: true },
    });
    if (!campaign) {
        throw new Error('Access denied: campaign_id is missing or does not belong to the current user.');
    }
    return campaign;
}
async function assertCampaignCompanyMatch(params) {
    const { user_id, campaign_id, company_id } = params;
    const campaign = await assertCampaignOwnedByUser({ user_id, campaign_id });
    if (campaign.company_id && campaign.company_id !== company_id) {
        throw new Error('Access denied: campaign_id does not belong to the provided company_id.');
    }
}
//# sourceMappingURL=ownership.js.map