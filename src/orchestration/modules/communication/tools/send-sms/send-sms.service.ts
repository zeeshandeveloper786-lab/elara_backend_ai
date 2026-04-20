import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import { Twilio } from 'twilio';
import { normalizeToE164 } from '../../../../utils/phone-normalize';

@Injectable()
export class SendSmsService {
  private client: Twilio | null = null;
  private lastConfigHash: string = '';

  private readonly sendSmsSchema = z.object({
    to_number: z
      .string()
      .min(1, 'Phone number is required')
      .describe('Recipient phone number (with or without country code)'),
    body: z
      .string()
      .min(1, 'SMS body cannot be empty')
      .max(1600, 'Message must not exceed 1600 characters (10 SMS segments)')
      .describe('SMS message content'),
  });

  /**
   * Reuses or creates a new Twilio client based on environment variables.
   * Caches the client to improve performance and reduce memory usage.
   */
  private getClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const configHash = `${accountSid}:${authToken}`;

    if (this.client && this.lastConfigHash === configHash) {
      return this.client;
    }

    if (!accountSid || !authToken) {
      return null;
    }

    this.client = new Twilio(accountSid, authToken);
    this.lastConfigHash = configHash;
    return this.client;
  }

  async execute(input: any, state: any): Promise<string> {
    const { to_number, body } = input;
    const { user_id, company_id, campaign_id } = state;

    // Redundant user_id check removed (handled by tool-wrapper)

    try {
      const client = this.getClient();
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!client || !fromNumber) {
        return `❌ **Twilio Configuration Error**

Missing required environment variables:
${!process.env.TWILIO_ACCOUNT_SID ? '- TWILIO_ACCOUNT_SID\n' : ''}${!process.env.TWILIO_AUTH_TOKEN ? '- TWILIO_AUTH_TOKEN\n' : ''}${!fromNumber ? '- TWILIO_PHONE_NUMBER\n' : ''}`;
      }

      if (!body || body.trim().length === 0) {
        return '❌ **Validation Error:** SMS body cannot be empty.';
      }

      if (body.length > 1600) {
        return `❌ **Validation Error:** Message is too long (${body.length} characters).`;
      }

      if (!to_number || to_number.trim().length === 0) {
        return '❌ **Validation Error:** Recipient phone number is required.';
      }

      let normalized: string;
      try {
        normalized = normalizeToE164(to_number);
      } catch {
        return `❌ **Phone Number Error:** Could not normalize "${to_number}".`;
      }

      const segments = Math.ceil(body.length / 160);

      const message = await client.messages.create({
        body: body.trim(),
        from: fromNumber,
        to: normalized,
      });

      const estimatedCost = segments * 0.0075;

      await prisma.communicationLog.create({
        data: {
          type: 'SMS',
          status: 'Sent',
          content: body.trim(),
          recipient: normalized,
          user_id,
          company_id: (company_id as string) || null,
          campaign_id: (campaign_id as string) || null,
        },
      });

      return `✅ **SMS Sent Successfully!**

**Recipient:** ${normalized}
**Message Length:** ${body.length} characters (${segments} segment${segments > 1 ? 's' : ''})
**Message SID:** ${message.sid}
**Status:** ${message.status}
**Estimated Cost:** $${estimatedCost.toFixed(4)} USD

---
💡 **Tips:**
- SMS segments are billed separately
- Shorter messages (under 160 chars) are often more effective
- Monitor delivery status in Twilio console`;
    } catch (error: any) {
      if (error.code === 21211) {
        return `❌ **Invalid Phone Number:** The number format is invalid.`;
      }

      if (error.code === 21608) {
        return `❌ **Restricted Number:** This number cannot receive SMS.`;
      }

      if (error.message?.includes('timeout')) {
        return '❌ **Timeout Error:** SMS delivery took too long. Please try again.';
      }

      return `❌ **SMS Error:** ${error.message || 'Unknown error occurred'}`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.sendSmsSchema;
  }
}
