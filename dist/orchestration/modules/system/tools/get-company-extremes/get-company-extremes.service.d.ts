import { z } from 'zod';
export declare class GetCompanyExtremesService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{}, z.core.$strip>;
}
