"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadEnrichmentAgent = exports.LeadEnrichmentAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const leads_tools_1 = require("../tools/leads.tools");
let LeadEnrichmentAgentService = class LeadEnrichmentAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const currentTask = state.current_task || 'Find and enrich leads';
        const systemPrompt = `You are a lead discovery and enrichment specialist with access to company search and enrichment tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. find_companies - Search for companies by query
2. start_enrichment_job - Enrich company contacts with detailed information
3. enrich_all_companies - Batch enrich unenriched companies
4. get_company_detail - Retrieve detailed company information

WORKFLOW GUIDELINES:
1. For company discovery: Use find_companies with specific search criteria
2. For enrichment: Use start_enrichment_job to get contact details
3. For batch operations: Use enrich_all_companies for multiple companies
4. For details: Use get_company_detail to retrieve full information
5. Build on previous discoveries mentioned in conversation

OPTIMIZATION:
- Check if requested companies are already mentioned in history
- Avoid duplicate searches with identical parameters
- Reuse existing results when applicable

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(leads_tools_1.leadsTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'LeadEnrichmentAgent',
        };
    }
};
exports.LeadEnrichmentAgentService = LeadEnrichmentAgentService;
exports.LeadEnrichmentAgentService = LeadEnrichmentAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], LeadEnrichmentAgentService);
const leadEnrichmentAgent = async (state, model) => {
    const service = new LeadEnrichmentAgentService(model);
    return service.execute(state);
};
exports.leadEnrichmentAgent = leadEnrichmentAgent;
//# sourceMappingURL=lead-enrichment.agent.js.map