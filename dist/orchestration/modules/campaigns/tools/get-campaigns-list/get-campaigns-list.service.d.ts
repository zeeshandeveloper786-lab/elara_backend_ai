import { z } from 'zod';
export declare class GetCampaignsListService {
    private readonly getCampaignsListSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
