"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsTools = exports.getCompanyDetailTool = exports.enrichAllCompaniesTool = exports.startEnrichmentJobTool = exports.findCompaniesTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const find_companies_service_1 = require("./find-companies/find-companies.service");
const start_enrichment_job_service_1 = require("./start-enrichment-job/start-enrichment-job.service");
const enrich_all_companies_service_1 = require("./enrich-all-companies/enrich-all-companies.service");
const get_company_detail_service_1 = require("./get-company-detail/get-company-detail.service");
const findCompaniesService = new find_companies_service_1.FindCompaniesService();
const startEnrichmentJobService = new start_enrichment_job_service_1.StartEnrichmentJobService();
const enrichAllCompaniesService = new enrich_all_companies_service_1.EnrichAllCompaniesService(startEnrichmentJobService);
const getCompanyDetailService = new get_company_detail_service_1.GetCompanyDetailService();
exports.findCompaniesTool = (0, tool_wrapper_1.createScryTool)((input, state) => findCompaniesService.execute(input, state), {
    name: 'find_companies',
    description: 'Discovers companies using Tavily search API, extracts domains, and saves them to the database.',
    schema: findCompaniesService.getSchema(),
});
exports.startEnrichmentJobTool = (0, tool_wrapper_1.createScryTool)((input, state) => startEnrichmentJobService.execute(input, state), {
    name: 'start_enrichment_job',
    description: 'Enriches company data by finding decision-maker contacts using Apollo.io API.',
    schema: startEnrichmentJobService.getSchema(),
});
exports.enrichAllCompaniesTool = (0, tool_wrapper_1.createScryTool)((input, state) => enrichAllCompaniesService.execute(input, state), {
    name: 'enrich_all_companies',
    description: 'Automatically enriches all companies in the database that do not have leads yet.',
    schema: enrichAllCompaniesService.getSchema(),
});
exports.getCompanyDetailTool = (0, tool_wrapper_1.createScryTool)((input, state) => getCompanyDetailService.execute(input, state), {
    name: 'get_company_detail',
    description: 'Retrieves comprehensive company information including leads, campaigns, and communication history.',
    schema: getCompanyDetailService.getSchema(),
});
exports.leadsTools = [
    exports.findCompaniesTool,
    exports.startEnrichmentJobTool,
    exports.enrichAllCompaniesTool,
    exports.getCompanyDetailTool,
];
//# sourceMappingURL=leads.tools.js.map