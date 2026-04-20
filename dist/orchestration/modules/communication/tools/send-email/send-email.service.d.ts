import { z } from 'zod';
export declare class SendEmailService {
    private transporter;
    private lastConfigHash;
    private readonly sendEmailSchema;
    private getTransporter;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
