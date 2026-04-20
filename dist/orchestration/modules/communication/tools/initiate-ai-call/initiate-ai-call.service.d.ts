import { z } from 'zod';
export declare class InitiateAiCallService {
    private readonly initiateAiCallSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
