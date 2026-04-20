import { Injectable } from '@nestjs/common';
import { CheckSystemHealthService } from './check-system-health/check-system-health.service';
import { FindCompanyInDbService } from './find-company-in-db/find-company-in-db.service';
import { GetCampaignAnalyticsService } from './get-campaign-analytics/get-campaign-analytics.service';
import { GetCompaniesListService } from './get-companies-list/get-companies-list.service';
import { GetCompaniesStatsService } from './get-companies-stats/get-companies-stats.service';
import { GetCompanyExtremesService } from './get-company-extremes/get-company-extremes.service';
import { GetLeadsOverviewService } from './get-leads-overview/get-leads-overview.service';
import { GetProspectsListService } from './get-prospects-list/get-prospects-list.service';
import { SystemSummaryService } from './system-summary/system-summary.service';

@Injectable()
export class SystemToolsService {
  constructor(
    private checkSystemHealthService: CheckSystemHealthService,
    private findCompanyInDbService: FindCompanyInDbService,
    private getCampaignAnalyticsService: GetCampaignAnalyticsService,
    private getCompaniesListService: GetCompaniesListService,
    private getCompaniesStatsService: GetCompaniesStatsService,
    private getCompanyExtremesService: GetCompanyExtremesService,
    private getLeadsOverviewService: GetLeadsOverviewService,
    private getProspectsListService: GetProspectsListService,
    private systemSummaryService: SystemSummaryService,
  ) {}

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
      description:
        'Performs comprehensive health check of database, external APIs, and system connectivity.',
    };
  }

  getFindCompanyInDbTool() {
    return {
      service: this.findCompanyInDbService,
      name: 'find_company_in_db',
      description:
        'Searches for companies in database by name or domain with fuzzy matching.',
    };
  }

  getGetCampaignAnalyticsTool() {
    return {
      service: this.getCampaignAnalyticsService,
      name: 'get_campaign_analytics',
      description:
        'Provides comprehensive analytics for all user campaigns including budget tracking and activity counts.',
    };
  }

  getGetCompaniesListTool() {
    return {
      service: this.getCompaniesListService,
      name: 'get_companies_list',
      description:
        'Retrieves a paginated list of recent companies with detailed information.',
    };
  }

  getGetCompaniesStatsTool() {
    return {
      service: this.getCompaniesStatsService,
      name: 'get_companies_stats',
      description:
        'Provides statistics about total companies and their industry breakdown.',
    };
  }

  getGetCompanyExtremesTool() {
    return {
      service: this.getCompanyExtremesService,
      name: 'get_company_extremes',
      description:
        'Retrieves the top 10 companies ranked by number of associated leads.',
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
      description:
        'Retrieves list of prospects with contact methods and company information.',
    };
  }

  getSystemSummaryTool() {
    return {
      service: this.systemSummaryService,
      name: 'get_system_summary',
      description: 'Provides system usage and storage summary information.',
    };
  }
}
