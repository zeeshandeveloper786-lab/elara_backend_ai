import { z } from 'zod';
export declare class StartEnrichmentJobService {
    private readonly startEnrichmentJobSchema;
    execute(input: any, state: any): Promise<string>;
    getSchema(): z.ZodSchema;
}
