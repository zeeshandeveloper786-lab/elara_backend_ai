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
exports.scripySupervisor = exports.ScripySupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let ScripySupervisorService = class ScripySupervisorService {
    chatModel;
    autonomySchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe("A deep analysis of the user's current request and historical context."),
        reasoning: zod_1.z
            .string()
            .describe('Step-by-step reasoning for the chosen routing or planning decision.'),
        plan: zod_1.z
            .array(zod_1.z.object({
            id: zod_1.z.string().describe('Unique step ID (e.g., "step_1")'),
            supervisor: zod_1.z.nativeEnum(scrpy_state_model_1.SupervisorType),
            instruction: zod_1.z.string().describe('Detailed instruction for this step'),
        }))
            .optional()
            .describe('A sequence of tasks if the request requires multiple specialists.'),
        next: zod_1.z.enum([
            scrpy_state_model_1.SupervisorType.GENERAL,
            scrpy_state_model_1.SupervisorType.LEADS,
            scrpy_state_model_1.SupervisorType.COMMUNICATION,
            scrpy_state_model_1.SupervisorType.SYSTEM,
            scrpy_state_model_1.SupervisorType.USERS,
            scrpy_state_model_1.SupervisorType.CAMPAIGN,
            scrpy_state_model_1.SupervisorType.MEDIA,
            scrpy_state_model_1.SupervisorType.ADS,
            'FINISH',
        ]),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific instruction for the immediate next supervisor.'),
        memory_to_save: zod_1.z
            .array(zod_1.z.object({
            key: zod_1.z.string(),
            value: zod_1.z.string(),
            type: zod_1.z.enum(['fact', 'preference', 'insight', 'project_context']),
        }))
            .optional()
            .describe('Valuable insights to persist for future reference.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const lastMessage = state.messages.at(-1);
        const userRequest = state.user_request ||
            (lastMessage instanceof messages_1.HumanMessage ? String(lastMessage.content) : '');
        const systemPrompt = `You are the Master Brain of Elara, an advanced AI Orchestration System. 
Your role is to orchestrate complex business workflows by delegating tasks to specialized supervisors.

### OPERATIONAL PRINCIPLES:
1. **Strategic Planning**: If a request is complex, break it down into a multi-step plan.
2. **Contextual Memory**: Use stored facts and conversation history to make informed decisions.
3. **Efficiency**: Direct users to the most relevant specialist immediately.
4. **Sequencing**: If you create a plan, you will be called back after each step to manage the next transition.

### SPECIALISTS:
- **${scrpy_state_model_1.SupervisorType.GENERAL}**: Greetings, capabilities, general guidance, and clarification.
- **${scrpy_state_model_1.SupervisorType.LEADS}**: Company discovery and B2B contact enrichment.
- **${scrpy_state_model_1.SupervisorType.ADS}**: Market research and high-converting ad copywriting.
- **${scrpy_state_model_1.SupervisorType.COMMUNICATION}**: Messaging (Email/SMS/WA), proposals, appointments, and AI calls.
- **${scrpy_state_model_1.SupervisorType.CAMPAIGN}**: Creating and managing marketing strategies.
- **${scrpy_state_model_1.SupervisorType.MEDIA}**: Professional visual asset and image generation.
- **${scrpy_state_model_1.SupervisorType.SYSTEM}**: Analytics, stats, and health monitoring.
- **${scrpy_state_model_1.SupervisorType.USERS}**: Profile and account management.

### DECISION GUIDELINES:
- **New Multi-step Task**: Generate a 'plan' array and set 'next' to the first supervisor in that plan.
- **Continuation**: If a plan already exists in state, check progress and decide the next logical step.
- **Vague Request**: Route to ${scrpy_state_model_1.SupervisorType.GENERAL} to ask for more details.
- **Task Complete**: Route to 'FINISH'.

CURRENT USER REQUEST: "${userRequest}"
EXISTING PLAN: ${JSON.stringify(state.tasks || [])}
CURRENT TASK CURSOR: ${state.task_cursor || 0}
TASK SUMMARIES SO FAR: ${JSON.stringify(state.task_summaries || [])}

Respond with strategic precision.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.autonomySchema);
        try {
            const decision = (await structuredModel.invoke([
                new messages_1.SystemMessage(systemPrompt),
                ...state.messages,
            ]));
            const updatedTasks = decision.plan || state.tasks || [];
            let nextCursor = state.task_cursor || 0;
            if (decision.next !== 'FINISH' && decision.next !== scrpy_state_model_1.SupervisorType.GENERAL) {
            }
            return {
                next: decision.next,
                reasoning: decision.reasoning,
                analysis: decision.analysis,
                memory_to_save: decision.memory_to_save,
                current_task: decision.instruction,
                tasks: updatedTasks,
                task_cursor: nextCursor,
                user_request: userRequest,
            };
        }
        catch (e) {
            return {
                next: scrpy_state_model_1.SupervisorType.GENERAL,
                reasoning: 'Fallback due to orchestration error.',
                analysis: 'Model failed to provide structured decision.',
            };
        }
    }
};
exports.ScripySupervisorService = ScripySupervisorService;
exports.ScripySupervisorService = ScripySupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], ScripySupervisorService);
const scripySupervisor = async (state, model) => {
    const service = new ScripySupervisorService(model);
    return service.supervise(state);
};
exports.scripySupervisor = scripySupervisor;
//# sourceMappingURL=scripy.supervisor.js.map