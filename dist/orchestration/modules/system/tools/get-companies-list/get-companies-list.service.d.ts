import { z } from 'zod';
export declare class GetCompaniesListService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    }, z.core.$strip>;
}
