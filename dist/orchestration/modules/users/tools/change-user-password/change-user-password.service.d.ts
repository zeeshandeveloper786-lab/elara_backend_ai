import { z } from 'zod';
export declare class ChangeUserPasswordService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        old_password: z.ZodString;
        new_password: z.ZodString;
    }, z.core.$strip>;
}
