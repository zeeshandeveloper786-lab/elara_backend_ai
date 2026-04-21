import { z } from 'zod';
export declare class GenerateMediaService {
    private readonly generateMediaSchema;
    private openai;
    constructor();
    getSchema(): z.ZodObject<{
        prompt: z.ZodString;
        size: z.ZodDefault<z.ZodEnum<{
            "1024x1024": "1024x1024";
            "1792x1024": "1792x1024";
        }>>;
        style: z.ZodDefault<z.ZodEnum<{
            natural: "natural";
            vivid: "vivid";
        }>>;
    }, z.core.$strip>;
    execute(input: any, state: any): Promise<string>;
}
