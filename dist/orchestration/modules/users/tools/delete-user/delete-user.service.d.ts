import { z } from 'zod';
export declare class DeleteUserService {
    private readonly schema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodObject<{
        confirm: z.ZodBoolean;
    }, z.core.$strip>;
}
