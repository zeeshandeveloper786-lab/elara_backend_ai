"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const media_generator_supervisor_1 = require("./supervisor/media-generator.supervisor");
const media_generator_agent_1 = require("./agent/media-generator.agent");
const generate_media_service_1 = require("./tools/generate-media/generate-media.service");
const media_tools_service_1 = require("./tools/media-tools.service");
let MediaModule = class MediaModule {
};
exports.MediaModule = MediaModule;
exports.MediaModule = MediaModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            media_generator_supervisor_1.MediaGeneratorSupervisorService,
            media_generator_agent_1.MediaGeneratorAgentService,
            generate_media_service_1.GenerateMediaService,
            media_tools_service_1.MediaToolsService,
        ],
        exports: [
            media_generator_supervisor_1.MediaGeneratorSupervisorService,
            media_generator_agent_1.MediaGeneratorAgentService,
            generate_media_service_1.GenerateMediaService,
            media_tools_service_1.MediaToolsService,
        ],
    })
], MediaModule);
//# sourceMappingURL=media.module.js.map