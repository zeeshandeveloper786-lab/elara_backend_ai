export declare function assertCompanyOwnedByUser(params: {
    user_id: string;
    company_id: string;
}): Promise<void>;
export declare function assertCampaignOwnedByUser(params: {
    user_id: string;
    campaign_id: string;
}): Promise<{
    id: string;
    company_id: string;
}>;
export declare function assertCampaignCompanyMatch(params: {
    user_id: string;
    campaign_id: string;
    company_id: string;
}): Promise<void>;
