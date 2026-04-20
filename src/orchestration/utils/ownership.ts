import { prisma } from '../../prisma-client';

export async function assertCompanyOwnedByUser(params: {
  user_id: string;
  company_id: string;
}) {
  const { user_id, company_id } = params;
  const company = await prisma.company.findFirst({
    where: {
      id: company_id,
      user_id,
      user: { is_deleted: false },
    },
    select: { id: true },
  });
  if (!company) {
    throw new Error(
      'Access denied: company_id is missing or does not belong to the current user.',
    );
  }
}

export async function assertCampaignOwnedByUser(params: {
  user_id: string;
  campaign_id: string;
}) {
  const { user_id, campaign_id } = params;
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaign_id,
      user_id,
      user: { is_deleted: false },
    },
    select: { id: true, company_id: true },
  });
  if (!campaign) {
    throw new Error(
      'Access denied: campaign_id is missing or does not belong to the current user.',
    );
  }
  return campaign;
}

export async function assertCampaignCompanyMatch(params: {
  user_id: string;
  campaign_id: string;
  company_id: string;
}) {
  const { user_id, campaign_id, company_id } = params;
  const campaign = await assertCampaignOwnedByUser({ user_id, campaign_id });
  if (campaign.company_id && campaign.company_id !== company_id) {
    throw new Error(
      'Access denied: campaign_id does not belong to the provided company_id.',
    );
  }
}
