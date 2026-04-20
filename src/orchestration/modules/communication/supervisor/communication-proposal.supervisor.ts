import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class CommunicationProposalSupervisorService {
  private readonly communicationSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the communication task status and progress.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task completion.'),
    next: z.enum(['CommunicationAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific guidance for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.comm_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount >= 5) {
      return {
        next: SupervisorType.SCRIPY,
        comm_supervisor_calls: 0,
        analysis:
          'Communication task reached limit. Returning to main supervisor.',
      };
    }

    const systemPrompt = `You are supervising communication and outreach operations.

CURRENT TASK: "${state.current_task || 'Handle communication'}"
USER: ${state.user_name || 'User'} | Company: ${state.company_id || 'None'}

TASK TYPES:
- Message drafting (email, SMS, WhatsApp, LinkedIn)
- Message sending
- Proposal generation
- Appointment booking

ROUTING DECISIONS:
1. Route to 'CommunicationAgent' when:
   - Messages need to be drafted or sent
   - Proposals need to be created
   - Appointments need to be scheduled
   - Communication content needs refinement

2. Route to 'ScripySupervisor' when:
   - Communication task is successfully completed
   - User needs to switch to different domain
   - Agent cannot fulfill request after feedback

QUALITY CHECKS:
- Verify all required parameters are available
- Ensure message content is appropriate
- Check recipient information is valid

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.communicationSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      comm_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

// Backward compatibility
export const communicationProposalSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new CommunicationProposalSupervisorService(model);
  return service.supervise(state);
};
