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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateMediaService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const openai_1 = __importDefault(require("openai"));
let GenerateMediaService = class GenerateMediaService {
    generateMediaSchema = zod_1.z.object({
        prompt: zod_1.z
            .string()
            .min(10)
            .max(1000)
            .describe('Detailed visual description for the image (10-1000 characters)'),
        size: zod_1.z
            .enum(['1024x1024', '1792x1024'])
            .default('1024x1024')
            .describe('The size of the generated image'),
        style: zod_1.z
            .enum(['natural', 'vivid'])
            .default('vivid')
            .describe('The style of the generated image'),
    });
    openai;
    constructor() {
        this.openai = new openai_1.default({
            apiKey: (process.env.OPENAI_API_KEY || '').replace(/"/g, '').trim(),
        });
    }
    getSchema() {
        return this.generateMediaSchema;
    }
    async execute(input, state) {
        const { prompt, size = '1024x1024', style = 'vivid' } = input;
        const { user_id } = state;
        console.log(`🚀 [TOOL STARTED] generate_image - Params: ${JSON.stringify({ prompt, size, style })} - User: ${user_id}`);
        if (!user_id) {
            return '❌ **Authentication Error:** User context is missing. Please log in again.';
        }
        if (!process.env.OPENAI_API_KEY) {
            return '❌ **Configuration Error:** OPENAI_API_KEY is missing in environment variables.';
        }
        try {
            console.log(`🎨 [generate_image] Calling OpenAI DALL-E 3 API...`);
            const response = await this.openai.images.generate({
                model: 'dall-e-3',
                prompt: prompt,
                n: 1,
                size: size,
                style: style,
                quality: 'standard',
            });
            const imageUrl = response.data[0]?.url;
            if (!imageUrl) {
                throw new Error('No image URL returned from OpenAI');
            }
            console.log(`💾 [generate_image] Saving record to database...`);
            const record = await prisma_client_1.prisma.imageGeneration.create({
                data: {
                    prompt,
                    imageUrl,
                    size,
                    style,
                    user_id,
                },
            });
            console.log(`✅ [generate_image] Image generated and saved. ID: ${record.id}`);
            return `✅ **Image Generated Successfully!**

**ID:** ${record.id}
**Prompt:** ${prompt}
**Size:** ${size}
**Style:** ${style}

**Image URL:** ${imageUrl}

---
💡 You can use this URL to view or download the image. The record has been saved to your account.`;
        }
        catch (error) {
            console.error('❌ [generate_image] Error:', error);
            return `❌ **Error generating image:** ${error.message || 'Unknown error occurred'}. Please check your OpenAI API key and quota.`;
        }
    }
};
exports.GenerateMediaService = GenerateMediaService;
exports.GenerateMediaService = GenerateMediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], GenerateMediaService);
//# sourceMappingURL=generate-media.service.js.map