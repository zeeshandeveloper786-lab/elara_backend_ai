import { z } from 'zod';
export declare class CreateProposalService {
    private readonly createProposalSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
