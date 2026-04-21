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
exports.userInsightsSupervisor = exports.UserInsightsSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let UserInsightsSupervisorService = class UserInsightsSupervisorService {
    chatModel;
    userSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the user profile or account request.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task type.'),
        next: zod_1.z.enum(['UserInsightAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific instruction for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.user_supervisor_calls || 0;
        if (callCount > 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                user_supervisor_calls: 0,
                analysis: 'User management task reached limit.',
            };
        }
        const systemPrompt = `You are supervising user account and profile management operations.

CURRENT TASK: "${state.current_task || 'Manage user account'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

ROUTING DECISIONS:
1. Route to 'UserInsightAgent' when:
   - User profile information is requested
   - Account settings need to be updated
   - Password changes are needed
   - User statistics are requested

2. Route to 'ScripySupervisor' when:
   - User operation is complete
   - User needs to switch to different domain
   - Account information has been provided

SECURITY CONSIDERATIONS:
- Verify user identity before sensitive operations
- Ensure password changes are secure
- Protect personal information

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.userSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            user_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.UserInsightsSupervisorService = UserInsightsSupervisorService;
exports.UserInsightsSupervisorService = UserInsightsSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], UserInsightsSupervisorService);
const userInsightsSupervisor = async (state, model) => {
    const service = new UserInsightsSupervisorService(model);
    return service.supervise(state);
};
exports.userInsightsSupervisor = userInsightsSupervisor;
//# sourceMappingURL=user-insights.supervisor.js.map