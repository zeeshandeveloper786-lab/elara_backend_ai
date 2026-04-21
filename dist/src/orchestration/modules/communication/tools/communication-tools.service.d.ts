import { GenerateMessageService } from './generate-message/generate-message.service';
import { SendEmailService } from './send-email/send-email.service';
import { SendSmsService } from './send-sms/send-sms.service';
import { SendWhatsappService } from './send-whatsapp/send-whatsapp.service';
import { BookAppointmentService } from './book-appointment/book-appointment.service';
import { CreateProposalService } from './create-proposal/create-proposal.service';
import { InitiateAiCallService } from './initiate-ai-call/initiate-ai-call.service';
export declare class CommunicationToolsService {
    private generateMessageService;
    private sendEmailService;
    private sendSmsService;
    private sendWhatsappService;
    private bookAppointmentService;
    private createProposalService;
    private initiateAiCallService;
    constructor(generateMessageService: GenerateMessageService, sendEmailService: SendEmailService, sendSmsService: SendSmsService, sendWhatsappService: SendWhatsappService, bookAppointmentService: BookAppointmentService, createProposalService: CreateProposalService, initiateAiCallService: InitiateAiCallService);
    getTools(): ({
        service: GenerateMessageService;
        name: string;
        description: string;
    } | {
        service: SendEmailService;
        name: string;
        description: string;
    } | {
        service: SendSmsService;
        name: string;
        description: string;
    } | {
        service: SendWhatsappService;
        name: string;
        description: string;
    } | {
        service: BookAppointmentService;
        name: string;
        description: string;
    } | {
        service: CreateProposalService;
        name: string;
        description: string;
    } | {
        service: InitiateAiCallService;
        name: string;
        description: string;
    })[];
    getGenerateMessageTool(): {
        service: GenerateMessageService;
        name: string;
        description: string;
    };
    getSendEmailTool(): {
        service: SendEmailService;
        name: string;
        description: string;
    };
    getSendSmsTool(): {
        service: SendSmsService;
        name: string;
        description: string;
    };
    getSendWhatsappTool(): {
        service: SendWhatsappService;
        name: string;
        description: string;
    };
    getBookAppointmentTool(): {
        service: BookAppointmentService;
        name: string;
        description: string;
    };
    getCreateProposalTool(): {
        service: CreateProposalService;
        name: string;
        description: string;
    };
    getInitiateAiCallTool(): {
        service: InitiateAiCallService;
        name: string;
        description: string;
    };
}
