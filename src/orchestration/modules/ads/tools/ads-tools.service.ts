import { Injectable } from '@nestjs/common';
import { GenerateAdContentService } from './generate-ad-content/generate-ad-content.service';
import { MarketResearchService } from './market-research/market-research.service';
import { createScryTool } from '../../../utils/tool-wrapper';

@Injectable()
export class AdsToolsService {
  constructor(
    private generateAdContentService: GenerateAdContentService,
    private marketResearchService: MarketResearchService,
  ) {}

  /**
   * Get all ads tools as LangChain tools
   */
  getTools() {
    return [this.getGenerateAdContentTool(), this.getMarketResearchTool()];
  }

  /**
   * Get generate ad content tool
   */
  private getGenerateAdContentTool() {
    return createScryTool(
      (input: any, state: any) =>
        this.generateAdContentService.execute(input, state),
      {
        name: 'generate_ad_content',
        description:
          'Creates platform-optimized ad copy using AI (supports Facebook, Instagram, LinkedIn, Google Ads, Twitter) and saves it to the database as a draft.',
        schema: this.generateAdContentService.getSchema(),
      },
    );
  }

  /**
   * Get market research tool
   */
  private getMarketResearchTool() {
    return createScryTool(
      (input: any, state: any) =>
        this.marketResearchService.execute(input, state),
      {
        name: 'market_research',
        description:
          'Performs comprehensive market research using live web search and AI analysis. Includes trends, competitors, audience insights, and marketing opportunities. Results are cached for efficiency. Use this BEFORE generating ads for new or complex topics.',
        schema: this.marketResearchService.getSchema(),
      },
    );
  }
}
