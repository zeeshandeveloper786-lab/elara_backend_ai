import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class SystemInsightSupervisorService {
  private readonly systemSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the system query or health check request.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task type.'),
    next: z.enum(['SystemInsightAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific instruction for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.system_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount > 5) {
      return {
        next: SupervisorType.SCRIPY,
        system_supervisor_calls: 0,
        analysis: 'System query reached limit.',
      };
    }

    const systemPrompt = `You are supervising system performance and health monitoring operations.

CURRENT TASK: "${state.current_task || 'Check system status'}"
USER: ${state.user_name || 'User'} (ID: ${state.user_id})

ROUTING DECISIONS:
1. Route to 'SystemInsightAgent' when:
   - System health checks are requested
   - Performance metrics are needed
   - Analytics or statistics are requested
   - System status needs to be monitored

2. Route to 'ScripySupervisor' when:
   - System information has been provided
   - User needs to switch to different domain
   - Query is non-technical

QUALITY CHECKS:
- Ensure metrics are accurate and current
- Translate technical data into business insights
- Provide actionable recommendations

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.systemSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      system_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

// Backward compatibility
export const systemInsightSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new SystemInsightSupervisorService(model);
  return service.supervise(state);
};
