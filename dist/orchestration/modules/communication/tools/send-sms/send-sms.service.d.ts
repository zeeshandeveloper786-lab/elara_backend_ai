import { z } from 'zod';
export declare class SendSmsService {
    private client;
    private lastConfigHash;
    private readonly sendSmsSchema;
    private getClient;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
