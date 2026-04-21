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
exports.adsContentAgent = exports.AdsContentAgentService = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const messages_1 = require("@langchain/core/messages");
const ads_tools_1 = require("../tools/ads.tools");
let AdsContentAgentService = class AdsContentAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const campaignContext = state.campaign_id || 'No active campaign';
        const currentTask = state.current_task || 'Generate ad content';
        const systemPrompt = `You are the Ads & Marketing Specialist for Elara. 
Your expertise lies in conducting deep market research and crafting high-converting ad copy.

### CONTEXT:
- **Current Objective**: "${currentTask}"
- **Plan Progress**: ${JSON.stringify(state.tasks || [])}
- **User**: ${userContext} (ID: ${state.user_id})
- **Campaign**: ${campaignContext}

### YOUR TOOLS:
1. **market_research**: Use this to analyze competitors, audience pain points, and trends. Essential for new or complex topics.
2. **generate_ad_content**: Use this to create the actual ad copy for platforms like Facebook, Google, LinkedIn, etc.

### WORKFLOW:
1. **Research First**: If you don't have enough audience or competitor data, perform 'market_research' first.
2. **Platform Specifics**: When generating ads, ensure you follow the best practices for the chosen platform.
3. **Drafting**: All generated ads are automatically saved to the database as drafts.
4. **Reasoning**: Always explain WHY you chose a certain marketing angle or research strategy.

### QUALITY STANDARDS:
- **Tone**: Professional yet engaging.
- **CTA**: Every ad must have a clear call-to-action.
- **Value**: Focus on benefits, not just features.

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(ads_tools_1.adsTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'AdsContentAgent',
        };
    }
};
exports.AdsContentAgentService = AdsContentAgentService;
exports.AdsContentAgentService = AdsContentAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], AdsContentAgentService);
const adsContentAgent = async (state, model) => {
    const service = new AdsContentAgentService(model);
    return service.execute(state);
};
exports.adsContentAgent = adsContentAgent;
//# sourceMappingURL=ads-content.agent.js.map