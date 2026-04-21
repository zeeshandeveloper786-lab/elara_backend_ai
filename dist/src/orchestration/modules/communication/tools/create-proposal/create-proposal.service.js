"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProposalService = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const prisma_client_1 = require("../../../../../prisma-client");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const http_client_1 = require("../../../../utils/http-client");
let CreateProposalService = class CreateProposalService {
    createProposalSchema = zod_1.z.object({
        prospect_id: zod_1.z
            .string()
            .optional()
            .describe('Unique identifier for the prospect'),
        prospect_name: zod_1.z
            .string()
            .optional()
            .describe('Name of the prospect or client'),
        content: zod_1.z.string().optional().describe('Custom proposal content'),
        title: zod_1.z
            .string()
            .optional()
            .default('Business Proposal')
            .describe('Proposal title'),
        news_query: zod_1.z
            .string()
            .optional()
            .describe('Search query to auto-fill proposal with market news'),
    });
    async execute(input, state) {
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
                    const tavilyRes = await (0, http_client_1.httpPost)('https://api.tavily.com/search', {
                        api_key: tavilyApiKey,
                        query: news_query,
                        search_depth: 'basic',
                        max_results: 5,
                    }, {
                        timeout: 15000,
                    });
                    const results = tavilyRes.data?.results || [];
                    if (results.length === 0) {
                        finalContent = `**Market Update: ${news_query}**\n\nNo specific recent news found for this topic.`;
                    }
                    else {
                        finalContent =
                            `**Market Intelligence Report: ${news_query}**\n\nGenerated on ${new Date().toLocaleDateString()}\n\n` +
                                results
                                    .map((r, index) => `**${index + 1}. ${r.title || 'Untitled'}**\n${r.snippet || r.content || 'No description available'}`)
                                    .join('\n\n---\n\n');
                    }
                }
                catch (newsError) {
                    if (newsError.response?.status === 401 ||
                        newsError.response?.status === 403) {
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
            const storagePath = path.resolve(process.env.PROPOSAL_STORAGE_PATH || './storage/proposals');
            try {
                await fs.promises.access(storagePath);
            }
            catch {
                await fs.promises.mkdir(storagePath, { recursive: true });
            }
            const timestamp = Date.now();
            const sanitizedProspectName = (prospect_name || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Proposal_${sanitizedProspectName}_${timestamp}.pdf`;
            const fullPath = path.join(storagePath, fileName);
            const doc = new pdfkit_1.default({
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
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', (err) => reject(err));
            });
            await prisma_client_1.prisma.communicationLog.create({
                data: {
                    type: 'Proposal',
                    status: 'Created',
                    content: sanitizedTitle,
                    recipient: prospect_name || 'Unknown',
                    user_id,
                    company_id: company_id || null,
                    campaign_id: campaign_id || null,
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
        }
        catch (error) {
            return `❌ **Error:** ${error.message || 'Unknown error occurred'}`;
        }
    }
    getSchema() {
        return this.createProposalSchema;
    }
};
exports.CreateProposalService = CreateProposalService;
exports.CreateProposalService = CreateProposalService = __decorate([
    (0, common_1.Injectable)()
], CreateProposalService);
//# sourceMappingURL=create-proposal.service.js.map