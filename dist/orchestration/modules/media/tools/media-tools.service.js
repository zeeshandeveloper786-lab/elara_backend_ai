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
exports.MediaToolsService = void 0;
const common_1 = require("@nestjs/common");
const generate_media_service_1 = require("./generate-media/generate-media.service");
let MediaToolsService = class MediaToolsService {
    generateMediaService;
    constructor(generateMediaService) {
        this.generateMediaService = generateMediaService;
    }
    getTools() {
        return [this.getGenerateMediaTool()];
    }
    getGenerateMediaTool() {
        return {
            service: this.generateMediaService,
            name: 'generate_media',
            description: 'Generates professional AI images using Flux-1 Schnell model via OpenRouter. Saves images to storage and provides public URLs.',
        };
    }
};
exports.MediaToolsService = MediaToolsService;
exports.MediaToolsService = MediaToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [generate_media_service_1.GenerateMediaService])
], MediaToolsService);
//# sourceMappingURL=media-tools.service.js.map