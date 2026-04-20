import { z } from 'zod';
export declare class CreateCampaignDbService {
    private readonly createCampaignSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
