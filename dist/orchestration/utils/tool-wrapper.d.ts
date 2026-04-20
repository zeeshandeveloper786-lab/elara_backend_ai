import { z } from 'zod';
export declare function createScryTool(handler: (args: any, state: any) => Promise<string>, config: {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    requireUser?: boolean;
}): import("@langchain/core/tools").DynamicStructuredTool<z.ZodType<unknown, unknown, z.core.$ZodTypeInternals<unknown, unknown>>, unknown, unknown, string, unknown, string>;
