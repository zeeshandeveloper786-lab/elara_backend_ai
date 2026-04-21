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
exports.mediaGeneratorSupervisor = exports.MediaGeneratorSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let MediaGeneratorSupervisorService = class MediaGeneratorSupervisorService {
    chatModel;
    mediaSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the media generation request and progress.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task status.'),
        next: zod_1.z.enum(['MediaAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific guidance for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.media_supervisor_calls || 0;
        if (callCount > 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                media_supervisor_calls: 0,
                analysis: 'Media generation reached iteration limit.',
            };
        }
        const systemPrompt = `You are supervising visual media generation operations.

CURRENT TASK: "${state.current_task || 'Generate media'}"
USER: ${state.user_name || 'User'} | Campaign: ${state.campaign_id || 'None'}

ROUTING DECISIONS:
1. Route to 'MediaAgent' when:
   - Image generation is requested
   - Creative prompts need to be refined
   - Generated images need modifications
   - Visual assets need to be created

2. Route to 'ScripySupervisor' when:
   - Image has been successfully generated
   - User needs to switch to different domain
   - Media task is complete

QUALITY CHECKS:
- Ensure prompts are detailed and descriptive
- Verify generated images meet requirements
- Check that assets are properly stored

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.mediaSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            media_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.MediaGeneratorSupervisorService = MediaGeneratorSupervisorService;
exports.MediaGeneratorSupervisorService = MediaGeneratorSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], MediaGeneratorSupervisorService);
const mediaGeneratorSupervisor = async (state, model) => {
    const service = new MediaGeneratorSupervisorService(model);
    return service.supervise(state);
};
exports.mediaGeneratorSupervisor = mediaGeneratorSupervisor;
//# sourceMappingURL=media-generator.supervisor.js.map