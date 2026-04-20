"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdsModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const ads_content_generator_supervisor_1 = require("./supervisor/ads-content-generator.supervisor");
const ads_content_agent_1 = require("./agent/ads-content.agent");
const generate_ad_content_service_1 = require("./tools/generate-ad-content/generate-ad-content.service");
const market_research_service_1 = require("./tools/market-research/market-research.service");
const ads_tools_service_1 = require("./tools/ads-tools.service");
let AdsModule = class AdsModule {
};
exports.AdsModule = AdsModule;
exports.AdsModule = AdsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            ads_content_generator_supervisor_1.AdsContentGeneratorSupervisorService,
            ads_content_agent_1.AdsContentAgentService,
            generate_ad_content_service_1.GenerateAdContentService,
            market_research_service_1.MarketResearchService,
            ads_tools_service_1.AdsToolsService,
        ],
        exports: [
            ads_content_generator_supervisor_1.AdsContentGeneratorSupervisorService,
            ads_content_agent_1.AdsContentAgentService,
            generate_ad_content_service_1.GenerateAdContentService,
            market_research_service_1.MarketResearchService,
            ads_tools_service_1.AdsToolsService,
        ],
    })
], AdsModule);
//# sourceMappingURL=ads.module.js.map