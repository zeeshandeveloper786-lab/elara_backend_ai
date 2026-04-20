import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '../../../../../prisma-client';
import { httpPost } from '../../../../utils/http-client';

@Injectable()
export class MarketResearchService {
  private readonly marketResearchSchema = z.object({
    query: z
      .string()
      .min(3, 'Query must be at least 3 characters')
      .max(200, 'Query must not exceed 200 characters')
      .describe(
        'The industry, product, or market to research (e.g., "AI SaaS for real estate", "sustainable fashion brands", "B2B fintech solutions")',
      ),
  });

  constructor(private chatModel: ChatOpenAI) {}

  /**
   * Get the Zod schema for this tool
   */
  getSchema() {
    return this.marketResearchSchema;
  }

  /**
   * Perform comprehensive market research using Tavily API and AI analysis
   */
  async execute({ query }, state: any) {
    console.log(
      `🚀 [TOOL STARTED] market_research - Params: ${JSON.stringify({ query })} - User: ${state.user_id}`,
    );
    const { user_id } = state;

    console.log(
      `🚀 [TOOL STARTED] market_research - Query: "${query}" - User: ${user_id}`,
    );
    console.log(`📊 [market_research] Starting research for query: "${query}"`);

    // Redundant user_id check removed (handled by tool-wrapper)

    // 2. Validate and sanitize query
    const sanitizedQuery = query.trim();
    if (sanitizedQuery.length < 3) {
      console.warn('❌ [market_research] Query too short');
      return '❌ Error: Search query must be at least 3 characters long.';
    }

    if (sanitizedQuery.length > 200) {
      console.warn('❌ [market_research] Query too long');
      return '❌ Error: Search query is too long (max 200 characters). Please be more concise.';
    }

    // 3. API Key Validation
    const tavilyApiKey = process.env.TAVILY_API_KEY?.trim();
    if (!tavilyApiKey) {
      console.error('❌ [market_research] TAVILY_API_KEY not configured');
      return '❌ Configuration Error: TAVILY_API_KEY is missing in environment variables. Please add it to your .env file.';
    }

    try {
      // 4. Scoped Query for Multi-tenant Safety & Cache Isolation
      const scopedQuery = `${user_id}::${sanitizedQuery.toLowerCase()}`;
      console.log(`🔍 [market_research] Scoped query: ${scopedQuery}`);

      // 5. Cache Check: Check if research already exists in database
      const existing = await prisma.marketResearch.findFirst({
        where: {
          user_id,
          user: { is_deleted: false },
          query: scopedQuery,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existing) {
        const cacheAge = Math.floor(
          (Date.now() - existing.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        );
        console.log(`🎯 [market_research] Cache hit! Age: ${cacheAge} days`);

        return `📊 **Cached Market Research for "${sanitizedQuery}"**
        
*Last updated: ${existing.createdAt.toLocaleDateString()} (${cacheAge} days ago)*

${existing.results}

---
💡 **Tip:** This is cached data. For fresh insights, try a more specific query or wait 30 days for auto-refresh.`;
      }

      // 6. External Search: Tavily API Call
      console.log(`🌐 [market_research] Fetching live data from Tavily API`);

      const tavilyResponse = await httpPost(
        'https://api.tavily.com/search',
        {
          api_key: tavilyApiKey,
          query: `${sanitizedQuery} latest market trends competitors audience pain points opportunities 2024 2025`,
          search_depth: 'advanced',
          max_results: 5,
          include_domains: [], // Can be customized for specific sources
          exclude_domains: [], // Can exclude unreliable sources
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000, // 30 second timeout
        },
      );

      // 7. Validate Tavily response
      if (!tavilyResponse.data || !tavilyResponse.data.results) {
        console.error('❌ [market_research] Invalid Tavily API response');
        return `❌ Search Error: Unable to fetch search results. Please try again later.`;
      }

      const results = tavilyResponse.data.results || [];

      if (results.length === 0) {
        console.warn(
          `⚠️ [market_research] No results found for: ${sanitizedQuery}`,
        );
        return `⚠️ No specific search results found for "${sanitizedQuery}". 

**Suggestions:**
- Try a broader topic (e.g., "SaaS marketing" instead of "SaaS marketing for dentists in NYC")
- Check spelling and try alternative keywords
- Use industry-standard terminology`;
      }

      // 8. Format search context with source attribution - trimmed to prevent context overflow
      const searchContext = results
        .map((item: any, index: number) => {
          const title = item.title || 'Untitled';
          const url = item.url || 'No URL';
          // Trim content to 1500 characters per source
          const rawContent =
            item.content || item.snippet || 'No content available';
          const content =
            rawContent.length > 1500
              ? rawContent.slice(0, 1500) + '...'
              : rawContent;

          return `**Source ${index + 1}: ${title}**
URL: ${url}
Content: ${content}`;
        })
        .join('\n\n---\n\n');

      console.log(
        `📄 [market_research] Collected ${results.length} sources, total length: ${searchContext.length} chars`,
      );

      // 9. AI Analysis: Transform raw data into actionable insights
      console.log(`🤖 [market_research] Invoking AI for analysis`);

      const analysisResponse = await this.chatModel.invoke([
        new SystemMessage(`You are a Senior Market Research Analyst with expertise in competitive intelligence and market trends.

**Task:** Analyze the provided search results and create a comprehensive, actionable market research report.

**Report Structure:**
1. 🚀 **Key Market Trends** - Current and emerging trends in this space
2. 🥊 **Competitive Landscape** - Major players, their strategies, and market positioning
3. 🎯 **Target Audience Insights** - Demographics, pain points, desires, and behaviors
4. 💡 **Marketing Angles** - Effective messaging strategies and ad copy ideas
5. 📊 **Market Opportunities** - Gaps, underserved segments, and growth areas
6. ⚠️ **Challenges & Risks** - Potential obstacles and market threats

**Guidelines:**
- Be specific and data-driven where possible
- Highlight actionable insights
- Use clear, professional language
- Include relevant statistics or facts from sources
- Keep the report concise but comprehensive (aim for 500-800 words)

**Important:** Base your analysis ONLY on the provided search data. Do not make up information.`),
        new HumanMessage(`**Research Query:** ${sanitizedQuery}

**Search Results:**

${searchContext}`),
      ]);

      const finalResult = String(analysisResponse.content).trim();

      // 10. Validate AI response
      if (!finalResult || finalResult.length < 100) {
        console.error('❌ [market_research] AI returned insufficient analysis');
        return `❌ Analysis Error: AI failed to generate comprehensive insights. Please try again.`;
      }

      // 11. Save to database for future caching
      console.log(`💾 [market_research] Saving research to database`);
      const savedResearch = await prisma.marketResearch.create({
        data: {
          query: scopedQuery,
          results: finalResult,
          user_id,
        },
      });

      console.log(
        `✅ [market_research] Research completed and saved (ID: ${savedResearch.id})`,
      );

      // 12. Return formatted success response
      return `📈 **Live Market Research Completed for "${sanitizedQuery}"**

${finalResult}

---

**Research Summary:**
- Sources Analyzed: ${results.length}
- Date: ${new Date().toLocaleDateString()}
- Status: Fresh data (cached for future use)

💡 **Next Steps:**
- Use these insights to create targeted ad campaigns
- Generate platform-specific ad content based on identified opportunities
- Monitor trends regularly for market changes`;
    } catch (error: any) {
      console.error('❌ [market_research] Error:', error);

      // Enhanced error handling with specific error types
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return '❌ Timeout Error: Search request took too long. Please try again with a more specific query.';
      }

      if (error.response?.status === 401 || error.response?.status === 403) {
        return '❌ Authentication Error: Invalid Tavily API key. Please check your configuration.';
      }

      if (error.response?.status === 429) {
        return '❌ Rate Limit Error: Too many search requests. Please wait a moment and try again.';
      }

      if (error.response?.status >= 500) {
        return '❌ Service Error: Tavily search service is temporarily unavailable. Please try again later.';
      }

      if (error.code === 'P2002') {
        return '❌ Database Error: Failed to save research results. Please try again.';
      }

      if (error.message?.includes('API key')) {
        return '❌ Configuration Error: AI service credentials are invalid. Please contact support.';
      }

      // Generic error fallback
      return `❌ Research Error: Unable to complete market research. ${error.message || 'Unknown error occurred'}. Please try again or contact support if the issue persists.`;
    }
  }
}
