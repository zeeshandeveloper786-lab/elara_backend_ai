import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SystemMessage } from '@langchain/core/messages';
import { prisma } from '../../../../../prisma-client';

@Injectable()
export class GenerateAdContentService {
  private readonly generateAdContentSchema = z.object({
    platform: z
      .enum(['Facebook', 'Instagram', 'LinkedIn', 'Google Ads', 'Twitter'])
      .describe('The advertising platform to optimize the ad for'),
    core_message: z
      .string()
      .min(10, 'Core message must be at least 10 characters')
      .max(1000, 'Core message must not exceed 1000 characters')
      .describe('The main offer, product info, or value proposition'),
    target_audience: z
      .string()
      .optional()
      .describe(
        'Target audience description (e.g., "B2B SaaS founders", "E-commerce store owners")',
      ),
    ad_title: z
      .string()
      .optional()
      .describe('Custom title for the ad (defaults to platform + date)'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  /**
   * Get the Zod schema for this tool
   */
  getSchema() {
    return this.generateAdContentSchema;
  }

  /**
   * Generate platform-optimized ad content
   */
  async execute(
    { platform, core_message, target_audience, ad_title },
    state: any,
  ) {
    console.log(
      `🚀 [TOOL STARTED] generate_ad_content - Params: ${JSON.stringify({ platform, core_message, target_audience, ad_title })} - User: ${state.user_id}`,
    );
    const { user_id, company_id, campaign_id } = state;

    console.log(
      `🚀 [TOOL STARTED] generate_ad_content - Platform: ${platform} - User: ${user_id}`,
    );
    console.log(
      `📣 [generate_ad_content] Starting ad generation for platform: ${platform}`,
    );

    // Redundant user_id check removed (handled by tool-wrapper)

    // 2. Validate core_message
    if (!core_message || core_message.trim().length === 0) {
      console.warn('❌ [generate_ad_content] Empty core_message provided');
      return '❌ Error: core_message cannot be empty. Please provide the main offer or product information.';
    }

    // 3. Validate message length (reasonable limits)
    if (core_message.length > 1000) {
      console.warn('❌ [generate_ad_content] core_message too long');
      return '❌ Error: core_message is too long (max 1000 characters). Please provide a concise description.';
    }

    try {
      // 4. Platform-specific character limits and guidelines
      const platformGuidelines = {
        Facebook: {
          headlineMax: 40,
          bodyMax: 125,
          ctaStyle: 'action-oriented',
        },
        Instagram: {
          headlineMax: 30,
          bodyMax: 125,
          ctaStyle: 'casual and engaging',
        },
        LinkedIn: {
          headlineMax: 70,
          bodyMax: 150,
          ctaStyle: 'professional and value-driven',
        },
        'Google Ads': {
          headlineMax: 30,
          bodyMax: 90,
          ctaStyle: 'direct and clear',
        },
        Twitter: {
          headlineMax: 280,
          bodyMax: 280,
          ctaStyle: 'concise and punchy',
        },
      };

      const guidelines = platformGuidelines[platform];

      // 5. Enhanced copywriting prompt with platform-specific guidelines
      const copywriterPrompt = `You are an expert copywriter specializing in ${platform} advertising.

**Task:** Create a high-converting ad for ${platform}.

**Product/Offer:** ${core_message}
**Target Audience:** ${target_audience || 'General audience'}

**Platform Guidelines for ${platform}:**
- Headline: Maximum ${guidelines.headlineMax} characters
- Body: Maximum ${guidelines.bodyMax} characters
- CTA Style: ${guidelines.ctaStyle}

**Requirements:**
1. Write a compelling headline that grabs attention
2. Create persuasive body copy that highlights benefits
3. Include a clear call-to-action (CTA)
4. Use emotional triggers and urgency where appropriate
5. Match the tone and style of ${platform}

**Output Format:**
Headline: [Your catchy headline here]
Body: [Your persuasive copy here]
CTA: [Your call-to-action here]

**Important:** Stay within character limits and make every word count!`;

      console.log(
        `🤖 [generate_ad_content] Invoking AI model for ${platform} ad generation`,
      );

      // 6. Generate ad content with AI
      const aiResponse = await this.chatModel.invoke([
        new SystemMessage(copywriterPrompt),
      ]);
      const content = String(aiResponse.content).trim();

      // 7. Validate AI response
      if (!content || content.length === 0) {
        console.error('❌ [generate_ad_content] AI returned empty content');
        return '❌ Error: AI failed to generate ad content. Please try again.';
      }

      // 8. Extract headline, body, and CTA from AI response (optional parsing)
      const hasStructure =
        content.includes('Headline:') &&
        content.includes('Body:') &&
        content.includes('CTA:');
      if (!hasStructure) {
        console.warn(
          '⚠️ [generate_ad_content] AI response missing expected structure',
        );
      }

      // 9. Save to database with proper error handling
      console.log(`💾 [generate_ad_content] Saving ad to database`);
      const ad = await prisma.adContent.create({
        data: {
          title:
            ad_title || `${platform} Ad - ${new Date().toLocaleDateString()}`,
          body: content,
          platform,
          campaign_id: campaign_id || null,
          company_id: company_id || null,
          user_id,
          status: 'draft',
        },
      });

      console.log(
        `✅ [generate_ad_content] Ad created successfully with ID: ${ad.id}`,
      );

      // 10. Return formatted success response (User-friendly, no technical details)
      return `✅ **Ad Generated Successfully for ${platform}!**

**Status:** Draft (Ready for Review)

---

**Generated Content:**

${content}

---

💡 **Next Steps:**
- Review and edit the ad content if needed
- Link to a campaign for tracking
- Change status to "active" when ready to publish`;
    } catch (error: any) {
      console.error('❌ [generate_ad_content] Error:', error);

      // Enhanced error handling with specific error types
      if (error.code === 'P2002') {
        return '❌ Database Error: Duplicate ad content detected. Please try with different parameters.';
      }

      if (error.message?.includes('timeout')) {
        return '❌ Timeout Error: AI model took too long to respond. Please try again.';
      }

      if (error.message?.includes('rate limit')) {
        return '❌ Rate Limit Error: Too many requests. Please wait a moment and try again.';
      }

      if (error.message?.includes('API key')) {
        return '❌ Configuration Error: AI service credentials are invalid. Please contact support.';
      }

      // Generic error fallback
      return `❌ Error generating ad content: ${error.message || 'Unknown error occurred'}. Please try again or contact support if the issue persists.`;
    }
  }
}
