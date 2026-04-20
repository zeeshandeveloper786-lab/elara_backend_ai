import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { userTools } from '../tools/users.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * User Account and Profile Management Agent
 * Handles user profile operations and account settings.
 */
@Injectable()
export class UserInsightAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Manage user account';

    const systemPrompt = `You are a user profile and account specialist with access to account tools.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})

AVAILABLE TOOLS:
1. get_user_profile - Retrieve user profile and statistics
2. update_user_profile - Update name and email
3. change_user_password - Change account password
4. delete_user - Delete user account

WORKFLOW GUIDELINES:
1. For profile retrieval: Use get_user_profile
2. For updates: Use update_user_profile with new information
3. For password changes: Use change_user_password with verification
4. For account deletion: Use delete_user with confirmation
5. Always confirm operations before executing

SECURITY GUIDELINES:
- Verify user identity for sensitive operations
- Ensure password changes are secure
- Protect personal information
- Confirm destructive operations

IMPORTANT:
- Do not assume parameters - ask if missing
- Verify information before updating
- Explain what action will be taken

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(userTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'UserInsightAgent',
    };
  }
}

// Backward compatibility
export const userInsightAgent = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new UserInsightAgentService(model);
  return service.execute(state);
};
