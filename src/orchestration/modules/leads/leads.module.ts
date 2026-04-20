import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { LeadEnrichmentSupervisorService } from './supervisor/lead-enrichment.supervisor';
import { LeadEnrichmentAgentService } from './agent/lead-enrichment.agent';
import { FindCompaniesService } from './tools/find-companies/find-companies.service';
import { StartEnrichmentJobService } from './tools/start-enrichment-job/start-enrichment-job.service';
import { EnrichAllCompaniesService } from './tools/enrich-all-companies/enrich-all-companies.service';
import { GetCompanyDetailService } from './tools/get-company-detail/get-company-detail.service';
import { LeadsToolsService } from './tools/leads-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    LeadEnrichmentSupervisorService,
    LeadEnrichmentAgentService,
    FindCompaniesService,
    StartEnrichmentJobService,
    EnrichAllCompaniesService,
    GetCompanyDetailService,
    LeadsToolsService,
  ],
  exports: [
    LeadEnrichmentSupervisorService,
    LeadEnrichmentAgentService,
    FindCompaniesService,
    StartEnrichmentJobService,
    EnrichAllCompaniesService,
    GetCompanyDetailService,
    LeadsToolsService,
  ],
})
export class LeadsModule {}
