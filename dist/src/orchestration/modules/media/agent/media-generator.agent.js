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
exports.mediaGeneratorAgent = exports.MediaGeneratorAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const media_tools_1 = require("../tools/media.tools");
let MediaGeneratorAgentService = class MediaGeneratorAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
        const userContext = state.user_name || 'User';
        const currentTask = state.current_task || 'Generate media';
        const systemPrompt = `You are a visual media specialist with access to image generation tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})
CAMPAIGN: ${state.campaign_id || 'None'}

AVAILABLE TOOLS:
1. generate_image - Create high-quality professional images using OpenAI DALL-E 3. Supports size and style options.

WORKFLOW GUIDELINES:
1. If user provides a simple description, expand it into a detailed visual prompt
2. Include style, composition, lighting, and mood in the prompt
3. Use generate_image to create the image. You can specify size ("1024x1024" or "1792x1024") and style ("natural" or "vivid").
4. Present results with professional summary
5. Offer refinements if needed

PROMPT ENHANCEMENT:
- Add specific details about style and composition
- Include lighting and mood descriptions
- Specify any technical requirements
- Use descriptive language for best results

IMPORTANT:
- Explain what will be created before generating

Respond clearly and helpfully to the user's request.`;
        const agent = this.chatModel.bindTools(media_tools_1.mediaTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'MediaAgent',
        };
    }
};
exports.MediaGeneratorAgentService = MediaGeneratorAgentService;
exports.MediaGeneratorAgentService = MediaGeneratorAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], MediaGeneratorAgentService);
const mediaGeneratorAgent = async (state, model) => {
    const service = new MediaGeneratorAgentService(model);
    return service.execute(state);
};
exports.mediaGeneratorAgent = mediaGeneratorAgent;
//# sourceMappingURL=media-generator.agent.js.map