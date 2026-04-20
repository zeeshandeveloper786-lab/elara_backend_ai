import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { mediaTools } from '../tools/media.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * Media Generation Agent
 * Creates professional marketing visuals and images.
 */
@Injectable()
export class MediaGeneratorAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Generate media';
    const systemPrompt = `You are a visual media specialist with access to image generation tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})
CAMPAIGN: ${state.campaign_id || 'None'}

AVAILABLE TOOLS:
1. generate_image - Create high-quality professional images using OpenAI DALL-E 3. Supports size and style options.

WORKFLOW GUIDELINES:
1. If user provides a simple description, expand it into a detailed visual prompt
2. Include style, composition, lighting, and mood in the prompt
3. Use generate_image to create the image. You can specify size ("1024x1024" or "1792x1024") and style ("natural" or "vivid").
4. Present results with professional summary
5. Offer refinements if needed

PROMPT ENHANCEMENT:
- Add specific details about style and composition
- Include lighting and mood descriptions
- Specify any technical requirements
- Use descriptive language for best results

IMPORTANT:
- Explain what will be created before generating

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(mediaTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'MediaAgent',
    };
  }
}

// Backward compatibility
export const mediaGeneratorAgent = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new MediaGeneratorAgentService(model);
  return service.execute(state);
};
