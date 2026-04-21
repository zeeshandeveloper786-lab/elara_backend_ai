import { z } from 'zod';
export declare class FindCompaniesService {
    private readonly findCompaniesSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
