import { CheckSystemHealthService } from './check-system-health/check-system-health.service';
import { FindCompanyInDbService } from './find-company-in-db/find-company-in-db.service';
import { GetCampaignAnalyticsService } from './get-campaign-analytics/get-campaign-analytics.service';
import { GetCompaniesListService } from './get-companies-list/get-companies-list.service';
import { GetCompaniesStatsService } from './get-companies-stats/get-companies-stats.service';
import { GetCompanyExtremesService } from './get-company-extremes/get-company-extremes.service';
import { GetLeadsOverviewService } from './get-leads-overview/get-leads-overview.service';
import { GetProspectsListService } from './get-prospects-list/get-prospects-list.service';
import { SystemSummaryService } from './system-summary/system-summary.service';
export declare class SystemToolsService {
    private checkSystemHealthService;
    private findCompanyInDbService;
    private getCampaignAnalyticsService;
    private getCompaniesListService;
    private getCompaniesStatsService;
    private getCompanyExtremesService;
    private getLeadsOverviewService;
    private getProspectsListService;
    private systemSummaryService;
    constructor(checkSystemHealthService: CheckSystemHealthService, findCompanyInDbService: FindCompanyInDbService, getCampaignAnalyticsService: GetCampaignAnalyticsService, getCompaniesListService: GetCompaniesListService, getCompaniesStatsService: GetCompaniesStatsService, getCompanyExtremesService: GetCompanyExtremesService, getLeadsOverviewService: GetLeadsOverviewService, getProspectsListService: GetProspectsListService, systemSummaryService: SystemSummaryService);
    getTools(): ({
        service: CheckSystemHealthService;
        name: string;
        description: string;
    } | {
        service: FindCompanyInDbService;
        name: string;
        description: string;
    } | {
        service: GetCampaignAnalyticsService;
        name: string;
        description: string;
    } | {
        service: GetCompaniesListService;
        name: string;
        description: string;
    } | {
        service: GetCompaniesStatsService;
        name: string;
        description: string;
    } | {
        service: GetCompanyExtremesService;
        name: string;
        description: string;
    } | {
        service: GetLeadsOverviewService;
        name: string;
        description: string;
    } | {
        service: GetProspectsListService;
        name: string;
        description: string;
    } | {
        service: SystemSummaryService;
        name: string;
        description: string;
    })[];
    getCheckSystemHealthTool(): {
        service: CheckSystemHealthService;
        name: string;
        description: string;
    };
    getFindCompanyInDbTool(): {
        service: FindCompanyInDbService;
        name: string;
        description: string;
    };
    getGetCampaignAnalyticsTool(): {
        service: GetCampaignAnalyticsService;
        name: string;
        description: string;
    };
    getGetCompaniesListTool(): {
        service: GetCompaniesListService;
        name: string;
        description: string;
    };
    getGetCompaniesStatsTool(): {
        service: GetCompaniesStatsService;
        name: string;
        description: string;
    };
    getGetCompanyExtremesTool(): {
        service: GetCompanyExtremesService;
        name: string;
        description: string;
    };
    getGetLeadsOverviewTool(): {
        service: GetLeadsOverviewService;
        name: string;
        description: string;
    };
    getGetProspectsListTool(): {
        service: GetProspectsListService;
        name: string;
        description: string;
    };
    getSystemSummaryTool(): {
        service: SystemSummaryService;
        name: string;
        description: string;
    };
}
