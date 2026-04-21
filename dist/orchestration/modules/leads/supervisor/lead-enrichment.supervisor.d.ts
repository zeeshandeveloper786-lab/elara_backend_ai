import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class LeadEnrichmentSupervisorService {
    private chatModel;
    private readonly leadsSupervisorSchema;
    constructor(chatModel: ChatOpenAI);
    supervise(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const leadEnrichmentSupervisor: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
