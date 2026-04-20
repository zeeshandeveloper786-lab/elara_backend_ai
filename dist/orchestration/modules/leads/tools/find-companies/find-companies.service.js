"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindCompaniesService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const http_client_1 = require("../../../../utils/http-client");
let FindCompaniesService = class FindCompaniesService {
    findCompaniesSchema = zod_1.z.object({
        query: zod_1.z
            .string()
            .min(1, 'Query cannot be empty')
            .max(200, 'Query must not exceed 200 characters')
            .describe('Search query to find companies (e.g., "SaaS companies in California")'),
        quantity: zod_1.z
            .number()
            .min(1, 'Quantity must be at least 1')
            .max(20, 'Quantity must not exceed 20')
            .optional()
            .default(10)
            .describe('Number of companies to find (1-20)'),
    });
    async execute(input, state) {
        const { query, quantity } = input;
        const { user_id, campaign_id } = state;
        if (!query || query.trim().length === 0) {
            return '❌ **Validation Error:** Search query cannot be empty.';
        }
        if (query.length > 200) {
            return `❌ **Validation Error:** Query is too long (${query.length} characters). Maximum 200 characters.`;
        }
        const requestedQuantity = quantity || 10;
        if (requestedQuantity < 1 || requestedQuantity > 20) {
            return '❌ **Validation Error:** Quantity must be between 1 and 20.';
        }
        const apiKey = process.env.TAVILY_API_KEY?.trim();
        if (!apiKey) {
            return `❌ **Tavily Configuration Error**

Missing TAVILY_API_KEY in environment variables.

**Setup Instructions:**
1. Sign up at https://tavily.com/
2. Get your API key from the dashboard
3. Add to your .env file: TAVILY_API_KEY=your_api_key_here`;
        }
        try {
            const response = await (0, http_client_1.httpPost)('https://api.tavily.com/search', {
                api_key: apiKey,
                query: `${query} official business website`,
                max_results: requestedQuantity,
                search_depth: 'basic',
                include_domains: [],
                exclude_domains: [
                    'linkedin.com',
                    'facebook.com',
                    'twitter.com',
                    'instagram.com',
                ],
            }, {
                timeout: 15000,
            });
            const searchResults = response.data.results || [];
            if (searchResults.length === 0) {
                return `ℹ️ **No Results Found**

No companies found for query: "${query}"

**Suggestions:**
- Try a more specific search term
- Include location (e.g., "software companies in California")
- Use industry keywords (e.g., "SaaS", "manufacturing", "consulting")`;
            }
            const savedCompanies = [];
            const skippedCompanies = [];
            const duplicateCompanies = [];
            for (const result of searchResults) {
                try {
                    const url = new URL(result.url);
                    const domain = url.hostname.replace(/^www\./, '').toLowerCase();
                    const name = result.title.split(/[-|]/)[0].trim();
                    if (!domain || domain.length < 4) {
                        skippedCompanies.push({ name, reason: 'Invalid domain' });
                        continue;
                    }
                    const existingByName = await prisma_client_1.prisma.company.findFirst({
                        where: {
                            name: name,
                            user_id: user_id,
                            user: { is_deleted: false },
                        },
                    });
                    if (existingByName) {
                        duplicateCompanies.push({ name, domain: existingByName.domain });
                        continue;
                    }
                    const company = await prisma_client_1.prisma.company.upsert({
                        where: {
                            domain_user_id: {
                                domain,
                                user_id,
                            },
                        },
                        update: {
                            name,
                            updatedAt: new Date(),
                        },
                        create: {
                            name,
                            domain,
                            user_id,
                            ...(campaign_id
                                ? { campaigns: { connect: { id: campaign_id } } }
                                : {}),
                        },
                    });
                    const isNew = company.createdAt.getTime() === company.updatedAt.getTime();
                    if (!isNew) {
                        duplicateCompanies.push({ name, domain });
                    }
                    else {
                        savedCompanies.push(company);
                    }
                }
                catch {
                    skippedCompanies.push({ name: result.title, reason: 'Parse error' });
                    continue;
                }
            }
            if (savedCompanies.length === 0 && duplicateCompanies.length === 0) {
                return `⚠️ **No Valid Companies Found**

Searched for: "${query}"
Results returned: ${searchResults.length}
Skipped: ${skippedCompanies.length}`;
            }
            let response_text = `✅ **Company Discovery Complete**

📊 **Search Results:**
- **Query:** "${query}"
- **Found:** ${searchResults.length} results
- **Saved:** ${savedCompanies.length} new companies
${duplicateCompanies.length > 0 ? `- **Duplicates:** ${duplicateCompanies.length} already in database\n` : ''}${skippedCompanies.length > 0 ? `- **Skipped:** ${skippedCompanies.length} invalid entries\n` : ''}`;
            if (savedCompanies.length > 0) {
                const table = savedCompanies
                    .slice(0, 10)
                    .map((c) => `| ${c.name} | ${c.domain} |`)
                    .join('\n');
                response_text += `\n\n🏢 **New Companies Added (showing first 10):**

| Company Name | Domain |
| :----------- | :----- |
${table}
${savedCompanies.length > 10 ? `\n*(Plus ${savedCompanies.length - 10} more saved to your database)*` : ''}`;
            }
            if (duplicateCompanies.length > 0 && duplicateCompanies.length <= 5) {
                response_text += `\n\n⚠️ **Duplicates (Already in Database):**\n${duplicateCompanies.map((d) => `- ${d.name} (${d.domain})`).join('\n')}`;
            }
            response_text += `\n\n💡 **Next Steps:**
- Use \`start_enrichment_job\` to find contact details
- Use \`get_company_detail\` to view company information`;
            return response_text;
        }
        catch (error) {
            if (error.message?.includes('API key')) {
                return `❌ **Tavily API Error:** Invalid API key.`;
            }
            if (error.message?.includes('timeout')) {
                return `❌ **Timeout Error:** Search took too long. Please try again.`;
            }
            if (error.response?.status === 429) {
                return `❌ **Rate Limit Error:** Too many requests to Tavily API. Please wait and try again.`;
            }
            return `❌ **Search Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.findCompaniesSchema;
    }
};
exports.FindCompaniesService = FindCompaniesService;
exports.FindCompaniesService = FindCompaniesService = __decorate([
    (0, common_1.Injectable)()
], FindCompaniesService);
//# sourceMappingURL=find-companies.service.js.map