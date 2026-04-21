import { z } from 'zod';
export declare class CheckSystemHealthService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{}, z.core.$strip>;
}
