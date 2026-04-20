import { createScryTool } from '../../../utils/tool-wrapper';
import { FindCompaniesService } from './find-companies/find-companies.service';
import { StartEnrichmentJobService } from './start-enrichment-job/start-enrichment-job.service';
import { EnrichAllCompaniesService } from './enrich-all-companies/enrich-all-companies.service';
import { GetCompanyDetailService } from './get-company-detail/get-company-detail.service';

// Create services for tool creation
const findCompaniesService = new FindCompaniesService();
const startEnrichmentJobService = new StartEnrichmentJobService();
const enrichAllCompaniesService = new EnrichAllCompaniesService(
  startEnrichmentJobService,
);
const getCompanyDetailService = new GetCompanyDetailService();

// Find Companies Tool
export const findCompaniesTool = createScryTool(
  (input: any, state: any) => findCompaniesService.execute(input, state),
  {
    name: 'find_companies',
    description:
      'Discovers companies using Tavily search API, extracts domains, and saves them to the database.',
    schema: findCompaniesService.getSchema(),
  },
);

// Start Enrichment Job Tool
export const startEnrichmentJobTool = createScryTool(
  (input: any, state: any) => startEnrichmentJobService.execute(input, state),
  {
    name: 'start_enrichment_job',
    description:
      'Enriches company data by finding decision-maker contacts using Apollo.io API.',
    schema: startEnrichmentJobService.getSchema(),
  },
);

// Enrich All Companies Tool
export const enrichAllCompaniesTool = createScryTool(
  (input: any, state: any) => enrichAllCompaniesService.execute(input, state),
  {
    name: 'enrich_all_companies',
    description:
      'Automatically enriches all companies in the database that do not have leads yet.',
    schema: enrichAllCompaniesService.getSchema(),
  },
);

// Get Company Detail Tool
export const getCompanyDetailTool = createScryTool(
  (input: any, state: any) => getCompanyDetailService.execute(input, state),
  {
    name: 'get_company_detail',
    description:
      'Retrieves comprehensive company information including leads, campaigns, and communication history.',
    schema: getCompanyDetailService.getSchema(),
  },
);

// Leads tools array for use in orchestration
export const leadsTools = [
  findCompaniesTool,
  startEnrichmentJobTool,
  enrichAllCompaniesTool,
  getCompanyDetailTool,
];
