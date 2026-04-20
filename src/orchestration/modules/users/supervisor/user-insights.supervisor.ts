import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class UserInsightsSupervisorService {
  private readonly userSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the user profile or account request.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task type.'),
    next: z.enum(['UserInsightAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific instruction for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.user_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount > 5) {
      return {
        next: SupervisorType.SCRIPY,
        user_supervisor_calls: 0,
        analysis: 'User management task reached limit.',
      };
    }

    const systemPrompt = `You are supervising user account and profile management operations.

CURRENT TASK: "${state.current_task || 'Manage user account'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

ROUTING DECISIONS:
1. Route to 'UserInsightAgent' when:
   - User profile information is requested
   - Account settings need to be updated
   - Password changes are needed
   - User statistics are requested

2. Route to 'ScripySupervisor' when:
   - User operation is complete
   - User needs to switch to different domain
   - Account information has been provided

SECURITY CONSIDERATIONS:
- Verify user identity before sensitive operations
- Ensure password changes are secure
- Protect personal information

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.userSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      user_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

// Backward compatibility
export const userInsightsSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new UserInsightsSupervisorService(model);
  return service.supervise(state);
};
