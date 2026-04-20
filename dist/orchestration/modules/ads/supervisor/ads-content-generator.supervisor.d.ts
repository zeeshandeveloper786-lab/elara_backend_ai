import { ChatOpenAI } from '@langchain/openai';
import { ScrpyState } from '../../../models/scrpy-state.model';
export declare class AdsContentGeneratorSupervisorService {
    private chatModel;
    private readonly adsSupervisorSchema;
    constructor(chatModel: ChatOpenAI);
    supervise(state: ScrpyState): Promise<Partial<ScrpyState>>;
}
export declare const adsContentGeneratorSupervisor: (state: ScrpyState, model: ChatOpenAI) => Promise<Partial<ScrpyState>>;
