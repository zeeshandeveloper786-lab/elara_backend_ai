import { CreateCampaignDbService } from './create-campaign-db/create-campaign-db.service';
import { GetCampaignsListService } from './get-campaigns-list/get-campaigns-list.service';
export declare class CampaignsToolsService {
    private createCampaignDbService;
    private getCampaignsListService;
    constructor(createCampaignDbService: CreateCampaignDbService, getCampaignsListService: GetCampaignsListService);
    getTools(): ({
        service: CreateCampaignDbService;
        name: string;
        description: string;
    } | {
        service: GetCampaignsListService;
        name: string;
        description: string;
    })[];
    getCreateCampaignDbTool(): {
        service: CreateCampaignDbService;
        name: string;
        description: string;
    };
    getGetCampaignsListTool(): {
        service: GetCampaignsListService;
        name: string;
        description: string;
    };
}
