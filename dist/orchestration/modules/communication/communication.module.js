"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationModule = void 0;
const common_1 = require("@nestjs/common");
const openai_1 = require("@langchain/openai");
const openai_model_1 = require("../../AI-model/openai-model");
const communication_proposal_supervisor_1 = require("./supervisor/communication-proposal.supervisor");
const communication_proposal_agent_1 = require("./agent/communication-proposal.agent");
const generate_message_service_1 = require("./tools/generate-message/generate-message.service");
const send_email_service_1 = require("./tools/send-email/send-email.service");
const send_sms_service_1 = require("./tools/send-sms/send-sms.service");
const send_whatsapp_service_1 = require("./tools/send-whatsapp/send-whatsapp.service");
const book_appointment_service_1 = require("./tools/book-appointment/book-appointment.service");
const create_proposal_service_1 = require("./tools/create-proposal/create-proposal.service");
const initiate_ai_call_service_1 = require("./tools/initiate-ai-call/initiate-ai-call.service");
const communication_tools_service_1 = require("./tools/communication-tools.service");
let CommunicationModule = class CommunicationModule {
};
exports.CommunicationModule = CommunicationModule;
exports.CommunicationModule = CommunicationModule = __decorate([
    (0, common_1.Module)({
        providers: [
            {
                provide: openai_1.ChatOpenAI,
                useFactory: () => (0, openai_model_1.createModel)(),
            },
            communication_proposal_supervisor_1.CommunicationProposalSupervisorService,
            communication_proposal_agent_1.CommunicationProposalAgentService,
            generate_message_service_1.GenerateMessageService,
            send_email_service_1.SendEmailService,
            send_sms_service_1.SendSmsService,
            send_whatsapp_service_1.SendWhatsappService,
            book_appointment_service_1.BookAppointmentService,
            create_proposal_service_1.CreateProposalService,
            initiate_ai_call_service_1.InitiateAiCallService,
            communication_tools_service_1.CommunicationToolsService,
        ],
        exports: [
            communication_proposal_supervisor_1.CommunicationProposalSupervisorService,
            communication_proposal_agent_1.CommunicationProposalAgentService,
            generate_message_service_1.GenerateMessageService,
            send_email_service_1.SendEmailService,
            send_sms_service_1.SendSmsService,
            send_whatsapp_service_1.SendWhatsappService,
            book_appointment_service_1.BookAppointmentService,
            create_proposal_service_1.CreateProposalService,
            initiate_ai_call_service_1.InitiateAiCallService,
            communication_tools_service_1.CommunicationToolsService,
        ],
    })
], CommunicationModule);
//# sourceMappingURL=communication.module.js.map