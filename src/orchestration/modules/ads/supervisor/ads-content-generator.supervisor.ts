import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class AdsContentGeneratorSupervisorService {
  private readonly adsSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the current ad content request and progress.'),
    reasoning: z
      .string()
      .describe(
        'Explain why continuing with agent or returning to main supervisor.',
      ),
    next: z.enum(['AdsContentAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific guidance or feedback for the agent.'),
    memory_to_save: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          type: z.enum(['fact', 'preference', 'insight', 'project_context']),
        }),
      )
      .optional()
      .describe('Important marketing insights or preferences to remember.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.ads_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount > 5) {
      return {
        next: SupervisorType.SCRIPY,
        ads_supervisor_calls: 0,
        analysis: 'Ad generation task reached iteration limit.',
      };
    }

    const systemPrompt = `You are the Ads & Marketing Supervisor for Elara. 
Your goal is to oversee the creation of high-performing ad content and comprehensive market research.

### CURRENT CONTEXT:
- **Main Task**: "${state.current_task || 'Generate ad content'}"
- **Active Plan**: ${JSON.stringify(state.tasks || [])}
- **User Context**: ${state.user_name || 'User'} | Campaign: ${state.campaign_id || 'None'}

### ROUTING LOGIC:
1. **Delegate to 'AdsContentAgent'**:
   - To perform market research (competitors, audience, trends).
   - To generate platform-specific ad copy (FB, Google, etc.).
   - To refine existing copy based on user feedback.
   - To save finalized content to the database.

2. **Return to 'ScripySupervisor'**:
   - When the marketing task is complete.
   - When user clarification is needed that is outside the Ads domain.
   - When the current plan step is finished and you need the Master Brain to decide the next phase.

3. **'FINISH'**:
   - Only if the entire conversation/interaction is complete (rarely used by sub-supervisors).

### STRATEGY:
- If market research is needed, ensure it happens BEFORE ad generation.
- Ensure all generated copy matches the campaign goals.
- If the user provided a plan via ScripySupervisor, stick to it.

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.adsSupervisorSchema,
    );
    const response = (await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ])) as any;

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      ads_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
      memory_to_save: response.memory_to_save,
    };
  }
}

// Backward compatibility
export const adsContentGeneratorSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new AdsContentGeneratorSupervisorService(model);
  return service.supervise(state);
};
