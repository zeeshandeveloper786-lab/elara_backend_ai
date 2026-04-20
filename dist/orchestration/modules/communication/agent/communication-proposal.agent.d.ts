import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class CommunicationProposalAgentService {
    private chatModel;
    constructor(chatModel: ChatOpenAI);
    execute(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const communicationProposalAgent: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
