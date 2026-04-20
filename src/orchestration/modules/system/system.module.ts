import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { SystemInsightSupervisorService } from './supervisor/system-insight.supervisor';
import { SystemInsightAgentService } from './agent/system-insight.agent';
import { CheckSystemHealthService } from './tools/check-system-health/check-system-health.service';
import { FindCompanyInDbService } from './tools/find-company-in-db/find-company-in-db.service';
import { GetCampaignAnalyticsService } from './tools/get-campaign-analytics/get-campaign-analytics.service';
import { GetCompaniesListService } from './tools/get-companies-list/get-companies-list.service';
import { GetCompaniesStatsService } from './tools/get-companies-stats/get-companies-stats.service';
import { GetCompanyExtremesService } from './tools/get-company-extremes/get-company-extremes.service';
import { GetLeadsOverviewService } from './tools/get-leads-overview/get-leads-overview.service';
import { GetProspectsListService } from './tools/get-prospects-list/get-prospects-list.service';
import { SystemSummaryService } from './tools/system-summary/system-summary.service';
import { SystemToolsService } from './tools/system-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    SystemInsightSupervisorService,
    SystemInsightAgentService,
    CheckSystemHealthService,
    FindCompanyInDbService,
    GetCampaignAnalyticsService,
    GetCompaniesListService,
    GetCompaniesStatsService,
    GetCompanyExtremesService,
    GetLeadsOverviewService,
    GetProspectsListService,
    SystemSummaryService,
    SystemToolsService,
  ],
  exports: [
    SystemInsightSupervisorService,
    SystemInsightAgentService,
    CheckSystemHealthService,
    FindCompanyInDbService,
    GetCampaignAnalyticsService,
    GetCompaniesListService,
    GetCompaniesStatsService,
    GetCompanyExtremesService,
    GetLeadsOverviewService,
    GetProspectsListService,
    SystemSummaryService,
    SystemToolsService,
  ],
})
export class SystemModule {}
