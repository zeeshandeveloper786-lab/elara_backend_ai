import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
export declare class GenerateAdContentService {
    private chatModel;
    private readonly generateAdContentSchema;
    constructor(chatModel: ChatOpenAI);
    getSchema(): z.ZodObject<{
        platform: z.ZodEnum<{
            Facebook: "Facebook";
            Instagram: "Instagram";
            LinkedIn: "LinkedIn";
            "Google Ads": "Google Ads";
            Twitter: "Twitter";
        }>;
        core_message: z.ZodString;
        target_audience: z.ZodOptional<z.ZodString>;
        ad_title: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    execute({ platform, core_message, target_audience, ad_title }: {
        platform: any;
        core_message: any;
        target_audience: any;
        ad_title: any;
    }, state: any): Promise<string>;
}
