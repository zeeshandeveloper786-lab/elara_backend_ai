import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class AdsContentAgentService {
    private chatModel;
    constructor(chatModel: ChatOpenAI);
    execute(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const adsContentAgent: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
