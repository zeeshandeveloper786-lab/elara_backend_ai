import { z } from 'zod';
export declare class GetProspectsListService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        company_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        offset: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, z.core.$strip>;
}
