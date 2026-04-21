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
exports.LeadsToolsService = void 0;
const common_1 = require("@nestjs/common");
const find_companies_service_1 = require("./find-companies/find-companies.service");
const start_enrichment_job_service_1 = require("./start-enrichment-job/start-enrichment-job.service");
const enrich_all_companies_service_1 = require("./enrich-all-companies/enrich-all-companies.service");
const get_company_detail_service_1 = require("./get-company-detail/get-company-detail.service");
let LeadsToolsService = class LeadsToolsService {
    findCompaniesService;
    startEnrichmentJobService;
    enrichAllCompaniesService;
    getCompanyDetailService;
    constructor(findCompaniesService, startEnrichmentJobService, enrichAllCompaniesService, getCompanyDetailService) {
        this.findCompaniesService = findCompaniesService;
        this.startEnrichmentJobService = startEnrichmentJobService;
        this.enrichAllCompaniesService = enrichAllCompaniesService;
        this.getCompanyDetailService = getCompanyDetailService;
    }
    getTools() {
        return [
            this.getFindCompaniesTool(),
            this.getStartEnrichmentJobTool(),
            this.getEnrichAllCompaniesTool(),
            this.getGetCompanyDetailTool(),
        ];
    }
    getFindCompaniesTool() {
        return {
            service: this.findCompaniesService,
            name: 'find_companies',
            description: 'Discovers companies using Tavily search API and saves them to the database.',
        };
    }
    getStartEnrichmentJobTool() {
        return {
            service: this.startEnrichmentJobService,
            name: 'start_enrichment_job',
            description: 'Enriches company data by finding decision-maker contacts using Apollo.io API.',
        };
    }
    getEnrichAllCompaniesTool() {
        return {
            service: this.enrichAllCompaniesService,
            name: 'enrich_all_companies',
            description: 'Automatically enriches all companies in the database that do not have leads.',
        };
    }
    getGetCompanyDetailTool() {
        return {
            service: this.getCompanyDetailService,
            name: 'get_company_detail',
            description: 'Retrieves comprehensive company information including leads and campaigns.',
        };
    }
};
exports.LeadsToolsService = LeadsToolsService;
exports.LeadsToolsService = LeadsToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [find_companies_service_1.FindCompaniesService,
        start_enrichment_job_service_1.StartEnrichmentJobService,
        enrich_all_companies_service_1.EnrichAllCompaniesService,
        get_company_detail_service_1.GetCompanyDetailService])
], LeadsToolsService);
//# sourceMappingURL=leads-tools.service.js.map