import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class SystemInsightAgentService {
    private chatModel;
    constructor(chatModel: ChatOpenAI);
    execute(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const systemInsightAgent: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
