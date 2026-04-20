import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import OpenAI from 'openai';

@Injectable()
export class GenerateMediaService {
  private readonly generateMediaSchema = z.object({
    prompt: z
      .string()
      .min(10)
      .max(1000)
      .describe(
        'Detailed visual description for the image (10-1000 characters)',
      ),
    size: z
      .enum(['1024x1024', '1792x1024'])
      .default('1024x1024')
      .describe('The size of the generated image'),
    style: z
      .enum(['natural', 'vivid'])
      .default('vivid')
      .describe('The style of the generated image'),
  });

  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: (process.env.OPENAI_API_KEY || '').replace(/"/g, '').trim(),
    });
  }

  /**
   * Get the Zod schema for this tool
   */
  getSchema() {
    return this.generateMediaSchema;
  }

  /**
   * Generate an image using OpenAI DALL-E 3
   */
  async execute(input: any, state: any): Promise<string> {
    const { prompt, size = '1024x1024', style = 'vivid' } = input;
    const { user_id } = state;

    console.log(
      `🚀 [TOOL STARTED] generate_image - Params: ${JSON.stringify({ prompt, size, style })} - User: ${user_id}`,
    );

    if (!user_id) {
      return '❌ **Authentication Error:** User context is missing. Please log in again.';
    }

    if (!process.env.OPENAI_API_KEY) {
      return '❌ **Configuration Error:** OPENAI_API_KEY is missing in environment variables.';
    }

    try {
      console.log(`🎨 [generate_image] Calling OpenAI DALL-E 3 API...`);

      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: size as any,
        style: style as any,
        quality: 'standard',
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned from OpenAI');
      }

      console.log(`💾 [generate_image] Saving record to database...`);
      const record = await prisma.imageGeneration.create({
        data: {
          prompt,
          imageUrl,
          size,
          style,
          user_id,
        },
      });

      console.log(`✅ [generate_image] Image generated and saved. ID: ${record.id}`);

      return `✅ **Image Generated Successfully!**

**ID:** ${record.id}
**Prompt:** ${prompt}
**Size:** ${size}
**Style:** ${style}

**Image URL:** ${imageUrl}

---
💡 You can use this URL to view or download the image. The record has been saved to your account.`;
    } catch (error: any) {
      console.error('❌ [generate_image] Error:', error);
      return `❌ **Error generating image:** ${error.message || 'Unknown error occurred'}. Please check your OpenAI API key and quota.`;
    }
  }
}
