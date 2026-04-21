import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class ScripySupervisorService {
    private chatModel;
    private readonly autonomySchema;
    constructor(chatModel: ChatOpenAI);
    supervise(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const scripySupervisor: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
