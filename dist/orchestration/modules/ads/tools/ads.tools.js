"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adsTools = exports.marketResearchTool = exports.generateAdContentTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const openai_model_1 = require("../../../AI-model/openai-model");
const generate_ad_content_service_1 = require("./generate-ad-content/generate-ad-content.service");
const market_research_service_1 = require("./market-research/market-research.service");
const model = (0, openai_model_1.createModel)();
const generateAdContentService = new generate_ad_content_service_1.GenerateAdContentService(model);
const marketResearchService = new market_research_service_1.MarketResearchService(model);
exports.generateAdContentTool = (0, tool_wrapper_1.createScryTool)((input, state) => generateAdContentService.execute(input, state), {
    name: 'generate_ad_content',
    description: 'Creates platform-optimized ad copy using AI (supports Facebook, Instagram, LinkedIn, Google Ads, Twitter) and saves it to the database as a draft.',
    schema: generateAdContentService.getSchema(),
});
exports.marketResearchTool = (0, tool_wrapper_1.createScryTool)((input, state) => marketResearchService.execute(input, state), {
    name: 'market_research',
    description: 'Performs comprehensive market research using live web search and AI analysis. Includes trends, competitors, audience insights, and marketing opportunities. Results are cached for efficiency. Use this BEFORE generating ads for new or complex topics.',
    schema: marketResearchService.getSchema(),
});
exports.adsTools = [exports.generateAdContentTool, exports.marketResearchTool];
//# sourceMappingURL=ads.tools.js.map