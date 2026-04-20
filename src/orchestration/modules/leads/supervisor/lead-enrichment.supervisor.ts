import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class LeadEnrichmentSupervisorService {
  private readonly leadsSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the lead discovery or enrichment request.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task requirements.'),
    next: z.enum(['LeadEnrichmentAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific instruction for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.lead_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount >= 5) {
      return {
        next: SupervisorType.SCRIPY,
        lead_supervisor_calls: 0,
        analysis:
          'Lead task reached maximum iterations. Returning control to main supervisor.',
      };
    }

    const systemPrompt = `You are supervising lead discovery and enrichment operations.

CURRENT TASK: "${state.current_task || 'Find and enrich leads'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

CONTEXT AVAILABLE:
- Stored Memory: ${state.memory || 'No stored facts'}
- Conversation Summary: ${state.conversation_summary || 'New conversation'}
- Recent Tool Usage: ${state.tool_history || 'No recent tools'}

ROUTING DECISIONS:
1. Route to 'LeadEnrichmentAgent' when:
   - Finding companies by search query
   - Enriching company contacts with detailed information
   - Starting enrichment jobs for multiple companies
   - Retrieving company details

2. Route to 'ScripySupervisor' when:
   - Lead discovery/enrichment is complete
   - User needs to switch to different domain
   - Sufficient data already exists in memory

OPTIMIZATION:
- Check if requested leads are already in stored memory
- Avoid duplicate searches with same parameters
- Reuse existing results when applicable

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.leadsSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      lead_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

/**
 * Backward compatibility export
 */
export const leadEnrichmentSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new LeadEnrichmentSupervisorService(model);
  return service.supervise(state);
};
