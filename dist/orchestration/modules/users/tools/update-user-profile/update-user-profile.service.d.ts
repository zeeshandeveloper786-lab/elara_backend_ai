import { z } from 'zod';
export declare class UpdateUserProfileService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}
