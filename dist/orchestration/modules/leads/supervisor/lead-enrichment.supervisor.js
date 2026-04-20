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
exports.leadEnrichmentSupervisor = exports.LeadEnrichmentSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let LeadEnrichmentSupervisorService = class LeadEnrichmentSupervisorService {
    chatModel;
    leadsSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the lead discovery or enrichment request.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task requirements.'),
        next: zod_1.z.enum(['LeadEnrichmentAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific instruction for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.lead_supervisor_calls || 0;
        if (callCount >= 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                lead_supervisor_calls: 0,
                analysis: 'Lead task reached maximum iterations. Returning control to main supervisor.',
            };
        }
        const systemPrompt = `You are supervising lead discovery and enrichment operations.

CURRENT TASK: "${state.current_task || 'Find and enrich leads'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

CONTEXT AVAILABLE:
- Stored Memory: ${state.memory || 'No stored facts'}
- Conversation Summary: ${state.conversation_summary || 'New conversation'}
- Recent Tool Usage: ${state.tool_history || 'No recent tools'}

ROUTING DECISIONS:
1. Route to 'LeadEnrichmentAgent' when:
   - Finding companies by search query
   - Enriching company contacts with detailed information
   - Starting enrichment jobs for multiple companies
   - Retrieving company details

2. Route to 'ScripySupervisor' when:
   - Lead discovery/enrichment is complete
   - User needs to switch to different domain
   - Sufficient data already exists in memory

OPTIMIZATION:
- Check if requested leads are already in stored memory
- Avoid duplicate searches with same parameters
- Reuse existing results when applicable

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.leadsSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            lead_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.LeadEnrichmentSupervisorService = LeadEnrichmentSupervisorService;
exports.LeadEnrichmentSupervisorService = LeadEnrichmentSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], LeadEnrichmentSupervisorService);
const leadEnrichmentSupervisor = async (state, model) => {
    const service = new LeadEnrichmentSupervisorService(model);
    return service.supervise(state);
};
exports.leadEnrichmentSupervisor = leadEnrichmentSupervisor;
//# sourceMappingURL=lead-enrichment.supervisor.js.map