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
exports.systemInsightAgent = exports.SystemInsightAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const system_tools_1 = require("../tools/system.tools");
let SystemInsightAgentService = class SystemInsightAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const currentTask = state.current_task || 'Check system status';
        const systemPrompt = `You are a system performance and health monitor with access to system tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. get_campaign_analytics - Campaign performance metrics
2. get_companies_stats - Company statistics and breakdown
3. get_prospects_list - Lead listing and filtering
4. get_company_extremes - Top performing companies
5. get_companies_list - Recent companies
6. get_leads_overview - Lead summary and statistics
7. check_system_health - System connectivity and health
8. get_system_summary - Storage and resource usage
9. find_company_in_db - Search companies

WORKFLOW GUIDELINES:
1. For health checks: Use check_system_health
2. For metrics: Use appropriate analytics tools
3. For summaries: Use get_system_summary
4. For searches: Use find_company_in_db
5. Present data clearly with business insights

COMMUNICATION:
- Convert technical metrics into actionable insights
- Highlight any issues or concerns
- Suggest improvements if applicable

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(system_tools_1.systemTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'SystemInsightAgent',
        };
    }
};
exports.SystemInsightAgentService = SystemInsightAgentService;
exports.SystemInsightAgentService = SystemInsightAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], SystemInsightAgentService);
const systemInsightAgent = async (state, model) => {
    const service = new SystemInsightAgentService(model);
    return service.execute(state);
};
exports.systemInsightAgent = systemInsightAgent;
//# sourceMappingURL=system-insight.agent.js.map