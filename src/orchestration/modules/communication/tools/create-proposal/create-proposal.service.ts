import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { prisma } from '../../../../../prisma-client';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { httpPost } from '../../../../utils/http-client';

@Injectable()
export class CreateProposalService {
  private readonly createProposalSchema = z.object({
    prospect_id: z
      .string()
      .optional()
      .describe('Unique identifier for the prospect'),
    prospect_name: z
      .string()
      .optional()
      .describe('Name of the prospect or client'),
    content: z.string().optional().describe('Custom proposal content'),
    title: z
      .string()
      .optional()
      .default('Business Proposal')
      .describe('Proposal title'),
    news_query: z
      .string()
      .optional()
      .describe('Search query to auto-fill proposal with market news'),
  });

  async execute(input: any, state: any): Promise<string> {
    const { prospect_name, content, title, news_query } = input;
    const { user_id, company_id, campaign_id } = state;

    if (!user_id) {
      return '❌ Error: User authentication required. Cannot create proposal without user context.';
    }

    if (!content && !news_query) {
      return `❌ Error: Proposal content cannot be empty. 

**Please provide ONE of the following:**
- \`content\`: Your custom proposal text
- \`news_query\`: A search query to auto-fill with market news`;
    }

    try {
      let finalContent = content || '';

      if (!finalContent && news_query) {
        const tavilyApiKey = process.env.TAVILY_API_KEY?.trim();
        if (!tavilyApiKey) {
          return `❌ Configuration Error: TAVILY_API_KEY is required for news-based proposals.`;
        }

        if (news_query.trim().length < 3) {
          return '❌ Error: news_query must be at least 3 characters long.';
        }

        if (news_query.length > 200) {
          return '❌ Error: news_query is too long (max 200 characters).';
        }

        try {
          const tavilyRes = await httpPost(
            'https://api.tavily.com/search',
            {
              api_key: tavilyApiKey,
              query: news_query,
              search_depth: 'basic',
              max_results: 5,
            },
            {
              timeout: 15000,
            },
          );

          const results = tavilyRes.data?.results || [];

          if (results.length === 0) {
            finalContent = `**Market Update: ${news_query}**\n\nNo specific recent news found for this topic.`;
          } else {
            finalContent =
              `**Market Intelligence Report: ${news_query}**\n\nGenerated on ${new Date().toLocaleDateString()}\n\n` +
              results
                .map(
                  (r: any, index: number) =>
                    `**${index + 1}. ${r.title || 'Untitled'}**\n${r.snippet || r.content || 'No description available'}`,
                )
                .join('\n\n---\n\n');
          }
        } catch (newsError: any) {
          if (
            newsError.response?.status === 401 ||
            newsError.response?.status === 403
          ) {
            return '❌ Authentication Error: Invalid Tavily API key.';
          }

          if (newsError.response?.status === 429) {
            return '❌ Rate Limit Error: Too many Tavily API requests.';
          }

          return `❌ News Fetch Error: ${newsError.message}. Please provide custom content instead.`;
        }
      }

      if (!finalContent || finalContent.trim().length === 0) {
        return '❌ Error: Proposal content cannot be empty.';
      }

      if (finalContent.length > 50000) {
        return '❌ Error: Proposal content is too long (max 50,000 characters).';
      }

      const sanitizedTitle = (title || 'Business Proposal').trim();
      if (sanitizedTitle.length > 200) {
        return '❌ Error: Proposal title is too long (max 200 characters).';
      }

      const storagePath = path.resolve(
        process.env.PROPOSAL_STORAGE_PATH || './storage/proposals',
      );

      try {
        await fs.promises.access(storagePath);
      } catch {
        await fs.promises.mkdir(storagePath, { recursive: true });
      }

      const timestamp = Date.now();
      const sanitizedProspectName = (prospect_name || 'Client').replace(
        /[^a-zA-Z0-9]/g,
        '_',
      );
      const fileName = `Proposal_${sanitizedProspectName}_${timestamp}.pdf`;
      const fullPath = path.join(storagePath, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      const stream = fs.createWriteStream(fullPath);
      doc.pipe(stream);

      doc
        .fontSize(28)
        .fillColor('#2c3e50')
        .text('BUSINESS PROPOSAL', { align: 'center' })
        .moveDown(0.5);

      doc
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .strokeColor('#3498db')
        .lineWidth(2)
        .stroke()
        .moveDown(1);

      doc
        .fontSize(12)
        .fillColor('#34495e')
        .text(`To: ${prospect_name || 'Valued Client'}`, { align: 'left' })
        .text(`Date: ${new Date().toLocaleDateString()}`, { align: 'left' })
        .text(`Prepared by: ${state.user_name || 'Elara AI'}`, {
          align: 'left',
        })
        .moveDown(1.5);

      doc
        .fontSize(20)
        .fillColor('#2c3e50')
        .text(sanitizedTitle, { align: 'center' })
        .moveDown(1.5);

      doc.fontSize(11).fillColor('#2c3e50').text(finalContent, {
        align: 'justify',
        lineGap: 4,
      });

      doc.end();

      await new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', (err) => reject(err));
      });

      await prisma.communicationLog.create({
        data: {
          type: 'Proposal',
          status: 'Created',
          content: sanitizedTitle,
          recipient: prospect_name || 'Unknown',
          user_id,
          company_id: (company_id as string) || null,
          campaign_id: (campaign_id as string) || null,
        },
      });

      return `✅ **Proposal Created Successfully!**

**File:** ${fileName}
**To:** ${prospect_name || 'Client'}
**Title:** ${sanitizedTitle}

---
💡 **Next Steps:**
- Download and review the PDF
- Share with prospect via email
- Track delivery and engagement`;
    } catch (error: any) {
      return `❌ **Error:** ${error.message || 'Unknown error occurred'}`;
    }
  }

  getSchema(): z.ZodSchema {
    return this.createProposalSchema;
  }
}
