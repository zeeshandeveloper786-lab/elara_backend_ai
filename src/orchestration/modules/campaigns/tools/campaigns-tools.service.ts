import { Injectable } from '@nestjs/common';
import { CreateCampaignDbService } from './create-campaign-db/create-campaign-db.service';
import { GetCampaignsListService } from './get-campaigns-list/get-campaigns-list.service';

/**
 * Campaigns Tools Service
 * Coordinator service for all campaigns-related tools
 * Handles DI and tool coordination
 */
@Injectable()
export class CampaignsToolsService {
  constructor(
    private createCampaignDbService: CreateCampaignDbService,
    private getCampaignsListService: GetCampaignsListService,
  ) {}

  getTools() {
    return [this.getCreateCampaignDbTool(), this.getGetCampaignsListTool()];
  }

  getCreateCampaignDbTool() {
    return {
      service: this.createCampaignDbService,
      name: 'create_campaign_db',
      description:
        'Creates a new marketing campaign in the database with ownership validation and budget tracking.',
    };
  }

  getGetCampaignsListTool() {
    return {
      service: this.getCampaignsListService,
      name: 'get_campaigns_list',
      description:
        'Retrieves a list of marketing campaigns for the user with detailed information including budget, status, linked companies, and activity counts.',
    };
  }
}
