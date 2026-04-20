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
exports.campaignSupervisor = exports.CampaignSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let CampaignSupervisorService = class CampaignSupervisorService {
    chatModel;
    campaignsSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the campaign request and current state.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task requirements.'),
        next: zod_1.z.enum(['CampaignAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific instruction for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.campaign_supervisor_calls || 0;
        if (callCount > 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                campaign_supervisor_calls: 0,
                analysis: 'Campaign task reached limit.',
            };
        }
        const systemPrompt = `You are supervising campaign management operations.

CURRENT TASK: "${state.current_task || 'Manage campaigns'}"
USER: ${state.user_name || 'User'} | Campaign ID: ${state.campaign_id || 'None'}

CONTEXT AVAILABLE:
- Stored Memory: ${state.memory || 'No stored facts'}
- Conversation Summary: ${state.conversation_summary || 'New conversation'}
- Recent Tool Usage: ${state.tool_history || 'No recent tools'}

ROUTING DECISIONS:
1. Route to 'CampaignAgent' when:
   - Creating new campaigns
   - Retrieving campaign lists or details
   - Updating campaign information
   - Analyzing campaign performance

2. Route to 'ScripySupervisor' when:
   - Campaign task is complete
   - User needs to switch to different domain
   - Clarification needed from user

OPTIMIZATION:
- Check if similar data was already retrieved in recent history
- Reuse existing results if parameters haven't changed
- Avoid redundant tool calls

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.campaignsSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            campaign_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.CampaignSupervisorService = CampaignSupervisorService;
exports.CampaignSupervisorService = CampaignSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], CampaignSupervisorService);
const campaignSupervisor = async (state, model) => {
    const service = new CampaignSupervisorService(model);
    return service.supervise(state);
};
exports.campaignSupervisor = campaignSupervisor;
//# sourceMappingURL=campaign.supervisor.js.map