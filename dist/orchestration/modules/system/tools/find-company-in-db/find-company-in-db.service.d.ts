import { z } from 'zod';
export declare class FindCompanyInDbService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        query: z.ZodString;
    }, z.core.$strip>;
}
