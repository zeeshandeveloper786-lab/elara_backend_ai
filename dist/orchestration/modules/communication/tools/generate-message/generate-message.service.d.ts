import { z } from 'zod';
export declare class GenerateMessageService {
    private readonly generateMessageSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
