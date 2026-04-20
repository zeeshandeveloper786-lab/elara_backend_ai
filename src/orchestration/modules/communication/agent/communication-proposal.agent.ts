import { Injectable } from '@nestjs/common';
import { SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { communicationTools } from '../tools/communication.tools';
import { ScrpyState } from '../../../models/scrpy-state.model';

/**
 * Communication and Outreach Agent
 * Handles message drafting, sending, proposals, and appointment booking.
 */
@Injectable()
export class CommunicationProposalAgentService {
  constructor(private chatModel: ChatOpenAI) {}

  async execute(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const userContext = state.user_name || 'User';
    const currentTask = state.current_task || 'Handle communication';

    const systemPrompt = `You are a communication specialist handling outreach and messaging operations.

CURRENT TASK: "${currentTask}"
USER: ${userContext} (ID: ${state.user_id})
COMPANY: ${state.company_id || 'None'}

AVAILABLE TOOLS:
1. generate_message - Draft messages for email, SMS, WhatsApp, LinkedIn
2. send_sms - Send SMS messages
3. send_whatsapp - Send WhatsApp messages
4. send_email - Send email messages
5. create_proposal - Generate PDF proposals
6. book_appointment - Create appointment booking links
7. initiate_ai_call - Initiate AI voice calls

WORKFLOW GUIDELINES:
1. For message drafting: Use generate_message to create content
2. For sending: Verify recipient information before using send tools
3. For proposals: Gather content and use create_proposal
4. For appointments: Collect date/time and use book_appointment
5. Always confirm successful execution

IMPORTANT:
- Do not assume parameters - ask if missing
- Verify contact information format
- Explain what action will be taken before executing
- Report results clearly

Respond clearly and helpfully to the user's request.`;

    const agent = this.chatModel.bindTools(communicationTools);
    const response = await agent.invoke([
      new SystemMessage(systemPrompt),
      ...state.messages,
    ]);

    return {
      messages: [response],
      sender: 'CommunicationAgent',
    };
  }
}

// Backward compatibility
export const communicationProposalAgent = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new CommunicationProposalAgentService(model);
  return service.execute(state);
};
