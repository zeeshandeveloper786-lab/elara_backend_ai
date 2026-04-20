import { createScryTool } from '../../../utils/tool-wrapper';
import { GenerateMessageService } from './generate-message/generate-message.service';
import { SendEmailService } from './send-email/send-email.service';
import { SendSmsService } from './send-sms/send-sms.service';
import { SendWhatsappService } from './send-whatsapp/send-whatsapp.service';
import { BookAppointmentService } from './book-appointment/book-appointment.service';
import { CreateProposalService } from './create-proposal/create-proposal.service';
import { InitiateAiCallService } from './initiate-ai-call/initiate-ai-call.service';

// Create services for tool creation
const generateMessageService = new GenerateMessageService();
const sendEmailService = new SendEmailService();
const sendSmsService = new SendSmsService();
const sendWhatsappService = new SendWhatsappService();
const bookAppointmentService = new BookAppointmentService();
const createProposalService = new CreateProposalService();
const initiateAiCallService = new InitiateAiCallService();

// Generate Message Tool
export const generateMessageTool = createScryTool(
  (input: any, state: any) => generateMessageService.execute(input, state),
  {
    name: 'generate_message',
    description:
      'Generates high-converting, personalized sales copy for email, SMS, WhatsApp, or LinkedIn with channel-specific optimization.',
    schema: generateMessageService.getSchema(),
  },
);

// Send Email Tool
export const sendEmailTool = createScryTool(
  (input: any, state: any) => sendEmailService.execute(input, state),
  {
    name: 'send_email',
    description:
      'Sends professional HTML emails via SMTP with comprehensive validation and delivery tracking.',
    schema: sendEmailService.getSchema(),
  },
);

// Send SMS Tool
export const sendSmsTool = createScryTool(
  (input: any, state: any) => sendSmsService.execute(input, state),
  {
    name: 'send_sms',
    description:
      'Sends text messages via Twilio with comprehensive validation and error handling.',
    schema: sendSmsService.getSchema(),
  },
);

// Send WhatsApp Tool
export const sendWhatsappTool = createScryTool(
  (input: any, state: any) => sendWhatsappService.execute(input, state),
  {
    name: 'send_whatsapp',
    description:
      'Sends WhatsApp messages via Twilio with proper session handling and error management.',
    schema: sendWhatsappService.getSchema(),
  },
);

// Book Appointment Tool
export const bookAppointmentTool = createScryTool(
  (input: any, state: any) => bookAppointmentService.execute(input, state),
  {
    name: 'book_appointment',
    description:
      'Creates real Calendly scheduling links for prospects with pre-filled information.',
    schema: bookAppointmentService.getSchema(),
  },
);

// Create Proposal Tool
export const createProposalTool = createScryTool(
  (input: any, state: any) => createProposalService.execute(input, state),
  {
    name: 'create_proposal',
    description:
      'Generates professional PDF business proposals with optional news integration.',
    schema: createProposalService.getSchema(),
  },
);

// Initiate AI Call Tool
export const initiateAiCallTool = createScryTool(
  (input: any, state: any) => initiateAiCallService.execute(input, state),
  {
    name: 'initiate_ai_call',
    description:
      'Triggers real-world AI voice calls to prospects using Vapi.ai with comprehensive validation.',
    schema: initiateAiCallService.getSchema(),
  },
);

// Communication tools array for use in orchestration
export const communicationTools = [
  generateMessageTool,
  sendEmailTool,
  sendSmsTool,
  sendWhatsappTool,
  bookAppointmentTool,
  createProposalTool,
  initiateAiCallTool,
];
