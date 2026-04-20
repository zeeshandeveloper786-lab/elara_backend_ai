import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { systemTools } from '../tools/system.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * System Performance and Health Agent
 * Provides system metrics, health checks, and performance analytics.
 */
@Injectable()
export class SystemInsightAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Check system status';

    const systemPrompt = `You are a system performance and health monitor with access to system tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. get_campaign_analytics - Campaign performance metrics
2. get_companies_stats - Company statistics and breakdown
3. get_prospects_list - Lead listing and filtering
4. get_company_extremes - Top performing companies
5. get_companies_list - Recent companies
6. get_leads_overview - Lead summary and statistics
7. check_system_health - System connectivity and health
8. get_system_summary - Storage and resource usage
9. find_company_in_db - Search companies

WORKFLOW GUIDELINES:
1. For health checks: Use check_system_health
2. For metrics: Use appropriate analytics tools
3. For summaries: Use get_system_summary
4. For searches: Use find_company_in_db
5. Present data clearly with business insights

COMMUNICATION:
- Convert technical metrics into actionable insights
- Highlight any issues or concerns
- Suggest improvements if applicable

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(systemTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'SystemInsightAgent',
    };
  }
}

// Backward compatibility
export const systemInsightAgent = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new SystemInsightAgentService(model);
  return service.execute(state);
};
