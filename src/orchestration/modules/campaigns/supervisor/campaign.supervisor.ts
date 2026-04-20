import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class CampaignSupervisorService {
  private readonly campaignsSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the campaign request and current state.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task requirements.'),
    next: z.enum(['CampaignAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific instruction for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.campaign_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount > 5) {
      return {
        next: SupervisorType.SCRIPY,
        campaign_supervisor_calls: 0,
        analysis: 'Campaign task reached limit.',
      };
    }

    const systemPrompt = `You are supervising campaign management operations.

CURRENT TASK: "${state.current_task || 'Manage campaigns'}"
USER: ${state.user_name || 'User'} | Campaign ID: ${state.campaign_id || 'None'}

CONTEXT AVAILABLE:
- Stored Memory: ${state.memory || 'No stored facts'}
- Conversation Summary: ${state.conversation_summary || 'New conversation'}
- Recent Tool Usage: ${state.tool_history || 'No recent tools'}

ROUTING DECISIONS:
1. Route to 'CampaignAgent' when:
   - Creating new campaigns
   - Retrieving campaign lists or details
   - Updating campaign information
   - Analyzing campaign performance

2. Route to 'ScripySupervisor' when:
   - Campaign task is complete
   - User needs to switch to different domain
   - Clarification needed from user

OPTIMIZATION:
- Check if similar data was already retrieved in recent history
- Reuse existing results if parameters haven't changed
- Avoid redundant tool calls

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.campaignsSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      campaign_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

// Backward compatibility
export const campaignSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new CampaignSupervisorService(model);
  return service.supervise(state);
};
