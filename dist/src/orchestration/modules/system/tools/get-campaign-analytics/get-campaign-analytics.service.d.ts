import { z } from 'zod';
export declare class GetCampaignAnalyticsService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{}, z.core.$strip>;
}
