import { z } from 'zod';
export declare class SendWhatsappService {
    private client;
    private lastConfigHash;
    private readonly sendWhatsappSchema;
    private getClient;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
