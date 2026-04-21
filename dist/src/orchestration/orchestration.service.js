"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OrchestrationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrchestrationService = void 0;
const common_1 = require("@nestjs/common");
const prebuilt_1 = require("@langchain/langgraph/prebuilt");
const langgraph_1 = require("@langchain/langgraph");
const messages_1 = require("@langchain/core/messages");
const config_1 = require("@nestjs/config");
const scrpy_state_model_1 = require("./models/scrpy-state.model");
const scripy_supervisor_1 = require("./modules/main/supervisor/scripy.supervisor");
const general_agent_1 = require("./modules/main/agent/general.agent");
const lead_enrichment_supervisor_1 = require("./modules/leads/supervisor/lead-enrichment.supervisor");
const lead_enrichment_agent_1 = require("./modules/leads/agent/lead-enrichment.agent");
const system_insight_supervisor_1 = require("./modules/system/supervisor/system-insight.supervisor");
const system_insight_agent_1 = require("./modules/system/agent/system-insight.agent");
const user_insights_supervisor_1 = require("./modules/users/supervisor/user-insights.supervisor");
const user_insight_agent_1 = require("./modules/users/agent/user-insight.agent");
const communication_proposal_supervisor_1 = require("./modules/communication/supervisor/communication-proposal.supervisor");
const communication_proposal_agent_1 = require("./modules/communication/agent/communication-proposal.agent");
const campaign_supervisor_1 = require("./modules/campaigns/supervisor/campaign.supervisor");
const campaign_agent_1 = require("./modules/campaigns/agent/campaign.agent");
const media_generator_supervisor_1 = require("./modules/media/supervisor/media-generator.supervisor");
const media_generator_agent_1 = require("./modules/media/agent/media-generator.agent");
const ads_content_generator_supervisor_1 = require("./modules/ads/supervisor/ads-content-generator.supervisor");
const ads_content_agent_1 = require("./modules/ads/agent/ads-content.agent");
const leads_tools_1 = require("./modules/leads/tools/leads.tools");
const system_tools_1 = require("./modules/system/tools/system.tools");
const users_tools_1 = require("./modules/users/tools/users.tools");
const communication_tools_1 = require("./modules/communication/tools/communication.tools");
const campaigns_tools_1 = require("./modules/campaigns/tools/campaigns.tools");
const media_tools_1 = require("./modules/media/tools/media.tools");
const ads_tools_1 = require("./modules/ads/tools/ads.tools");
const openai_model_1 = require("./AI-model/openai-model");
const prisma_client_1 = require("../prisma-client");
let OrchestrationService = OrchestrationService_1 = class OrchestrationService {
    configService;
    scripySupervisor;
    generalAgent;
    leadSupervisor;
    leadAgent;
    systemSupervisor;
    systemAgent;
    userSupervisor;
    userAgent;
    commSupervisor;
    commAgent;
    campaignSupervisor;
    campaignAgent;
    mediaSupervisor;
    mediaAgent;
    adsSupervisor;
    adsAgent;
    logger = new common_1.Logger(OrchestrationService_1.name);
    model;
    graph;
    toolExecutorNodes = {};
    constructor(configService, scripySupervisor, generalAgent, leadSupervisor, leadAgent, systemSupervisor, systemAgent, userSupervisor, userAgent, commSupervisor, commAgent, campaignSupervisor, campaignAgent, mediaSupervisor, mediaAgent, adsSupervisor, adsAgent) {
        this.configService = configService;
        this.scripySupervisor = scripySupervisor;
        this.generalAgent = generalAgent;
        this.leadSupervisor = leadSupervisor;
        this.leadAgent = leadAgent;
        this.systemSupervisor = systemSupervisor;
        this.systemAgent = systemAgent;
        this.userSupervisor = userSupervisor;
        this.userAgent = userAgent;
        this.commSupervisor = commSupervisor;
        this.commAgent = commAgent;
        this.campaignSupervisor = campaignSupervisor;
        this.campaignAgent = campaignAgent;
        this.mediaSupervisor = mediaSupervisor;
        this.mediaAgent = mediaAgent;
        this.adsSupervisor = adsSupervisor;
        this.adsAgent = adsAgent;
        this.model = (0, openai_model_1.createModel)();
        this.toolExecutorNodes = {
            LeadEnrichmentAgent: new prebuilt_1.ToolNode(leads_tools_1.leadsTools),
            SystemInsightAgent: new prebuilt_1.ToolNode(system_tools_1.systemTools),
            UserInsightAgent: new prebuilt_1.ToolNode(users_tools_1.userTools),
            CommunicationAgent: new prebuilt_1.ToolNode(communication_tools_1.communicationTools),
            CampaignAgent: new prebuilt_1.ToolNode(campaigns_tools_1.campaignsTools),
            MediaAgent: new prebuilt_1.ToolNode(media_tools_1.mediaTools),
            AdsContentAgent: new prebuilt_1.ToolNode(ads_tools_1.adsTools),
        };
        if (this.model) {
            this.graph = this.createGraph();
        }
        else {
            this.logger.warn('AI Model could not be initialized. Graph orchestration will be disabled.');
        }
    }
    ScrpyStateAnnotation = langgraph_1.Annotation.Root({
        messages: (0, langgraph_1.Annotation)({
            reducer: (x, y) => {
                const combined = x.concat(y);
                if (combined.length > 45) {
                    return [combined[0], ...combined.slice(-44)];
                }
                return combined;
            },
        }),
        next: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        sender: (0, langgraph_1.Annotation)(),
        job_id: (0, langgraph_1.Annotation)(),
        user_id: (0, langgraph_1.Annotation)(),
        user_name: (0, langgraph_1.Annotation)(),
        authorization: (0, langgraph_1.Annotation)(),
        company_id: (0, langgraph_1.Annotation)(),
        campaign_id: (0, langgraph_1.Annotation)(),
        user_request: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        reasoning: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        analysis: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        tasks: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        task_cursor: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        task_summaries: (0, langgraph_1.Annotation)({
            reducer: (x, y) => (x || []).concat(y || []),
        }),
        current_task: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        memory: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        tool_history: (0, langgraph_1.Annotation)({ reducer: (x, y) => y || x }),
        conversation_summary: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        memory_to_save: (0, langgraph_1.Annotation)({ reducer: (_x, y) => y }),
        usage_stats: (0, langgraph_1.Annotation)({
            reducer: (x, y) => ({ ...x, ...y }),
        }),
        valid_companies: (0, langgraph_1.Annotation)({
            reducer: (x, y) => Array.from(new Set([...(x || []), ...(y || [])])).slice(-1000),
        }),
        lead_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        system_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        user_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        comm_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        campaign_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        ads_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
        media_supervisor_calls: (0, langgraph_1.Annotation)({
            reducer: (x, y) => y ?? x ?? 0,
        }),
    });
    createGraph() {
        const workflow = new langgraph_1.StateGraph(this.ScrpyStateAnnotation)
            .addNode(scrpy_state_model_1.SupervisorType.SCRIPY, (state) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.SCRIPY}`);
            return this.scripySupervisor.supervise(state);
        })
            .addNode(scrpy_state_model_1.SupervisorType.GENERAL, async (state) => {
            this.logger.log(`🤖 Agent: ${scrpy_state_model_1.SupervisorType.GENERAL}`);
            const result = await this.generalAgent.execute(state);
            return { ...result, sender: scrpy_state_model_1.SupervisorType.GENERAL };
        })
            .addNode(scrpy_state_model_1.SupervisorType.LEADS, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.LEADS}`);
            return this.leadSupervisor.supervise(s);
        })
            .addNode('LeadEnrichmentAgent', async (s) => {
            this.logger.log(`🤖 Agent: LeadEnrichmentAgent`);
            return {
                ...(await this.leadAgent.execute(s)),
                sender: 'LeadEnrichmentAgent',
            };
        })
            .addNode(scrpy_state_model_1.SupervisorType.SYSTEM, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.SYSTEM}`);
            return this.systemSupervisor.supervise(s);
        })
            .addNode('SystemInsightAgent', async (s) => {
            this.logger.log(`🤖 Agent: SystemInsightAgent`);
            return {
                ...(await this.systemAgent.execute(s)),
                sender: 'SystemInsightAgent',
            };
        })
            .addNode(scrpy_state_model_1.SupervisorType.USERS, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.USERS}`);
            return this.userSupervisor.supervise(s);
        })
            .addNode('UserInsightAgent', async (s) => {
            this.logger.log(`🤖 Agent: UserInsightAgent`);
            return {
                ...(await this.userAgent.execute(s)),
                sender: 'UserInsightAgent',
            };
        })
            .addNode(scrpy_state_model_1.SupervisorType.COMMUNICATION, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.COMMUNICATION}`);
            return this.commSupervisor.supervise(s);
        })
            .addNode('CommunicationAgent', async (s) => {
            this.logger.log(`🤖 Agent: CommunicationAgent`);
            return {
                ...(await this.commAgent.execute(s)),
                sender: 'CommunicationAgent',
            };
        })
            .addNode(scrpy_state_model_1.SupervisorType.CAMPAIGN, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.CAMPAIGN}`);
            return this.campaignSupervisor.supervise(s);
        })
            .addNode('CampaignAgent', async (s) => {
            this.logger.log(`🤖 Agent: CampaignAgent`);
            return {
                ...(await this.campaignAgent.execute(s)),
                sender: 'CampaignAgent',
            };
        })
            .addNode(scrpy_state_model_1.SupervisorType.MEDIA, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.MEDIA}`);
            return this.mediaSupervisor.supervise(s);
        })
            .addNode('MediaAgent', async (s) => {
            this.logger.log(`🤖 Agent: MediaAgent`);
            return { ...(await this.mediaAgent.execute(s)), sender: 'MediaAgent' };
        })
            .addNode(scrpy_state_model_1.SupervisorType.ADS, (s) => {
            this.logger.log(`🎯 Supervisor: ${scrpy_state_model_1.SupervisorType.ADS}`);
            return this.adsSupervisor.supervise(s);
        })
            .addNode('AdsContentAgent', async (s) => {
            this.logger.log(`🤖 Agent: AdsContentAgent`);
            return {
                ...(await this.adsAgent.execute(s)),
                sender: 'AdsContentAgent',
            };
        })
            .addNode('tools', async (state) => {
            const sender = state.sender || 'Unknown Agent';
            this.logger.log(`🛠️ Tool Node running for: ${sender}`);
            const lastMessage = state.messages.at(-1);
            const toolCalls = lastMessage &&
                'tool_calls' in lastMessage &&
                Array.isArray(lastMessage.tool_calls)
                ? lastMessage.tool_calls
                : [];
            if (toolCalls.length === 0) {
                return state;
            }
            const startTime = Date.now();
            const executor = this.toolExecutorNodes[sender];
            if (!executor) {
                throw new Error(`No tool executor found for sender: ${sender}`);
            }
            const result = await executor.invoke(state, {
                configurable: { state },
            });
            const duration = Date.now() - startTime;
            const toolHistoryEntries = await Promise.all(toolCalls.map(async (tc) => {
                try {
                    const toolMsg = result.messages?.find((m) => 'tool_call_id' in m && m.tool_call_id === tc.id);
                    const content = toolMsg ? String(toolMsg.content) : '';
                    let status = 'success';
                    if (content.includes('❌')) {
                        status = 'failed';
                    }
                    await prisma_client_1.prisma.toolLog.create({
                        data: {
                            tool_name: tc.name,
                            input: tc.args || {},
                            status: status,
                            execution_time: duration,
                            user_id: state.user_id,
                        },
                    });
                    return `\n- ${tc.name}: ${status} (${content.slice(0, 100)}...)`;
                }
                catch {
                    this.logger.warn(`Failed to log tool: ${tc.name}`);
                    return `\n- ${tc.name}: error`;
                }
            }));
            const updatedToolHistory = (state.tool_history || '') + toolHistoryEntries.join('');
            return {
                ...result,
                tool_history: updatedToolHistory,
            };
        });
        workflow.addEdge(langgraph_1.START, scrpy_state_model_1.SupervisorType.SCRIPY);
        workflow.addConditionalEdges(scrpy_state_model_1.SupervisorType.SCRIPY, (state) => {
            const route = state.next;
            if (!route || route === 'FINISH')
                return langgraph_1.END;
            return route;
        });
        const specialists = [
            { s: scrpy_state_model_1.SupervisorType.LEADS, a: 'LeadEnrichmentAgent' },
            { s: scrpy_state_model_1.SupervisorType.SYSTEM, a: 'SystemInsightAgent' },
            { s: scrpy_state_model_1.SupervisorType.USERS, a: 'UserInsightAgent' },
            { s: scrpy_state_model_1.SupervisorType.COMMUNICATION, a: 'CommunicationAgent' },
            { s: scrpy_state_model_1.SupervisorType.CAMPAIGN, a: 'CampaignAgent' },
            { s: scrpy_state_model_1.SupervisorType.MEDIA, a: 'MediaAgent' },
            { s: scrpy_state_model_1.SupervisorType.ADS, a: 'AdsContentAgent' },
        ];
        specialists.forEach(({ s, a }) => {
            workflow.addConditionalEdges(s, (state) => state.next === scrpy_state_model_1.SupervisorType.SCRIPY || state.next === 'FINISH'
                ? scrpy_state_model_1.SupervisorType.SCRIPY
                : a);
            workflow.addConditionalEdges(a, (state) => {
                const lastMsg = state.messages.at(-1);
                return lastMsg?.tool_calls?.length ? 'tools' : scrpy_state_model_1.SupervisorType.SCRIPY;
            });
        });
        workflow.addConditionalEdges(scrpy_state_model_1.SupervisorType.GENERAL, (state) => {
            const lastMsg = state.messages.at(-1);
            return lastMsg?.tool_calls?.length ? 'tools' : langgraph_1.END;
        });
        workflow.addConditionalEdges('tools', (state) => state.sender || scrpy_state_model_1.SupervisorType.SCRIPY);
        return workflow.compile();
    }
    async runOrchestration(input) {
        if (!this.graph) {
            throw new Error('AI Orchestration is currently unavailable (API Key missing or invalid).');
        }
        try {
            const currentMessages = (input.messages || []).map((m) => m.role === 'user'
                ? new messages_1.HumanMessage(m.content)
                : new messages_1.AIMessage(m.content));
            let historicalMessages = [];
            let memoryContext = '';
            let conversationSummary = '';
            let toolHistory = '';
            if (input.user_id) {
                const historyTake = currentMessages.length === 0 ? 30 : 15;
                const history = await prisma_client_1.prisma.message.findMany({
                    where: { user_id: input.user_id },
                    orderBy: { createdAt: 'desc' },
                    take: historyTake,
                });
                historicalMessages = history
                    .reverse()
                    .map((m) => m.role === 'human'
                    ? new messages_1.HumanMessage(m.content)
                    : new messages_1.AIMessage(m.content));
                const [sum, mems, logs] = await Promise.all([
                    prisma_client_1.prisma.conversationSummary.findFirst({
                        where: { user_id: input.user_id },
                        orderBy: { createdAt: 'desc' },
                    }),
                    prisma_client_1.prisma.memory.findMany({
                        where: { user_id: input.user_id },
                        take: 5,
                    }),
                    prisma_client_1.prisma.toolLog.findMany({
                        where: { user_id: input.user_id },
                        orderBy: { createdAt: 'desc' },
                        take: 5,
                    }),
                ]);
                conversationSummary = sum?.summary || 'Fresh session.';
                memoryContext = mems
                    .map((m) => `[${m.type}] ${m.key}: ${m.value}`)
                    .join('\n');
                toolHistory = logs
                    .map((t) => `${t.tool_name} (${t.status})`)
                    .join(', ');
            }
            const state = {
                messages: currentMessages.length === 0
                    ? historicalMessages
                    : [...historicalMessages, ...currentMessages],
                user_id: input.user_id,
                user_name: input.user_name,
                authorization: input.authorization,
                usage_stats: {},
                valid_companies: [],
                tasks: [],
                task_cursor: 0,
                task_summaries: [],
                memory: memoryContext,
                conversation_summary: conversationSummary,
                tool_history: toolHistory,
            };
            const result = await this.graph.invoke(state, {
                recursionLimit: 15,
            });
            const lastMsg = result.messages.at(-1);
            if (!lastMsg ||
                !lastMsg.content ||
                String(lastMsg.content).trim().length === 0) {
                this.logger.warn('Empty response detected from graph. Applying fallback.');
                const fallback = new messages_1.AIMessage("I've analyzed your situation, but I cannot provide a specific action right now. Please tell me more about what you'd like to achieve.");
                result.messages.push(fallback);
            }
            const newMessages = result.messages.slice(state.messages?.length || 0);
            if (input.user_id) {
                await Promise.all(newMessages
                    .filter((msg) => msg instanceof messages_1.HumanMessage || msg instanceof messages_1.AIMessage)
                    .map((msg) => prisma_client_1.prisma.message.create({
                    data: {
                        role: msg instanceof messages_1.HumanMessage ? 'human' : 'ai',
                        content: String(msg.content),
                        user_id: input.user_id,
                    },
                })));
            }
            if (input.user_id && result.memory_to_save?.length) {
                await Promise.all(result.memory_to_save.map((mem) => prisma_client_1.prisma.memory
                    .upsert({
                    where: {
                        user_id_key: {
                            user_id: input.user_id,
                            key: mem.key,
                        },
                    },
                    update: { value: mem.value, type: mem.type },
                    create: {
                        user_id: input.user_id,
                        key: mem.key,
                        value: mem.value,
                        type: mem.type,
                    },
                })
                    .catch((e) => {
                    this.logger.error(`Memory Persist Error: ${e.message}`);
                })));
            }
            if (input.user_id && result.messages.length > 15 && this.model) {
                const clearHistory = result.messages
                    .filter((m) => m instanceof messages_1.HumanMessage ||
                    (m instanceof messages_1.AIMessage && !m.tool_calls?.length))
                    .slice(-6)
                    .map((m) => `${m instanceof messages_1.HumanMessage ? 'User' : 'Elara'}: ${String(m.content)}`)
                    .join('\n');
                const summaryPrompt = `Summarize the current progress of this conversation in 2 concise sentences.
         Focus on what the user wanted and what Elara has achieved so far.
         Previous Summary: ${result.conversation_summary}
         Recent Significant Exchange:
         ${clearHistory}`;
                try {
                    const summaryMsg = await this.model.invoke([
                        new messages_1.SystemMessage(summaryPrompt),
                    ]);
                    await prisma_client_1.prisma.conversationSummary
                        .upsert({
                        where: { user_id: input.user_id },
                        update: { summary: String(summaryMsg.content) },
                        create: {
                            user_id: input.user_id,
                            summary: String(summaryMsg.content),
                        },
                    })
                        .catch((e) => this.logger.error(`Summary Persist Error: ${e.message}`));
                }
                catch (error) {
                    this.logger.warn(`Summary generation failed: ${error.message}`);
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error(`Orchestration Failed: ${error.message}`);
            if (error.response) {
                this.logger.error(`Status: ${error.response.status}`);
                try {
                    this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
                }
                catch {
                    this.logger.error(`Data: [Circular reference or unserializable data]`);
                }
            }
            if (error.message?.includes('400')) {
                this.logger.error(`❌ 400 Error - Possible causes:`);
                this.logger.error(`   1. Invalid OpenRouter API key`);
                this.logger.error(`   2. Invalid model name format`);
                this.logger.error(`   3. Missing HTTP-Referer header`);
                this.logger.error(`   4. Request format issue`);
            }
            throw error;
        }
    }
};
exports.OrchestrationService = OrchestrationService;
exports.OrchestrationService = OrchestrationService = OrchestrationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        scripy_supervisor_1.ScripySupervisorService,
        general_agent_1.GeneralAgentService,
        lead_enrichment_supervisor_1.LeadEnrichmentSupervisorService,
        lead_enrichment_agent_1.LeadEnrichmentAgentService,
        system_insight_supervisor_1.SystemInsightSupervisorService,
        system_insight_agent_1.SystemInsightAgentService,
        user_insights_supervisor_1.UserInsightsSupervisorService,
        user_insight_agent_1.UserInsightAgentService,
        communication_proposal_supervisor_1.CommunicationProposalSupervisorService,
        communication_proposal_agent_1.CommunicationProposalAgentService,
        campaign_supervisor_1.CampaignSupervisorService,
        campaign_agent_1.CampaignAgentService,
        media_generator_supervisor_1.MediaGeneratorSupervisorService,
        media_generator_agent_1.MediaGeneratorAgentService,
        ads_content_generator_supervisor_1.AdsContentGeneratorSupervisorService,
        ads_content_agent_1.AdsContentAgentService])
], OrchestrationService);
//# sourceMappingURL=orchestration.service.js.map