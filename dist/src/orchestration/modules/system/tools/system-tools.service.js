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
exports.SystemToolsService = void 0;
const common_1 = require("@nestjs/common");
const check_system_health_service_1 = require("./check-system-health/check-system-health.service");
const find_company_in_db_service_1 = require("./find-company-in-db/find-company-in-db.service");
const get_campaign_analytics_service_1 = require("./get-campaign-analytics/get-campaign-analytics.service");
const get_companies_list_service_1 = require("./get-companies-list/get-companies-list.service");
const get_companies_stats_service_1 = require("./get-companies-stats/get-companies-stats.service");
const get_company_extremes_service_1 = require("./get-company-extremes/get-company-extremes.service");
const get_leads_overview_service_1 = require("./get-leads-overview/get-leads-overview.service");
const get_prospects_list_service_1 = require("./get-prospects-list/get-prospects-list.service");
const system_summary_service_1 = require("./system-summary/system-summary.service");
let SystemToolsService = class SystemToolsService {
    checkSystemHealthService;
    findCompanyInDbService;
    getCampaignAnalyticsService;
    getCompaniesListService;
    getCompaniesStatsService;
    getCompanyExtremesService;
    getLeadsOverviewService;
    getProspectsListService;
    systemSummaryService;
    constructor(checkSystemHealthService, findCompanyInDbService, getCampaignAnalyticsService, getCompaniesListService, getCompaniesStatsService, getCompanyExtremesService, getLeadsOverviewService, getProspectsListService, systemSummaryService) {
        this.checkSystemHealthService = checkSystemHealthService;
        this.findCompanyInDbService = findCompanyInDbService;
        this.getCampaignAnalyticsService = getCampaignAnalyticsService;
        this.getCompaniesListService = getCompaniesListService;
        this.getCompaniesStatsService = getCompaniesStatsService;
        this.getCompanyExtremesService = getCompanyExtremesService;
        this.getLeadsOverviewService = getLeadsOverviewService;
        this.getProspectsListService = getProspectsListService;
        this.systemSummaryService = systemSummaryService;
    }
    getTools() {
        return [
            this.getCheckSystemHealthTool(),
            this.getFindCompanyInDbTool(),
            this.getGetCampaignAnalyticsTool(),
            this.getGetCompaniesListTool(),
            this.getGetCompaniesStatsTool(),
            this.getGetCompanyExtremesTool(),
            this.getGetLeadsOverviewTool(),
            this.getGetProspectsListTool(),
            this.getSystemSummaryTool(),
        ];
    }
    getCheckSystemHealthTool() {
        return {
            service: this.checkSystemHealthService,
            name: 'check_system_health',
            description: 'Performs comprehensive health check of database, external APIs, and system connectivity.',
        };
    }
    getFindCompanyInDbTool() {
        return {
            service: this.findCompanyInDbService,
            name: 'find_company_in_db',
            description: 'Searches for companies in database by name or domain with fuzzy matching.',
        };
    }
    getGetCampaignAnalyticsTool() {
        return {
            service: this.getCampaignAnalyticsService,
            name: 'get_campaign_analytics',
            description: 'Provides comprehensive analytics for all user campaigns including budget tracking and activity counts.',
        };
    }
    getGetCompaniesListTool() {
        return {
            service: this.getCompaniesListService,
            name: 'get_companies_list',
            description: 'Retrieves a paginated list of recent companies with detailed information.',
        };
    }
    getGetCompaniesStatsTool() {
        return {
            service: this.getCompaniesStatsService,
            name: 'get_companies_stats',
            description: 'Provides statistics about total companies and their industry breakdown.',
        };
    }
    getGetCompanyExtremesTool() {
        return {
            service: this.getCompanyExtremesService,
            name: 'get_company_extremes',
            description: 'Retrieves the top 10 companies ranked by number of associated leads.',
        };
    }
    getGetLeadsOverviewTool() {
        return {
            service: this.getLeadsOverviewService,
            name: 'get_leads_overview',
            description: 'Provides overview of leads and communications statistics.',
        };
    }
    getGetProspectsListTool() {
        return {
            service: this.getProspectsListService,
            name: 'get_prospects_list',
            description: 'Retrieves list of prospects with contact methods and company information.',
        };
    }
    getSystemSummaryTool() {
        return {
            service: this.systemSummaryService,
            name: 'get_system_summary',
            description: 'Provides system usage and storage summary information.',
        };
    }
};
exports.SystemToolsService = SystemToolsService;
exports.SystemToolsService = SystemToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [check_system_health_service_1.CheckSystemHealthService,
        find_company_in_db_service_1.FindCompanyInDbService,
        get_campaign_analytics_service_1.GetCampaignAnalyticsService,
        get_companies_list_service_1.GetCompaniesListService,
        get_companies_stats_service_1.GetCompaniesStatsService,
        get_company_extremes_service_1.GetCompanyExtremesService,
        get_leads_overview_service_1.GetLeadsOverviewService,
        get_prospects_list_service_1.GetProspectsListService,
        system_summary_service_1.SystemSummaryService])
], SystemToolsService);
//# sourceMappingURL=system-tools.service.js.map