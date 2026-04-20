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
exports.communicationProposalSupervisor = exports.CommunicationProposalSupervisorService = void 0;
const common_1 = require("@nestjs/common");
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const scrpy_state_model_1 = require("../../../models/scrpy-state.model");
let CommunicationProposalSupervisorService = class CommunicationProposalSupervisorService {
    chatModel;
    communicationSupervisorSchema = zod_1.z.object({
        analysis: zod_1.z
            .string()
            .describe('Analyze the communication task status and progress.'),
        reasoning: zod_1.z
            .string()
            .describe('Explain routing decision based on task completion.'),
        next: zod_1.z.enum(['CommunicationAgent', 'ScripySupervisor', 'FINISH']),
        instruction: zod_1.z
            .string()
            .optional()
            .describe('Specific guidance for the agent.'),
    });
    constructor(chatModel) {
        this.chatModel = chatModel;
    }
    async supervise(state) {
        const callCount = state.comm_supervisor_calls || 0;
        if (callCount >= 5) {
            return {
                next: scrpy_state_model_1.SupervisorType.SCRIPY,
                comm_supervisor_calls: 0,
                analysis: 'Communication task reached limit. Returning to main supervisor.',
            };
        }
        const systemPrompt = `You are supervising communication and outreach operations.

CURRENT TASK: "${state.current_task || 'Handle communication'}"
USER: ${state.user_name || 'User'} | Company: ${state.company_id || 'None'}

TASK TYPES:
- Message drafting (email, SMS, WhatsApp, LinkedIn)
- Message sending
- Proposal generation
- Appointment booking

ROUTING DECISIONS:
1. Route to 'CommunicationAgent' when:
   - Messages need to be drafted or sent
   - Proposals need to be created
   - Appointments need to be scheduled
   - Communication content needs refinement

2. Route to 'ScripySupervisor' when:
   - Communication task is successfully completed
   - User needs to switch to different domain
   - Agent cannot fulfill request after feedback

QUALITY CHECKS:
- Verify all required parameters are available
- Ensure message content is appropriate
- Check recipient information is valid

Respond clearly and helpfully to the user's request.`;
        const structuredModel = this.chatModel.withStructuredOutput(this.communicationSupervisorSchema);
        const response = await structuredModel.invoke([
            new messages_1.SystemMessage(systemPrompt),
            ...state.messages,
        ]);
        return {
            next: response.next,
            current_task: response.instruction || state.current_task,
            comm_supervisor_calls: callCount + 1,
            analysis: response.analysis,
            reasoning: response.reasoning,
        };
    }
};
exports.CommunicationProposalSupervisorService = CommunicationProposalSupervisorService;
exports.CommunicationProposalSupervisorService = CommunicationProposalSupervisorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [openai_1.ChatOpenAI])
], CommunicationProposalSupervisorService);
const communicationProposalSupervisor = async (state, model) => {
    const service = new CommunicationProposalSupervisorService(model);
    return service.supervise(state);
};
exports.communicationProposalSupervisor = communicationProposalSupervisor;
//# sourceMappingURL=communication-proposal.supervisor.js.map