import { createScryTool } from '../../../utils/tool-wrapper';
import { createModel } from '../../../AI-model/openai-model';
import { GenerateAdContentService } from './generate-ad-content/generate-ad-content.service';
import { MarketResearchService } from './market-research/market-research.service';

// Create model and services for tool creation
const model = createModel();
const generateAdContentService = new GenerateAdContentService(model);
const marketResearchService = new MarketResearchService(model);

// Generate Ad Content Tool
export const generateAdContentTool = createScryTool(
  (input: any, state: any) => generateAdContentService.execute(input, state),
  {
    name: 'generate_ad_content',
    description:
      'Creates platform-optimized ad copy using AI (supports Facebook, Instagram, LinkedIn, Google Ads, Twitter) and saves it to the database as a draft.',
    schema: generateAdContentService.getSchema(),
  },
);

// Market Research Tool
export const marketResearchTool = createScryTool(
  (input: any, state: any) => marketResearchService.execute(input, state),
  {
    name: 'market_research',
    description:
      'Performs comprehensive market research using live web search and AI analysis. Includes trends, competitors, audience insights, and marketing opportunities. Results are cached for efficiency. Use this BEFORE generating ads for new or complex topics.',
    schema: marketResearchService.getSchema(),
  },
);

// Ads tools array for use in orchestration
export const adsTools = [generateAdContentTool, marketResearchTool];
