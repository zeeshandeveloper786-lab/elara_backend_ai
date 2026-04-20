import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { AdsContentGeneratorSupervisorService } from './supervisor/ads-content-generator.supervisor';
import { AdsContentAgentService } from './agent/ads-content.agent';
import { GenerateAdContentService } from './tools/generate-ad-content/generate-ad-content.service';
import { MarketResearchService } from './tools/market-research/market-research.service';
import { AdsToolsService } from './tools/ads-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    AdsContentGeneratorSupervisorService,
    AdsContentAgentService,
    GenerateAdContentService,
    MarketResearchService,
    AdsToolsService,
  ],
  exports: [
    AdsContentGeneratorSupervisorService,
    AdsContentAgentService,
    GenerateAdContentService,
    MarketResearchService,
    AdsToolsService,
  ],
})
export class AdsModule {}
