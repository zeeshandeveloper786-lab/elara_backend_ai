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
exports.CommunicationToolsService = void 0;
const common_1 = require("@nestjs/common");
const generate_message_service_1 = require("./generate-message/generate-message.service");
const send_email_service_1 = require("./send-email/send-email.service");
const send_sms_service_1 = require("./send-sms/send-sms.service");
const send_whatsapp_service_1 = require("./send-whatsapp/send-whatsapp.service");
const book_appointment_service_1 = require("./book-appointment/book-appointment.service");
const create_proposal_service_1 = require("./create-proposal/create-proposal.service");
const initiate_ai_call_service_1 = require("./initiate-ai-call/initiate-ai-call.service");
let CommunicationToolsService = class CommunicationToolsService {
    generateMessageService;
    sendEmailService;
    sendSmsService;
    sendWhatsappService;
    bookAppointmentService;
    createProposalService;
    initiateAiCallService;
    constructor(generateMessageService, sendEmailService, sendSmsService, sendWhatsappService, bookAppointmentService, createProposalService, initiateAiCallService) {
        this.generateMessageService = generateMessageService;
        this.sendEmailService = sendEmailService;
        this.sendSmsService = sendSmsService;
        this.sendWhatsappService = sendWhatsappService;
        this.bookAppointmentService = bookAppointmentService;
        this.createProposalService = createProposalService;
        this.initiateAiCallService = initiateAiCallService;
    }
    getTools() {
        return [
            this.getGenerateMessageTool(),
            this.getSendEmailTool(),
            this.getSendSmsTool(),
            this.getSendWhatsappTool(),
            this.getBookAppointmentTool(),
            this.getCreateProposalTool(),
            this.getInitiateAiCallTool(),
        ];
    }
    getGenerateMessageTool() {
        return {
            service: this.generateMessageService,
            name: 'generate_message',
            description: 'Generates high-converting, personalized sales copy for email, SMS, WhatsApp, or LinkedIn.',
        };
    }
    getSendEmailTool() {
        return {
            service: this.sendEmailService,
            name: 'send_email',
            description: 'Sends professional HTML emails via SMTP with comprehensive validation.',
        };
    }
    getSendSmsTool() {
        return {
            service: this.sendSmsService,
            name: 'send_sms',
            description: 'Sends text messages via Twilio with comprehensive validation.',
        };
    }
    getSendWhatsappTool() {
        return {
            service: this.sendWhatsappService,
            name: 'send_whatsapp',
            description: 'Sends WhatsApp messages via Twilio with template support.',
        };
    }
    getBookAppointmentTool() {
        return {
            service: this.bookAppointmentService,
            name: 'book_appointment',
            description: 'Creates real Calendly scheduling links for prospects with pre-filled information.',
        };
    }
    getCreateProposalTool() {
        return {
            service: this.createProposalService,
            name: 'create_proposal',
            description: 'Generates professional PDF business proposals with optional news integration.',
        };
    }
    getInitiateAiCallTool() {
        return {
            service: this.initiateAiCallService,
            name: 'initiate_ai_call',
            description: 'Triggers real-world AI voice calls to prospects using Vapi.ai.',
        };
    }
};
exports.CommunicationToolsService = CommunicationToolsService;
exports.CommunicationToolsService = CommunicationToolsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [generate_message_service_1.GenerateMessageService,
        send_email_service_1.SendEmailService,
        send_sms_service_1.SendSmsService,
        send_whatsapp_service_1.SendWhatsappService,
        book_appointment_service_1.BookAppointmentService,
        create_proposal_service_1.CreateProposalService,
        initiate_ai_call_service_1.InitiateAiCallService])
], CommunicationToolsService);
//# sourceMappingURL=communication-tools.service.js.map