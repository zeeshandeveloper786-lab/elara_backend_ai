"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const system_insight_supervisor_1 = require("./supervisor/system-insight.supervisor");
const system_insight_agent_1 = require("./agent/system-insight.agent");
const check_system_health_service_1 = require("./tools/check-system-health/check-system-health.service");
const find_company_in_db_service_1 = require("./tools/find-company-in-db/find-company-in-db.service");
const get_campaign_analytics_service_1 = require("./tools/get-campaign-analytics/get-campaign-analytics.service");
const get_companies_list_service_1 = require("./tools/get-companies-list/get-companies-list.service");
const get_companies_stats_service_1 = require("./tools/get-companies-stats/get-companies-stats.service");
const get_company_extremes_service_1 = require("./tools/get-company-extremes/get-company-extremes.service");
const get_leads_overview_service_1 = require("./tools/get-leads-overview/get-leads-overview.service");
const get_prospects_list_service_1 = require("./tools/get-prospects-list/get-prospects-list.service");
const system_summary_service_1 = require("./tools/system-summary/system-summary.service");
const system_tools_service_1 = require("./tools/system-tools.service");
let SystemModule = class SystemModule {
};
exports.SystemModule = SystemModule;
exports.SystemModule = SystemModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            system_insight_supervisor_1.SystemInsightSupervisorService,
            system_insight_agent_1.SystemInsightAgentService,
            check_system_health_service_1.CheckSystemHealthService,
            find_company_in_db_service_1.FindCompanyInDbService,
            get_campaign_analytics_service_1.GetCampaignAnalyticsService,
            get_companies_list_service_1.GetCompaniesListService,
            get_companies_stats_service_1.GetCompaniesStatsService,
            get_company_extremes_service_1.GetCompanyExtremesService,
            get_leads_overview_service_1.GetLeadsOverviewService,
            get_prospects_list_service_1.GetProspectsListService,
            system_summary_service_1.SystemSummaryService,
            system_tools_service_1.SystemToolsService,
        ],
        exports: [
            system_insight_supervisor_1.SystemInsightSupervisorService,
            system_insight_agent_1.SystemInsightAgentService,
            check_system_health_service_1.CheckSystemHealthService,
            find_company_in_db_service_1.FindCompanyInDbService,
            get_campaign_analytics_service_1.GetCampaignAnalyticsService,
            get_companies_list_service_1.GetCompaniesListService,
            get_companies_stats_service_1.GetCompaniesStatsService,
            get_company_extremes_service_1.GetCompanyExtremesService,
            get_leads_overview_service_1.GetLeadsOverviewService,
            get_prospects_list_service_1.GetProspectsListService,
            system_summary_service_1.SystemSummaryService,
            system_tools_service_1.SystemToolsService,
        ],
    })
], SystemModule);
//# sourceMappingURL=system.module.js.map