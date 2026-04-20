import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class CampaignSupervisorService {
    private chatModel;
    private readonly campaignsSupervisorSchema;
    constructor(chatModel: ChatOpenAI);
    supervise(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const campaignSupervisor: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
