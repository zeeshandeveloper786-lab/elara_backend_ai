import { Injectable } from '@nestjs/common';
import { GenerateMessageService } from './generate-message/generate-message.service';
import { SendEmailService } from './send-email/send-email.service';
import { SendSmsService } from './send-sms/send-sms.service';
import { SendWhatsappService } from './send-whatsapp/send-whatsapp.service';
import { BookAppointmentService } from './book-appointment/book-appointment.service';
import { CreateProposalService } from './create-proposal/create-proposal.service';
import { InitiateAiCallService } from './initiate-ai-call/initiate-ai-call.service';

@Injectable()
export class CommunicationToolsService {
  constructor(
    private generateMessageService: GenerateMessageService,
    private sendEmailService: SendEmailService,
    private sendSmsService: SendSmsService,
    private sendWhatsappService: SendWhatsappService,
    private bookAppointmentService: BookAppointmentService,
    private createProposalService: CreateProposalService,
    private initiateAiCallService: InitiateAiCallService,
  ) {}

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
      description:
        'Generates high-converting, personalized sales copy for email, SMS, WhatsApp, or LinkedIn.',
    };
  }

  getSendEmailTool() {
    return {
      service: this.sendEmailService,
      name: 'send_email',
      description:
        'Sends professional HTML emails via SMTP with comprehensive validation.',
    };
  }

  getSendSmsTool() {
    return {
      service: this.sendSmsService,
      name: 'send_sms',
      description:
        'Sends text messages via Twilio with comprehensive validation.',
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
      description:
        'Creates real Calendly scheduling links for prospects with pre-filled information.',
    };
  }

  getCreateProposalTool() {
    return {
      service: this.createProposalService,
      name: 'create_proposal',
      description:
        'Generates professional PDF business proposals with optional news integration.',
    };
  }

  getInitiateAiCallTool() {
    return {
      service: this.initiateAiCallService,
      name: 'initiate_ai_call',
      description:
        'Triggers real-world AI voice calls to prospects using Vapi.ai.',
    };
  }
}
