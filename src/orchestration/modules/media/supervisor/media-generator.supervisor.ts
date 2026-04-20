import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { ScrpyState, SupervisorType } from '../../../models/scrpy-state.model';

@Injectable()
export class MediaGeneratorSupervisorService {
  private readonly mediaSupervisorSchema = z.object({
    analysis: z
      .string()
      .describe('Analyze the media generation request and progress.'),
    reasoning: z
      .string()
      .describe('Explain routing decision based on task status.'),
    next: z.enum(['MediaAgent', 'ScripySupervisor', 'FINISH']),
    instruction: z
      .string()
      .optional()
      .describe('Specific guidance for the agent.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const callCount = state.media_supervisor_calls || 0;

    // Loop protection - reduced for performance
    if (callCount > 5) {
      return {
        next: SupervisorType.SCRIPY,
        media_supervisor_calls: 0,
        analysis: 'Media generation reached iteration limit.',
      };
    }

    const systemPrompt = `You are supervising visual media generation operations.

CURRENT TASK: "${state.current_task || 'Generate media'}"
USER: ${state.user_name || 'User'} | Campaign: ${state.campaign_id || 'None'}

ROUTING DECISIONS:
1. Route to 'MediaAgent' when:
   - Image generation is requested
   - Creative prompts need to be refined
   - Generated images need modifications
   - Visual assets need to be created

2. Route to 'ScripySupervisor' when:
   - Image has been successfully generated
   - User needs to switch to different domain
   - Media task is complete

QUALITY CHECKS:
- Ensure prompts are detailed and descriptive
- Verify generated images meet requirements
- Check that assets are properly stored

Respond clearly and helpfully to the user's request.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.mediaSupervisorSchema,
    );
    const response = await structuredModel.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      next: response.next as any,
      current_task: response.instruction || state.current_task,
      media_supervisor_calls: callCount + 1,
      analysis: response.analysis,
      reasoning: response.reasoning,
    };
  }
}

// Backward compatibility
export const mediaGeneratorSupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new MediaGeneratorSupervisorService(model);
  return service.supervise(state);
};
