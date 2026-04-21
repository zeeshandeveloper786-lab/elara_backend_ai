import { z } from 'zod';
export declare class GetCompanyDetailService {
    private readonly getCompanyDetailSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
