import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class CommunicationProposalSupervisorService {
    private chatModel;
    private readonly communicationSupervisorSchema;
    constructor(chatModel: ChatOpenAI);
    supervise(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const communicationProposalSupervisor: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
