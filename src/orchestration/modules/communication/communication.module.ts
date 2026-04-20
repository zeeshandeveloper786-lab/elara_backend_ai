import { Module } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { createModel } from '../../AI-model/openai-model';
import { CommunicationProposalSupervisorService } from './supervisor/communication-proposal.supervisor';
import { CommunicationProposalAgentService } from './agent/communication-proposal.agent';
import { GenerateMessageService } from './tools/generate-message/generate-message.service';
import { SendEmailService } from './tools/send-email/send-email.service';
import { SendSmsService } from './tools/send-sms/send-sms.service';
import { SendWhatsappService } from './tools/send-whatsapp/send-whatsapp.service';
import { BookAppointmentService } from './tools/book-appointment/book-appointment.service';
import { CreateProposalService } from './tools/create-proposal/create-proposal.service';
import { InitiateAiCallService } from './tools/initiate-ai-call/initiate-ai-call.service';
import { CommunicationToolsService } from './tools/communication-tools.service';

@Module({
  providers: [
    {
      provide: ChatOpenAI,
      useFactory: () => createModel(),
    },
    CommunicationProposalSupervisorService,
    CommunicationProposalAgentService,
    GenerateMessageService,
    SendEmailService,
    SendSmsService,
    SendWhatsappService,
    BookAppointmentService,
    CreateProposalService,
    InitiateAiCallService,
    CommunicationToolsService,
  ],
  exports: [
    CommunicationProposalSupervisorService,
    CommunicationProposalAgentService,
    GenerateMessageService,
    SendEmailService,
    SendSmsService,
    SendWhatsappService,
    BookAppointmentService,
    CreateProposalService,
    InitiateAiCallService,
    CommunicationToolsService,
  ],
})
export class CommunicationModule {}
