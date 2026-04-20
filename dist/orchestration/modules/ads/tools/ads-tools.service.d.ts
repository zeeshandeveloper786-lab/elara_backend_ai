import { GenerateAdContentService } from './generate-ad-content/generate-ad-content.service';
import { MarketResearchService } from './market-research/market-research.service';
export declare class AdsToolsService {
    private generateAdContentService;
    private marketResearchService;
    constructor(generateAdContentService: GenerateAdContentService, marketResearchService: MarketResearchService);
    getTools(): import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodType<unknown, unknown, import("zod/v4/core").$ZodTypeInternals<unknown, unknown>>, unknown, unknown, string, unknown, string>[];
    private getGenerateAdContentTool;
    private getMarketResearchTool;
}
