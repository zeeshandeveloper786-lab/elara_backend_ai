import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { campaignsTools } from '../tools/campaigns.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * Campaign Management Agent
 * Handles campaign creation, retrieval, and management operations.
 */
@Injectable()
export class CampaignAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Manage campaigns';

    const systemPrompt = `You are a campaign management specialist with access to campaign tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. create_campaign_db - Create new marketing campaigns
2. get_campaigns_list - Retrieve list of campaigns with filters

WORKFLOW GUIDELINES:
1. For campaign creation: Gather necessary details (name, type, budget, duration)
2. For campaign retrieval: Use filters to find specific campaigns
3. Check conversation history to avoid duplicate operations
4. Present results clearly with relevant metrics
5. Suggest next steps based on campaign status

CONTEXT AWARENESS:
- If previous campaigns were mentioned, reference them
- Use stored preferences if available
- Build on previous work in the conversation

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(campaignsTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'CampaignAgent',
    };
  }
}

// Backward compatibility
export const campaignAgent = async (state: ScrpyState, model: ChatOpenAI) => {
  const service = new CampaignAgentService(model);
  return service.execute(state);
};
