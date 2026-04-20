"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsToolsService = void 0;
const common_1 = require("@nestjs/common");
const create_campaign_db_service_1 = require("./create-campaign-db/create-campaign-db.service");
const get_campaigns_list_service_1 = require("./get-campaigns-list/get-campaigns-list.service");
let CampaignsToolsService = class CampaignsToolsService {
    createCampaignDbService;
    getCampaignsListService;
    constructor(createCampaignDbService, getCampaignsListService) {
        this.createCampaignDbService = createCampaignDbService;
        this.getCampaignsListService = getCampaignsListService;
    }
    getTools() {
        return [this.getCreateCampaignDbTool(), this.getGetCampaignsListTool()];
    }
    getCreateCampaignDbTool() {
        return {
            service: this.createCampaignDbService,
            name: 'create_campaign_db',
            description: 'Creates a new marketing campaign in the database with ownership validation and budget tracking.',
        };
    }
    getGetCampaignsListTool() {
        return {
            service: this.getCampaignsListService,
            name: 'get_campaigns_list',
            description: 'Retrieves a list of marketing campaigns for the user with detailed information including budget, status, linked companies, and activity counts.',
        };
    }
};
exports.CampaignsToolsService = CampaignsToolsService;
exports.CampaignsToolsService = CampaignsToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [create_campaign_db_service_1.CreateCampaignDbService,
        get_campaigns_list_service_1.GetCampaignsListService])
], CampaignsToolsService);
//# sourceMappingURL=campaigns-tools.service.js.map