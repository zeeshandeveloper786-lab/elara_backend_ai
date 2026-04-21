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
exports.adsContentGeneratorSupervisor = exports.AdsContentGeneratorSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let AdsContentGeneratorSupervisorService = class AdsContentGeneratorSupervisorService {
    chatModel;
    adsSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the current ad content request and progress.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain why continuing with agent or returning to main supervisor.'),
        next: zod_1.z.enum(['AdsContentAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific guidance or feedback for the agent.'),
        memory_to_save: zod_1.z
            .array(zod_1.z.object({
            key: zod_1.z.string(),
            value: zod_1.z.string(),
            type: zod_1.z.enum(['fact', 'preference', 'insight', 'project_context']),
        }))
            .optional()
            .describe('Important marketing insights or preferences to remember.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.ads_supervisor_calls || 0;
        if (callCount > 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                ads_supervisor_calls: 0,
                analysis: 'Ad generation task reached iteration limit.',
            };
        }
        const systemPrompt = `You are the Ads & Marketing Supervisor for Elara. 
Your goal is to oversee the creation of high-performing ad content and comprehensive market research.

### CURRENT CONTEXT:
- **Main Task**: "${state.current_task || 'Generate ad content'}"
- **Active Plan**: ${JSON.stringify(state.tasks || [])}
- **User Context**: ${state.user_name || 'User'} | Campaign: ${state.campaign_id || 'None'}

### ROUTING LOGIC:
1. **Delegate to 'AdsContentAgent'**:
   - To perform market research (competitors, audience, trends).
   - To generate platform-specific ad copy (FB, Google, etc.).
   - To refine existing copy based on user feedback.
   - To save finalized content to the database.

2. **Return to 'ScripySupervisor'**:
   - When the marketing task is complete.
   - When user clarification is needed that is outside the Ads domain.
   - When the current plan step is finished and you need the Master Brain to decide the next phase.

3. **'FINISH'**:
   - Only if the entire conversation/interaction is complete (rarely used by sub-supervisors).

### STRATEGY:
- If market research is needed, ensure it happens BEFORE ad generation.
- Ensure all generated copy matches the campaign goals.
- If the user provided a plan via ScripySupervisor, stick to it.

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.adsSupervisorSchema);
        const response = (await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]));
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            ads_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
            memory_to_save: response.memory_to_save,
        };
    }
};
exports.AdsContentGeneratorSupervisorService = AdsContentGeneratorSupervisorService;
exports.AdsContentGeneratorSupervisorService = AdsContentGeneratorSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], AdsContentGeneratorSupervisorService);
const adsContentGeneratorSupervisor = async (state, model) => {
    const service = new AdsContentGeneratorSupervisorService(model);
    return service.supervise(state);
};
exports.adsContentGeneratorSupervisor = adsContentGeneratorSupervisor;
//# sourceMappingURL=ads-content-generator.supervisor.js.map