import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class LeadEnrichmentAgentService {
    private chatModel;
    constructor(chatModel: ChatOpenAI);
    execute(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const leadEnrichmentAgent: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
