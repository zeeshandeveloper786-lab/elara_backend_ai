import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class MediaGeneratorAgentService {
    private chatModel;
    constructor(chatModel: ChatOpenAI);
    execute(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const mediaGeneratorAgent: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
