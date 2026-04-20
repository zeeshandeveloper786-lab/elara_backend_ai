"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const lead_enrichment_supervisor_1 = require("./supervisor/lead-enrichment.supervisor");
const lead_enrichment_agent_1 = require("./agent/lead-enrichment.agent");
const find_companies_service_1 = require("./tools/find-companies/find-companies.service");
const start_enrichment_job_service_1 = require("./tools/start-enrichment-job/start-enrichment-job.service");
const enrich_all_companies_service_1 = require("./tools/enrich-all-companies/enrich-all-companies.service");
const get_company_detail_service_1 = require("./tools/get-company-detail/get-company-detail.service");
const leads_tools_service_1 = require("./tools/leads-tools.service");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            lead_enrichment_supervisor_1.LeadEnrichmentSupervisorService,
            lead_enrichment_agent_1.LeadEnrichmentAgentService,
            find_companies_service_1.FindCompaniesService,
            start_enrichment_job_service_1.StartEnrichmentJobService,
            enrich_all_companies_service_1.EnrichAllCompaniesService,
            get_company_detail_service_1.GetCompanyDetailService,
            leads_tools_service_1.LeadsToolsService,
        ],
        exports: [
            lead_enrichment_supervisor_1.LeadEnrichmentSupervisorService,
            lead_enrichment_agent_1.LeadEnrichmentAgentService,
            find_companies_service_1.FindCompaniesService,
            start_enrichment_job_service_1.StartEnrichmentJobService,
            enrich_all_companies_service_1.EnrichAllCompaniesService,
            get_company_detail_service_1.GetCompanyDetailService,
            leads_tools_service_1.LeadsToolsService,
        ],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map