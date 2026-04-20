import { createScryTool } from '../../../utils/tool-wrapper';
import { CreateCampaignDbService } from './create-campaign-db/create-campaign-db.service';
import { GetCampaignsListService } from './get-campaigns-list/get-campaigns-list.service';

// Create services for tool creation
const createCampaignDbService = new CreateCampaignDbService();
const getCampaignsListService = new GetCampaignsListService();

// Create Campaign DB Tool
export const createCampaignDbTool = createScryTool(
  (input: any, state: any) => createCampaignDbService.execute(input, state),
  {
    name: 'create_campaign_db',
    description:
      'Creates a new marketing campaign in the database with ownership validation. Supports budget tracking, company linking, and multiple campaign types.',
    schema: createCampaignDbService.getSchema(),
  },
);

// Get Campaigns List Tool
export const getCampaignsListTool = createScryTool(
  (input: any, state: any) => getCampaignsListService.execute(input, state),
  {
    name: 'get_campaigns_list',
    description:
      'Retrieves a list of marketing campaigns for the user with detailed information including budget, status, linked companies, and activity counts. Supports filtering by status and pagination.',
    schema: getCampaignsListService.getSchema(),
  },
);

// Campaigns tools array for use in orchestration
export const campaignsTools = [createCampaignDbTool, getCampaignsListTool];
