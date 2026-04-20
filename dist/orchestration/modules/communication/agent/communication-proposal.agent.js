"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationProposalAgent = exports.CommunicationProposalAgentService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const communication_tools_1 = require("../tools/communication.tools");
let CommunicationProposalAgentService = class CommunicationProposalAgentService {
    chatModel;
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async execute(state) {
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
        const agent = this.chatModel.bindTools(communication_tools_1.communicationTools);
        const response = await agent.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            messages: [response],
            sender: 'CommunicationAgent',
        };
    }
};
exports.CommunicationProposalAgentService = CommunicationProposalAgentService;
exports.CommunicationProposalAgentService = CommunicationProposalAgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], CommunicationProposalAgentService);
const communicationProposalAgent = async (state, model) => {
    const service = new CommunicationProposalAgentService(model);
    return service.execute(state);
};
exports.communicationProposalAgent = communicationProposalAgent;
//# sourceMappingURL=communication-proposal.agent.js.map