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
exports.campaignAgent = exports.CampaignAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const campaigns_tools_1 = require("../tools/campaigns.tools");
let CampaignAgentService = class CampaignAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const currentTask = state.current_task || 'Manage campaigns';
        const systemPrompt = `You are a campaign management specialist with access to campaign tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. create_campaign_db - Create new marketing campaigns
2. get_campaigns_list - Retrieve list of campaigns with filters

WORKFLOW GUIDELINES:
1. For campaign creation: Gather necessary details (name, type, budget, duration)
2. For campaign retrieval: Use filters to find specific campaigns
3. Check conversation history to avoid duplicate operations
4. Present results clearly with relevant metrics
5. Suggest next steps based on campaign status

CONTEXT AWARENESS:
- If previous campaigns were mentioned, reference them
- Use stored preferences if available
- Build on previous work in the conversation

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(campaigns_tools_1.campaignsTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'CampaignAgent',
        };
    }
};
exports.CampaignAgentService = CampaignAgentService;
exports.CampaignAgentService = CampaignAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], CampaignAgentService);
const campaignAgent = async (state, model) => {
    const service = new CampaignAgentService(model);
    return service.execute(state);
};
exports.campaignAgent = campaignAgent;
//# sourceMappingURL=campaign.agent.js.map