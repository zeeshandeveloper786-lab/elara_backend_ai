import { ChatOpenAI } from '@langchain/openai';
export declare const createModel: (apiKey?: string, modelName?: string) => ChatOpenAI<import("@langchain/openai").ChatOpenAICallOptions>;
