import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { CampaignSupervisorService } from './supervisor/campaign.supervisor';
import { CampaignAgentService } from './agent/campaign.agent';
import { CreateCampaignDbService } from './tools/create-campaign-db/create-campaign-db.service';
import { GetCampaignsListService } from './tools/get-campaigns-list/get-campaigns-list.service';
import { CampaignsToolsService } from './tools/campaigns-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    CampaignSupervisorService,
    CampaignAgentService,
    CreateCampaignDbService,
    GetCampaignsListService,
    CampaignsToolsService,
  ],
  exports: [
    CampaignSupervisorService,
    CampaignAgentService,
    CreateCampaignDbService,
    GetCampaignsListService,
    CampaignsToolsService,
  ],
})
export class CampaignsModule {}
