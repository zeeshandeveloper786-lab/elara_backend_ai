import { FindCompaniesService } from './find-companies/find-companies.service';
import { StartEnrichmentJobService } from './start-enrichment-job/start-enrichment-job.service';
import { EnrichAllCompaniesService } from './enrich-all-companies/enrich-all-companies.service';
import { GetCompanyDetailService } from './get-company-detail/get-company-detail.service';
export declare class LeadsToolsService {
    private findCompaniesService;
    private startEnrichmentJobService;
    private enrichAllCompaniesService;
    private getCompanyDetailService;
    constructor(findCompaniesService: FindCompaniesService, startEnrichmentJobService: StartEnrichmentJobService, enrichAllCompaniesService: EnrichAllCompaniesService, getCompanyDetailService: GetCompanyDetailService);
    getTools(): ({
        service: FindCompaniesService;
        name: string;
        description: string;
    } | {
        service: StartEnrichmentJobService;
        name: string;
        description: string;
    } | {
        service: EnrichAllCompaniesService;
        name: string;
        description: string;
    } | {
        service: GetCompanyDetailService;
        name: string;
        description: string;
    })[];
    getFindCompaniesTool(): {
        service: FindCompaniesService;
        name: string;
        description: string;
    };
    getStartEnrichmentJobTool(): {
        service: StartEnrichmentJobService;
        name: string;
        description: string;
    };
    getEnrichAllCompaniesTool(): {
        service: EnrichAllCompaniesService;
        name: string;
        description: string;
    };
    getGetCompanyDetailTool(): {
        service: GetCompanyDetailService;
        name: string;
        description: string;
    };
}
