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
exports.systemInsightSupervisor = exports.SystemInsightSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let SystemInsightSupervisorService = class SystemInsightSupervisorService {
    chatModel;
    systemSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the system query or health check request.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task type.'),
        next: zod_1.z.enum(['SystemInsightAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific instruction for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.system_supervisor_calls || 0;
        if (callCount > 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                system_supervisor_calls: 0,
                analysis: 'System query reached limit.',
            };
        }
        const systemPrompt = `You are supervising system performance and health monitoring operations.

CURRENT TASK: "${state.current_task || 'Check system status'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

ROUTING DECISIONS:
1. Route to 'SystemInsightAgent' when:
   - System health checks are requested
   - Performance metrics are needed
   - Analytics or statistics are requested
   - System status needs to be monitored

2. Route to 'ScripySupervisor' when:
   - System information has been provided
   - User needs to switch to different domain
   - Query is non-technical

QUALITY CHECKS:
- Ensure metrics are accurate and current
- Translate technical data into business insights
- Provide actionable recommendations

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.systemSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            system_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.SystemInsightSupervisorService = SystemInsightSupervisorService;
exports.SystemInsightSupervisorService = SystemInsightSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], SystemInsightSupervisorService);
const systemInsightSupervisor = async (state, model) => {
    const service = new SystemInsightSupervisorService(model);
    return service.supervise(state);
};
exports.systemInsightSupervisor = systemInsightSupervisor;
//# sourceMappingURL=system-insight.supervisor.js.map