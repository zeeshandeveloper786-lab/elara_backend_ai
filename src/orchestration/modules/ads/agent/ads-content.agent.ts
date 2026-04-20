import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { SystemMessage } from '@langchain/core/messages';
import { adsTools } from '../tools/ads.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * Ad Content Generation Agent
 * Creates marketing copy and conducts market research using available tools.
 */
@Injectable()
export class AdsContentAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const campaignContext = state.campaign_id || 'No active campaign';
    const currentTask = state.current_task || 'Generate ad content';

    const systemPrompt = `You are the Ads & Marketing Specialist for Elara. 
Your expertise lies in conducting deep market research and crafting high-converting ad copy.

### CONTEXT:
- **Current Objective**: "${currentTask}"
- **Plan Progress**: ${JSON.stringify(state.tasks || [])}
- **User**: ${userContext} (ID: ${state.user_id})
- **Campaign**: ${campaignContext}

### YOUR TOOLS:
1. **market_research**: Use this to analyze competitors, audience pain points, and trends. Essential for new or complex topics.
2. **generate_ad_content**: Use this to create the actual ad copy for platforms like Facebook, Google, LinkedIn, etc.

### WORKFLOW:
1. **Research First**: If you don't have enough audience or competitor data, perform 'market_research' first.
2. **Platform Specifics**: When generating ads, ensure you follow the best practices for the chosen platform.
3. **Drafting**: All generated ads are automatically saved to the database as drafts.
4. **Reasoning**: Always explain WHY you chose a certain marketing angle or research strategy.

### QUALITY STANDARDS:
- **Tone**: Professional yet engaging.
- **CTA**: Every ad must have a clear call-to-action.
- **Value**: Focus on benefits, not just features.

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(adsTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'AdsContentAgent',
    };
  }
}

// Backward compatibility
export const adsContentAgent = async (state: ScrpyState, model: ChatOpenAI) => {
  const service = new AdsContentAgentService(model);
  return service.execute(state);
};
