import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { leadsTools } from '../tools/leads.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * NestJS Service for Lead Discovery and Enrichment Agent
 * Finds companies and enriches contact information.
 */
@Injectable()
export class LeadEnrichmentAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Find and enrich leads';

    const systemPrompt = `You are a lead discovery and enrichment specialist with access to company search and enrichment tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. find_companies - Search for companies by query
2. start_enrichment_job - Enrich company contacts with detailed information
3. enrich_all_companies - Batch enrich unenriched companies
4. get_company_detail - Retrieve detailed company information

WORKFLOW GUIDELINES:
1. For company discovery: Use find_companies with specific search criteria
2. For enrichment: Use start_enrichment_job to get contact details
3. For batch operations: Use enrich_all_companies for multiple companies
4. For details: Use get_company_detail to retrieve full information
5. Build on previous discoveries mentioned in conversation

OPTIMIZATION:
- Check if requested companies are already mentioned in history
- Avoid duplicate searches with identical parameters
- Reuse existing results when applicable

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(leadsTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'LeadEnrichmentAgent',
    };
  }
}

/**
 * Backward compatibility export
 */
export const leadEnrichmentAgent = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new LeadEnrichmentAgentService(model);
  return service.execute(state);
};
