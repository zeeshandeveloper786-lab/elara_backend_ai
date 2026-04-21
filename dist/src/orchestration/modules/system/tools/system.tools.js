"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemTools = exports.getSystemSummaryTool = exports.getProspectsListTool = exports.getLeadsOverviewTool = exports.getCompanyExtremesTool = exports.getCompaniesStatsTool = exports.getCompaniesListTool = exports.getCampaignAnalyticsTool = exports.findCompanyInDbTool = exports.checkSystemHealthTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const check_system_health_service_1 = require("./check-system-health/check-system-health.service");
const find_company_in_db_service_1 = require("./find-company-in-db/find-company-in-db.service");
const get_campaign_analytics_service_1 = require("./get-campaign-analytics/get-campaign-analytics.service");
const get_companies_list_service_1 = require("./get-companies-list/get-companies-list.service");
const get_companies_stats_service_1 = require("./get-companies-stats/get-companies-stats.service");
const get_company_extremes_service_1 = require("./get-company-extremes/get-company-extremes.service");
const get_leads_overview_service_1 = require("./get-leads-overview/get-leads-overview.service");
const get_prospects_list_service_1 = require("./get-prospects-list/get-prospects-list.service");
const system_summary_service_1 = require("./system-summary/system-summary.service");
const checkSystemHealthService = new check_system_health_service_1.CheckSystemHealthService();
const findCompanyInDbService = new find_company_in_db_service_1.FindCompanyInDbService();
const getCampaignAnalyticsService = new get_campaign_analytics_service_1.GetCampaignAnalyticsService();
const getCompaniesListService = new get_companies_list_service_1.GetCompaniesListService();
const getCompaniesStatsService = new get_companies_stats_service_1.GetCompaniesStatsService();
const getCompanyExtremesService = new get_company_extremes_service_1.GetCompanyExtremesService();
const getLeadsOverviewService = new get_leads_overview_service_1.GetLeadsOverviewService();
const getProspectsListService = new get_prospects_list_service_1.GetProspectsListService();
const systemSummaryService = new system_summary_service_1.SystemSummaryService();
exports.checkSystemHealthTool = (0, tool_wrapper_1.createScryTool)((input, state) => checkSystemHealthService.execute(input, state), {
    name: 'check_system_health',
    description: 'Performs comprehensive health check of database, external APIs, and system connectivity.',
    schema: checkSystemHealthService.getSchema(),
});
exports.findCompanyInDbTool = (0, tool_wrapper_1.createScryTool)((input, state) => findCompanyInDbService.execute(input, state), {
    name: 'find_company_in_db',
    description: 'Searches for companies in database by name or domain with fuzzy matching.',
    schema: findCompanyInDbService.getSchema(),
});
exports.getCampaignAnalyticsTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCampaignAnalyticsService.execute(input, state), {
    name: 'get_campaign_analytics',
    description: 'Provides comprehensive analytics for all user campaigns including budget tracking and activity counts.',
    schema: getCampaignAnalyticsService.getSchema(),
});
exports.getCompaniesListTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCompaniesListService.execute(input, state), {
    name: 'get_companies_list',
    description: 'Retrieves a paginated list of recent companies with detailed information.',
    schema: getCompaniesListService.getSchema(),
});
exports.getCompaniesStatsTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCompaniesStatsService.execute(input, state), {
    name: 'get_companies_stats',
    description: 'Provides statistics about total companies and their industry breakdown.',
    schema: getCompaniesStatsService.getSchema(),
});
exports.getCompanyExtremesTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCompanyExtremesService.execute(input, state), {
    name: 'get_company_extremes',
    description: 'Retrieves the top 10 companies ranked by number of associated leads.',
    schema: getCompanyExtremesService.getSchema(),
});
exports.getLeadsOverviewTool = (0, tool_wrapper_1.createScryTool)((input, state) => getLeadsOverviewService.execute(input, state), {
    name: 'get_leads_overview',
    description: 'Provides overview of leads and communications statistics.',
    schema: getLeadsOverviewService.getSchema(),
});
exports.getProspectsListTool = (0, tool_wrapper_1.createScryTool)((input, state) => getProspectsListService.execute(input, state), {
    name: 'get_prospects_list',
    description: 'Retrieves list of prospects with contact methods and company information.',
    schema: getProspectsListService.getSchema(),
});
exports.getSystemSummaryTool = (0, tool_wrapper_1.createScryTool)((input, state) => systemSummaryService.execute(input, state), {
    name: 'get_system_summary',
    description: 'Provides system usage and storage summary information.',
    schema: systemSummaryService.getSchema(),
});
exports.systemTools = [
    exports.getCampaignAnalyticsTool,
    exports.getCompaniesStatsTool,
    exports.getProspectsListTool,
    exports.getCompanyExtremesTool,
    exports.getCompaniesListTool,
    exports.getLeadsOverviewTool,
    exports.checkSystemHealthTool,
    exports.getSystemSummaryTool,
    exports.findCompanyInDbTool,
];
//# sourceMappingURL=system.tools.js.map