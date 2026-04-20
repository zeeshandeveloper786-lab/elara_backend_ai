import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private lastConfigHash: string = '';

  private readonly sendEmailSchema = z.object({
    to: z
      .array(z.string().email('Invalid email format'))
      .min(1, 'At least one recipient email is required')
      .max(50, 'Maximum 50 recipients per email')
      .describe('Array of recipient email addresses'),
    subject: z
      .string()
      .min(1, 'Subject is required')
      .max(200, 'Subject must not exceed 200 characters')
      .describe('Email subject line'),
    body: z
      .string()
      .min(1, 'Email body cannot be empty')
      .max(100000, 'Email body must not exceed 100,000 characters')
      .describe('Email content (supports HTML)'),
  });

  /**
   * Reuses or creates a new nodemailer transporter based on environment variables.
   * Caches the transporter to improve performance and reduce memory usage.
   */
  private getTransporter() {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    const configHash = `${SMTP_HOST}:${SMTP_PORT}:${SMTP_USER}:${SMTP_PASS}`;

    if (this.transporter && this.lastConfigHash === configHash) {
      return this.transporter;
    }

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return null;
    }

    const port = parseInt(SMTP_PORT || '587');
    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: port,
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    this.lastConfigHash = configHash;
    return this.transporter;
  }

  async execute(input: any, state: any): Promise<string> {
    const { to, subject, body } = input;
    const { user_id, company_id, campaign_id } = state;

    // Redundant check removed as it's now in tool-wrapper

    if (!to || to.length === 0) {
      return '❌ **Validation Error:** At least one recipient email address is required.';
    }

    if (to.length > 50) {
      return `❌ **Validation Error:** Too many recipients (${to.length}). Maximum 50 recipients per email.`;
    }

    if (!subject || subject.trim().length === 0) {
      return '❌ **Validation Error:** Email subject is required.';
    }

    if (subject.length > 200) {
      return `❌ **Validation Error:** Subject is too long. Keep it under 200 characters.`;
    }

    if (!body || body.trim().length === 0) {
      return '❌ **Validation Error:** Email body cannot be empty.';
    }

    if (body.length > 100000) {
      return `❌ **Validation Error:** Email body is too large. Maximum 100,000 characters.`;
    }

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const validRecipients = to.filter((email) =>
        emailRegex.test(email.trim()),
      );
      const invalidRecipients = to.filter(
        (email) => !emailRegex.test(email.trim()),
      );

      if (validRecipients.length === 0) {
        return `❌ **Validation Error:** No valid email addresses found.`;
      }

      const transporter = this.getTransporter();
      if (!transporter) {
        const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
        return `❌ **SMTP Configuration Error**

Missing required environment variables:
${!SMTP_HOST ? '- SMTP_HOST (e.g., smtp.gmail.com)\n' : ''}${!SMTP_USER ? '- SMTP_USER (your email address)\n' : ''}${!SMTP_PASS ? '- SMTP_PASS (your email password or app password)\n' : ''}`;
      }

      const { SMTP_FROM_NAME, SMTP_USER } = process.env;
      const mailOptions = {
        from: SMTP_FROM_NAME ? `${SMTP_FROM_NAME} <${SMTP_USER}>` : SMTP_USER,
        to: validRecipients.join(', '),
        subject: subject.trim(),
        html: body.trim(),
      };

      const info = await transporter.sendMail(mailOptions);

      await prisma.communicationLog.create({
        data: {
          type: 'Email',
          status: 'Sent',
          content: body.trim(),
          recipient: validRecipients.join('; '),
          user_id,
          company_id: (company_id as string) || null,
          campaign_id: (campaign_id as string) || null,
        },
      });

      return `✅ **Email Sent Successfully!**

**Recipients:** ${validRecipients.length}
**Subject:** ${subject}
**Message ID:** ${info.messageId || 'Generated'}

${invalidRecipients.length > 0 ? `\n⚠️ **Skipped Invalid Recipients:**\n${invalidRecipients.map((e) => `- ${e}`).join('\n')}` : ''}

---
💡 **Next Steps:**
- Monitor delivery status
- Track opens and clicks if supported by your email provider`;
    } catch (error: any) {
      if (error.code === 'EAUTH') {
        return '❌ **SMTP Authentication Error:** Invalid email or password. Please check your SMTP credentials.';
      }

      if (error.code === 'ECONNREFUSED') {
        return '❌ **SMTP Connection Error:** Cannot connect to email server. Please verify SMTP_HOST and SMTP_PORT.';
      }

      return `❌ **Email Error:** ${error.message || 'Unknown error occurred'}`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.sendEmailSchema;
  }
}
