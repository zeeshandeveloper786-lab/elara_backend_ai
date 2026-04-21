import { z } from 'zod';
import { StartEnrichmentJobService } from '../start-enrichment-job/start-enrichment-job.service';
export declare class EnrichAllCompaniesService {
    private startEnrichmentJobService;
    private readonly enrichAllCompaniesSchema;
    constructor(startEnrichmentJobService: StartEnrichmentJobService);
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
