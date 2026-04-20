"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.communicationTools = exports.initiateAiCallTool = exports.createProposalTool = exports.bookAppointmentTool = exports.sendWhatsappTool = exports.sendSmsTool = exports.sendEmailTool = exports.generateMessageTool = void 0;
const tool_wrapper_1 = require("../../../utils/tool-wrapper");
const generate_message_service_1 = require("./generate-message/generate-message.service");
const send_email_service_1 = require("./send-email/send-email.service");
const send_sms_service_1 = require("./send-sms/send-sms.service");
const send_whatsapp_service_1 = require("./send-whatsapp/send-whatsapp.service");
const book_appointment_service_1 = require("./book-appointment/book-appointment.service");
const create_proposal_service_1 = require("./create-proposal/create-proposal.service");
const initiate_ai_call_service_1 = require("./initiate-ai-call/initiate-ai-call.service");
const generateMessageService = new generate_message_service_1.GenerateMessageService();
const sendEmailService = new send_email_service_1.SendEmailService();
const sendSmsService = new send_sms_service_1.SendSmsService();
const sendWhatsappService = new send_whatsapp_service_1.SendWhatsappService();
const bookAppointmentService = new book_appointment_service_1.BookAppointmentService();
const createProposalService = new create_proposal_service_1.CreateProposalService();
const initiateAiCallService = new initiate_ai_call_service_1.InitiateAiCallService();
exports.generateMessageTool = (0, tool_wrapper_1.createScryTool)((input, state) => generateMessageService.execute(input, state), {
    name: 'generate_message',
    description: 'Generates high-converting, personalized sales copy for email, SMS, WhatsApp, or LinkedIn with channel-specific optimization.',
    schema: generateMessageService.getSchema(),
});
exports.sendEmailTool = (0, tool_wrapper_1.createScryTool)((input, state) => sendEmailService.execute(input, state), {
    name: 'send_email',
    description: 'Sends professional HTML emails via SMTP with comprehensive validation and delivery tracking.',
    schema: sendEmailService.getSchema(),
});
exports.sendSmsTool = (0, tool_wrapper_1.createScryTool)((input, state) => sendSmsService.execute(input, state), {
    name: 'send_sms',
    description: 'Sends text messages via Twilio with comprehensive validation and error handling.',
    schema: sendSmsService.getSchema(),
});
exports.sendWhatsappTool = (0, tool_wrapper_1.createScryTool)((input, state) => sendWhatsappService.execute(input, state), {
    name: 'send_whatsapp',
    description: 'Sends WhatsApp messages via Twilio with proper session handling and error management.',
    schema: sendWhatsappService.getSchema(),
});
exports.bookAppointmentTool = (0, tool_wrapper_1.createScryTool)((input, state) => bookAppointmentService.execute(input, state), {
    name: 'book_appointment',
    description: 'Creates real Calendly scheduling links for prospects with pre-filled information.',
    schema: bookAppointmentService.getSchema(),
});
exports.createProposalTool = (0, tool_wrapper_1.createScryTool)((input, state) => createProposalService.execute(input, state), {
    name: 'create_proposal',
    description: 'Generates professional PDF business proposals with optional news integration.',
    schema: createProposalService.getSchema(),
});
exports.initiateAiCallTool = (0, tool_wrapper_1.createScryTool)((input, state) => initiateAiCallService.execute(input, state), {
    name: 'initiate_ai_call',
    description: 'Triggers real-world AI voice calls to prospects using Vapi.ai with comprehensive validation.',
    schema: initiateAiCallService.getSchema(),
});
exports.communicationTools = [
    exports.generateMessageTool,
    exports.sendEmailTool,
    exports.sendSmsTool,
    exports.sendWhatsappTool,
    exports.bookAppointmentTool,
    exports.createProposalTool,
    exports.initiateAiCallTool,
];
//# sourceMappingURL=communication.tools.js.map