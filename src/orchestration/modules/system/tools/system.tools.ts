import { createScryTool } from '../../../utils/tool-wrapper';
import { CheckSystemHealthService } from './check-system-health/check-system-health.service';
import { FindCompanyInDbService } from './find-company-in-db/find-company-in-db.service';
import { GetCampaignAnalyticsService } from './get-campaign-analytics/get-campaign-analytics.service';
import { GetCompaniesListService } from './get-companies-list/get-companies-list.service';
import { GetCompaniesStatsService } from './get-companies-stats/get-companies-stats.service';
import { GetCompanyExtremesService } from './get-company-extremes/get-company-extremes.service';
import { GetLeadsOverviewService } from './get-leads-overview/get-leads-overview.service';
import { GetProspectsListService } from './get-prospects-list/get-prospects-list.service';
import { SystemSummaryService } from './system-summary/system-summary.service';

// Create services for tool creation
const checkSystemHealthService = new CheckSystemHealthService();
const findCompanyInDbService = new FindCompanyInDbService();
const getCampaignAnalyticsService = new GetCampaignAnalyticsService();
const getCompaniesListService = new GetCompaniesListService();
const getCompaniesStatsService = new GetCompaniesStatsService();
const getCompanyExtremesService = new GetCompanyExtremesService();
const getLeadsOverviewService = new GetLeadsOverviewService();
const getProspectsListService = new GetProspectsListService();
const systemSummaryService = new SystemSummaryService();

// Check System Health Tool
export const checkSystemHealthTool = createScryTool(
  (input: any, state: any) => checkSystemHealthService.execute(input, state),
  {
    name: 'check_system_health',
    description:
      'Performs comprehensive health check of database, external APIs, and system connectivity.',
    schema: checkSystemHealthService.getSchema(),
  },
);

// Find Company in DB Tool
export const findCompanyInDbTool = createScryTool(
  (input: any, state: any) => findCompanyInDbService.execute(input, state),
  {
    name: 'find_company_in_db',
    description:
      'Searches for companies in database by name or domain with fuzzy matching.',
    schema: findCompanyInDbService.getSchema(),
  },
);

// Get Campaign Analytics Tool
export const getCampaignAnalyticsTool = createScryTool(
  (input: any, state: any) => getCampaignAnalyticsService.execute(input, state),
  {
    name: 'get_campaign_analytics',
    description:
      'Provides comprehensive analytics for all user campaigns including budget tracking and activity counts.',
    schema: getCampaignAnalyticsService.getSchema(),
  },
);

// Get Companies List Tool
export const getCompaniesListTool = createScryTool(
  (input: any, state: any) => getCompaniesListService.execute(input, state),
  {
    name: 'get_companies_list',
    description:
      'Retrieves a paginated list of recent companies with detailed information.',
    schema: getCompaniesListService.getSchema(),
  },
);

// Get Companies Stats Tool
export const getCompaniesStatsTool = createScryTool(
  (input: any, state: any) => getCompaniesStatsService.execute(input, state),
  {
    name: 'get_companies_stats',
    description:
      'Provides statistics about total companies and their industry breakdown.',
    schema: getCompaniesStatsService.getSchema(),
  },
);

// Get Company Extremes Tool
export const getCompanyExtremesTool = createScryTool(
  (input: any, state: any) => getCompanyExtremesService.execute(input, state),
  {
    name: 'get_company_extremes',
    description:
      'Retrieves the top 10 companies ranked by number of associated leads.',
    schema: getCompanyExtremesService.getSchema(),
  },
);

// Get Leads Overview Tool
export const getLeadsOverviewTool = createScryTool(
  (input: any, state: any) => getLeadsOverviewService.execute(input, state),
  {
    name: 'get_leads_overview',
    description: 'Provides overview of leads and communications statistics.',
    schema: getLeadsOverviewService.getSchema(),
  },
);

// Get Prospects List Tool
export const getProspectsListTool = createScryTool(
  (input: any, state: any) => getProspectsListService.execute(input, state),
  {
    name: 'get_prospects_list',
    description:
      'Retrieves list of prospects with contact methods and company information.',
    schema: getProspectsListService.getSchema(),
  },
);

// System Summary Tool
export const getSystemSummaryTool = createScryTool(
  (input: any, state: any) => systemSummaryService.execute(input, state),
  {
    name: 'get_system_summary',
    description: 'Provides system usage and storage summary information.',
    schema: systemSummaryService.getSchema(),
  },
);

// System tools array for use in orchestration
export const systemTools = [
  getCampaignAnalyticsTool,
  getCompaniesStatsTool,
  getProspectsListTool,
  getCompanyExtremesTool,
  getCompaniesListTool,
  getLeadsOverviewTool,
  checkSystemHealthTool,
  getSystemSummaryTool,
  findCompanyInDbTool,
];
