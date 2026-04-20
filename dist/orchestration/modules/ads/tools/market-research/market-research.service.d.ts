import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
export declare class MarketResearchService {
    private chatModel;
    private readonly marketResearchSchema;
    constructor(chatModel: ChatOpenAI);
    getSchema(): z.ZodObject<{
        query: z.ZodString;
    }, z.core.$strip>;
    execute({ query }: {
        query: any;
    }, state: any): Promise<string>;
}
