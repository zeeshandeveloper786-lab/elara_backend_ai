"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const campaign_supervisor_1 = require("./supervisor/campaign.supervisor");
const campaign_agent_1 = require("./agent/campaign.agent");
const create_campaign_db_service_1 = require("./tools/create-campaign-db/create-campaign-db.service");
const get_campaigns_list_service_1 = require("./tools/get-campaigns-list/get-campaigns-list.service");
const campaigns_tools_service_1 = require("./tools/campaigns-tools.service");
let CampaignsModule = class CampaignsModule {
};
exports.CampaignsModule = CampaignsModule;
exports.CampaignsModule = CampaignsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            campaign_supervisor_1.CampaignSupervisorService,
            campaign_agent_1.CampaignAgentService,
            create_campaign_db_service_1.CreateCampaignDbService,
            get_campaigns_list_service_1.GetCampaignsListService,
            campaigns_tools_service_1.CampaignsToolsService,
        ],
        exports: [
            campaign_supervisor_1.CampaignSupervisorService,
            campaign_agent_1.CampaignAgentService,
            create_campaign_db_service_1.CreateCampaignDbService,
            get_campaigns_list_service_1.GetCampaignsListService,
            campaigns_tools_service_1.CampaignsToolsService,
        ],
    })
], CampaignsModule);
//# sourceMappingURL=campaigns.module.js.map