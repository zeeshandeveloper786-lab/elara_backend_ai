import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import { Twilio } from 'twilio';
import { normalizeToE164 } from '../../../../utils/phone-normalize';

@Injectable()
export class SendWhatsappService {
  private client: Twilio | null = null;
  private lastConfigHash: string = '';

  private readonly sendWhatsappSchema = z.object({
    to_number: z
      .string()
      .min(1, 'Phone number is required')
      .describe('Recipient WhatsApp phone number'),
    body: z
      .string()
      .min(1, 'WhatsApp message cannot be empty')
      .max(4096, 'Message must not exceed 4096 characters')
      .describe('WhatsApp message content'),
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

Missing required environment variables for WhatsApp.`;
      }

      if (!body || body.trim().length === 0) {
        return '❌ **Validation Error:** WhatsApp message body cannot be empty.';
      }

      if (body.length > 4096) {
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

      const formattedFrom = fromNumber.startsWith('whatsapp:')
        ? fromNumber
        : `whatsapp:${fromNumber}`;
      const formattedTo = normalized.startsWith('whatsapp:')
        ? normalized
        : `whatsapp:${normalized}`;

      const message = await client.messages.create({
        body: body.trim(),
        from: formattedFrom,
        to: formattedTo,
      });

      await prisma.communicationLog.create({
        data: {
          type: 'WhatsApp',
          status: 'Sent',
          content: body.trim(),
          recipient: normalized,
          user_id,
          company_id: (company_id as string) || null,
          campaign_id: (campaign_id as string) || null,
        },
      });

      return `✅ **WhatsApp Message Sent Successfully!**

**Recipient:** ${normalized}
**Message Length:** ${body.length} characters
**Message SID:** ${message.sid}
**Status:** ${message.status}

---
💡 **Tips:**
- WhatsApp messages are free (only need Twilio WhatsApp setup)
- Response rates are typically higher than SMS
- Messages support emojis and formatting
- Monitor delivery in Twilio console`;
    } catch (error: any) {
      if (error.code === 21211) {
        return `❌ **Invalid Phone Number:** The WhatsApp number format is invalid.`;
      }

      if (error.message?.includes('not a valid')) {
        return `❌ **Invalid Recipient:** This number is not registered for WhatsApp.`;
      }

      if (error.message?.includes('timeout')) {
        return '❌ **Timeout Error:** Message delivery took too long. Please try again.';
      }

      return `❌ **WhatsApp Error:** ${error.message || 'Unknown error occurred'}`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.sendWhatsappSchema;
  }
}
