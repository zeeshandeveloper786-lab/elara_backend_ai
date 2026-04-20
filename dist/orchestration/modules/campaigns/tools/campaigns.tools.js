"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignsTools = exports.getCampaignsListTool = exports.createCampaignDbTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const create_campaign_db_service_1 = require("./create-campaign-db/create-campaign-db.service");
const get_campaigns_list_service_1 = require("./get-campaigns-list/get-campaigns-list.service");
const createCampaignDbService = new create_campaign_db_service_1.CreateCampaignDbService();
const getCampaignsListService = new get_campaigns_list_service_1.GetCampaignsListService();
exports.createCampaignDbTool = (0, tool_wrapper_1.createScryTool)((input, state) => createCampaignDbService.execute(input, state), {
    name: 'create_campaign_db',
    description: 'Creates a new marketing campaign in the database with ownership validation. Supports budget tracking, company linking, and multiple campaign types.',
    schema: createCampaignDbService.getSchema(),
});
exports.getCampaignsListTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCampaignsListService.execute(input, state), {
    name: 'get_campaigns_list',
    description: 'Retrieves a list of marketing campaigns for the user with detailed information including budget, status, linked companies, and activity counts. Supports filtering by status and pagination.',
    schema: getCampaignsListService.getSchema(),
});
exports.campaignsTools = [exports.createCampaignDbTool, exports.getCampaignsListTool];
//# sourceMappingURL=campaigns.tools.js.map