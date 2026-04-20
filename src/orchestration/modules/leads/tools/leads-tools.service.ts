import { Injectable } from '@nestjs/common';
import { FindCompaniesService } from './find-companies/find-companies.service';
import { StartEnrichmentJobService } from './start-enrichment-job/start-enrichment-job.service';
import { EnrichAllCompaniesService } from './enrich-all-companies/enrich-all-companies.service';
import { GetCompanyDetailService } from './get-company-detail/get-company-detail.service';

@Injectable()
export class LeadsToolsService {
  constructor(
    private findCompaniesService: FindCompaniesService,
    private startEnrichmentJobService: StartEnrichmentJobService,
    private enrichAllCompaniesService: EnrichAllCompaniesService,
    private getCompanyDetailService: GetCompanyDetailService,
  ) {}

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
      description:
        'Discovers companies using Tavily search API and saves them to the database.',
    };
  }

  getStartEnrichmentJobTool() {
    return {
      service: this.startEnrichmentJobService,
      name: 'start_enrichment_job',
      description:
        'Enriches company data by finding decision-maker contacts using Apollo.io API.',
    };
  }

  getEnrichAllCompaniesTool() {
    return {
      service: this.enrichAllCompaniesService,
      name: 'enrich_all_companies',
      description:
        'Automatically enriches all companies in the database that do not have leads.',
    };
  }

  getGetCompanyDetailTool() {
    return {
      service: this.getCompanyDetailService,
      name: 'get_company_detail',
      description:
        'Retrieves comprehensive company information including leads and campaigns.',
    };
  }
}
