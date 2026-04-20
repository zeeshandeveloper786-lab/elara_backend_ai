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
exports.AdsToolsService = void 0;
const common_1 = require("@nestjs/common");
const generate_ad_content_service_1 = require("./generate-ad-content/generate-ad-content.service");
const market_research_service_1 = require("./market-research/market-research.service");
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
let AdsToolsService = class AdsToolsService {
    generateAdContentService;
    marketResearchService;
    constructor(generateAdContentService, marketResearchService) {
        this.generateAdContentService = generateAdContentService;
        this.marketResearchService = marketResearchService;
    }
    getTools() {
        return [this.getGenerateAdContentTool(), this.getMarketResearchTool()];
    }
    getGenerateAdContentTool() {
        return (0, tool_wrapper_1.createScryTool)((input, state) => this.generateAdContentService.execute(input, state), {
            name: 'generate_ad_content',
            description: 'Creates platform-optimized ad copy using AI (supports Facebook, Instagram, LinkedIn, Google Ads, Twitter) and saves it to the database as a draft.',
            schema: this.generateAdContentService.getSchema(),
        });
    }
    getMarketResearchTool() {
        return (0, tool_wrapper_1.createScryTool)((input, state) => this.marketResearchService.execute(input, state), {
            name: 'market_research',
            description: 'Performs comprehensive market research using live web search and AI analysis. Includes trends, competitors, audience insights, and marketing opportunities. Results are cached for efficiency. Use this BEFORE generating ads for new or complex topics.',
            schema: this.marketResearchService.getSchema(),
        });
    }
};
exports.AdsToolsService = AdsToolsService;
exports.AdsToolsService = AdsToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [generate_ad_content_service_1.GenerateAdContentService,
        market_research_service_1.MarketResearchService])
], AdsToolsService);
//# sourceMappingURL=ads-tools.service.js.map