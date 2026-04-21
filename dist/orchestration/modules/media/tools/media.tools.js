"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaTools = exports.generateImageTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const generate_media_service_1 = require("./generate-media/generate-media.service");
const generateMediaService = new generate_media_service_1.GenerateMediaService();
exports.generateImageTool = (0, tool_wrapper_1.createScryTool)((input, state) => generateMediaService.execute(input, state), {
    name: 'generate_image',
    description: 'Generates high-quality professional AI images using OpenAI DALL-E 3 model. Supports different sizes and styles.',
    schema: generateMediaService.getSchema(),
});
exports.mediaTools = [exports.generateImageTool];
//# sourceMappingURL=media.tools.js.map