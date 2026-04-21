import { Injectable, Logger } from '@nestjs/common';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { StateGraph, END, START, Annotation } from '@langchain/langgraph';
import {
  BaseMessage,
  HumanMessage,
  AIMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { ScrpyState, SupervisorType } from './models/scrpy-state.model';
import { GraphInputDto } from './dto/graph-input.dto';

// Agents & Supervisors Imports
import { ScripySupervisorService } from './modules/main/supervisor/scripy.supervisor';
import { GeneralAgentService } from './modules/main/agent/general.agent';
import { LeadEnrichmentSupervisorService } from './modules/leads/supervisor/lead-enrichment.supervisor';
import { LeadEnrichmentAgentService } from './modules/leads/agent/lead-enrichment.agent';
import { SystemInsightSupervisorService } from './modules/system/supervisor/system-insight.supervisor';
import { SystemInsightAgentService } from './modules/system/agent/system-insight.agent';
import { UserInsightsSupervisorService } from './modules/users/supervisor/user-insights.supervisor';
import { UserInsightAgentService } from './modules/users/agent/user-insight.agent';
import { CommunicationProposalSupervisorService } from './modules/communication/supervisor/communication-proposal.supervisor';
import { CommunicationProposalAgentService } from './modules/communication/agent/communication-proposal.agent';
import { CampaignSupervisorService } from './modules/campaigns/supervisor/campaign.supervisor';
import { CampaignAgentService } from './modules/campaigns/agent/campaign.agent';
import { MediaGeneratorSupervisorService } from './modules/media/supervisor/media-generator.supervisor';
import { MediaGeneratorAgentService } from './modules/media/agent/media-generator.agent';
import { AdsContentGeneratorSupervisorService } from './modules/ads/supervisor/ads-content-generator.supervisor';
import { AdsContentAgentService } from './modules/ads/agent/ads-content.agent';

// Tools Imports
import { leadsTools } from './modules/leads/tools/leads.tools';
import { systemTools } from './modules/system/tools/system.tools';
import { userTools } from './modules/users/tools/users.tools';
import { communicationTools } from './modules/communication/tools/communication.tools';
import { campaignsTools } from './modules/campaigns/tools/campaigns.tools';
import { mediaTools } from './modules/media/tools/media.tools';
import { adsTools } from './modules/ads/tools/ads.tools';

import { createModel } from './AI-model/openai-model';
import { prisma } from '../prisma-client';

@Injectable()
export class OrchestrationService {
  private readonly logger = new Logger(OrchestrationService.name);
  private model: ChatOpenAI | null;
  private graph: any;
  private toolExecutorNodes: Record<string, ToolNode> = {};

  constructor(
    private configService: ConfigService,
    private scripySupervisor: ScripySupervisorService,
    private generalAgent: GeneralAgentService,
    private leadSupervisor: LeadEnrichmentSupervisorService,
    private leadAgent: LeadEnrichmentAgentService,
    private systemSupervisor: SystemInsightSupervisorService,
    private systemAgent: SystemInsightAgentService,
    private userSupervisor: UserInsightsSupervisorService,
    private userAgent: UserInsightAgentService,
    private commSupervisor: CommunicationProposalSupervisorService,
    private commAgent: CommunicationProposalAgentService,
    private campaignSupervisor: CampaignSupervisorService,
    private campaignAgent: CampaignAgentService,
    private mediaSupervisor: MediaGeneratorSupervisorService,
    private mediaAgent: MediaGeneratorAgentService,
    private adsSupervisor: AdsContentGeneratorSupervisorService,
    private adsAgent: AdsContentAgentService,
  ) {
    this.model = createModel();

    // Tool Nodes Mapping
    this.toolExecutorNodes = {
      LeadEnrichmentAgent: new ToolNode(leadsTools),
      SystemInsightAgent: new ToolNode(systemTools),
      UserInsightAgent: new ToolNode(userTools),
      CommunicationAgent: new ToolNode(communicationTools),
      CampaignAgent: new ToolNode(campaignsTools),
      MediaAgent: new ToolNode(mediaTools),
      AdsContentAgent: new ToolNode(adsTools),
    };

    if (this.model) {
      this.graph = this.createGraph();
    } else {
      this.logger.warn(
        'AI Model could not be initialized. Graph orchestration will be disabled.',
      );
    }
  }

  private ScrpyStateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => {
        const combined = x.concat(y);
        // SMART REDUCER: Always preserve the FIRST message (initial user request)
        // and keep the last 40 messages for context.
        if (combined.length > 45) {
          return [combined[0], ...combined.slice(-44)];
        }
        return combined;
      },
    }),
    next: Annotation<SupervisorType | 'FINISH'>({ reducer: (_x, y) => y }),
    sender: Annotation<string>(),
    job_id: Annotation<string>(),
    user_id: Annotation<string>(),
    user_name: Annotation<string>(),
    authorization: Annotation<string>(),
    company_id: Annotation<string>(),
    campaign_id: Annotation<string>(),
    user_request: Annotation<string>({ reducer: (_x, y) => y }),
    reasoning: Annotation<string>({ reducer: (_x, y) => y }),
    analysis: Annotation<string>({ reducer: (_x, y) => y }),
    tasks: Annotation<any[]>({ reducer: (_x, y) => y }),
    task_cursor: Annotation<number>({ reducer: (_x, y) => y }),
    task_summaries: Annotation<string[]>({
      reducer: (x, y) => (x || []).concat(y || []),
    }),
    current_task: Annotation<string>({ reducer: (_x, y) => y }),
    memory: Annotation<string>({ reducer: (_x, y) => y }),
    tool_history: Annotation<string>({ reducer: (x, y) => y || x }),
    conversation_summary: Annotation<string>({ reducer: (_x, y) => y }),
    memory_to_save: Annotation<any[]>({ reducer: (_x, y) => y }),
    usage_stats: Annotation<Record<string, any>>({
      reducer: (x, y) => ({ ...x, ...y }),
    }),
    valid_companies: Annotation<string[]>({
      reducer: (x, y) =>
        Array.from(new Set([...(x || []), ...(y || [])])).slice(-1000),
    }),
    lead_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    system_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    user_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    comm_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    campaign_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    ads_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
    media_supervisor_calls: Annotation<number>({
      reducer: (x, y) => y ?? x ?? 0,
    }),
  });

  private createGraph() {
    const workflow = new StateGraph(this.ScrpyStateAnnotation)
      .addNode(SupervisorType.SCRIPY, (state) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.SCRIPY}`);
        return this.scripySupervisor.supervise(state);
      })
      .addNode(SupervisorType.GENERAL, async (state) => {
        this.logger.log(`🤖 Agent: ${SupervisorType.GENERAL}`);
        const result = await this.generalAgent.execute(state);
        return { ...result, sender: SupervisorType.GENERAL };
      })
      .addNode(SupervisorType.LEADS, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.LEADS}`);
        return this.leadSupervisor.supervise(s);
      })
      .addNode('LeadEnrichmentAgent', async (s) => {
        this.logger.log(`🤖 Agent: LeadEnrichmentAgent`);
        return {
          ...(await this.leadAgent.execute(s)),
          sender: 'LeadEnrichmentAgent',
        };
      })

      .addNode(SupervisorType.SYSTEM, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.SYSTEM}`);
        return this.systemSupervisor.supervise(s);
      })
      .addNode('SystemInsightAgent', async (s) => {
        this.logger.log(`🤖 Agent: SystemInsightAgent`);
        return {
          ...(await this.systemAgent.execute(s)),
          sender: 'SystemInsightAgent',
        };
      })

      .addNode(SupervisorType.USERS, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.USERS}`);
        return this.userSupervisor.supervise(s);
      })
      .addNode('UserInsightAgent', async (s) => {
        this.logger.log(`🤖 Agent: UserInsightAgent`);
        return {
          ...(await this.userAgent.execute(s)),
          sender: 'UserInsightAgent',
        };
      })

      .addNode(SupervisorType.COMMUNICATION, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.COMMUNICATION}`);
        return this.commSupervisor.supervise(s);
      })
      .addNode('CommunicationAgent', async (s) => {
        this.logger.log(`🤖 Agent: CommunicationAgent`);
        return {
          ...(await this.commAgent.execute(s)),
          sender: 'CommunicationAgent',
        };
      })

      .addNode(SupervisorType.CAMPAIGN, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.CAMPAIGN}`);
        return this.campaignSupervisor.supervise(s);
      })
      .addNode('CampaignAgent', async (s) => {
        this.logger.log(`🤖 Agent: CampaignAgent`);
        return {
          ...(await this.campaignAgent.execute(s)),
          sender: 'CampaignAgent',
        };
      })

      .addNode(SupervisorType.MEDIA, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.MEDIA}`);
        return this.mediaSupervisor.supervise(s);
      })
      .addNode('MediaAgent', async (s) => {
        this.logger.log(`🤖 Agent: MediaAgent`);
        return { ...(await this.mediaAgent.execute(s)), sender: 'MediaAgent' };
      })

      .addNode(SupervisorType.ADS, (s) => {
        this.logger.log(`🎯 Supervisor: ${SupervisorType.ADS}`);
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
        const toolCalls =
          lastMessage &&
          'tool_calls' in lastMessage &&
          Array.isArray(lastMessage.tool_calls)
            ? lastMessage.tool_calls
            : [];

        if (toolCalls.length === 0) {
          return state; // No tool calls, return state as-is
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

        // ✅ Persistent Logging with Real Status
        const toolHistoryEntries = await Promise.all(
          toolCalls.map(async (tc) => {
            try {
              const toolMsg = result.messages?.find(
                (m) => 'tool_call_id' in m && m.tool_call_id === tc.id,
              );
              const content = toolMsg ? String(toolMsg.content) : '';
              let status = 'success';
              if (content.includes('❌')) {
                status = 'failed';
              }

              await prisma.toolLog.create({
                data: {
                  tool_name: tc.name,
                  input: tc.args || {},
                  status: status,
                  execution_time: duration,
                  user_id: state.user_id,
                },
              });

              return `\n- ${tc.name}: ${status} (${content.slice(0, 100)}...)`;
            } catch {
              this.logger.warn(`Failed to log tool: ${tc.name}`);
              return `\n- ${tc.name}: error`;
            }
          }),
        );

        const updatedToolHistory = (state.tool_history || '') + toolHistoryEntries.join('');

        return {
          ...result,
          tool_history: updatedToolHistory,
        };
      });

    // Edges
    workflow.addEdge(START, SupervisorType.SCRIPY);

    workflow.addConditionalEdges(SupervisorType.SCRIPY, (state) => {
      const route = state.next;
      if (!route || route === 'FINISH') return END;
      return route;
    });

    // Mapping for specialists
    const specialists = [
      { s: SupervisorType.LEADS, a: 'LeadEnrichmentAgent' },
      { s: SupervisorType.SYSTEM, a: 'SystemInsightAgent' },
      { s: SupervisorType.USERS, a: 'UserInsightAgent' },
      { s: SupervisorType.COMMUNICATION, a: 'CommunicationAgent' },
      { s: SupervisorType.CAMPAIGN, a: 'CampaignAgent' },
      { s: SupervisorType.MEDIA, a: 'MediaAgent' },
      { s: SupervisorType.ADS, a: 'AdsContentAgent' },
    ];

    specialists.forEach(({ s, a }) => {
      workflow.addConditionalEdges(s, (state) =>
        state.next === SupervisorType.SCRIPY || state.next === 'FINISH'
          ? SupervisorType.SCRIPY
          : a,
      );
      workflow.addConditionalEdges(a as any, (state) => {
        const lastMsg = state.messages.at(-1) as AIMessage;
        return lastMsg?.tool_calls?.length ? 'tools' : SupervisorType.SCRIPY;
      });
    });

    workflow.addConditionalEdges(SupervisorType.GENERAL, (state) => {
      const lastMsg = state.messages.at(-1) as AIMessage;
      return lastMsg?.tool_calls?.length ? 'tools' : END;
    });

    workflow.addConditionalEdges(
      'tools',
      (state) => (state.sender as any) || SupervisorType.SCRIPY,
    );

    return workflow.compile();
  }

  /**
   * Main entry point for the orchestration graph.
   * Loads history, executes the graph, and saves the results.
   */
  async runOrchestration(input: GraphInputDto): Promise<ScrpyState> {
    if (!this.graph) {
      throw new Error(
        'AI Orchestration is currently unavailable (API Key missing or invalid).',
      );
    }
    try {
      const currentMessages: BaseMessage[] = (input.messages || []).map((m) =>
        m.role === 'user'
          ? new HumanMessage(m.content)
          : new AIMessage(m.content),
      );

      // 1. Load History & Memory from DB (Rule 7)
      let historicalMessages: BaseMessage[] = [];
      let memoryContext = '';
      let conversationSummary = '';
      let toolHistory = '';

      if (input.user_id) {
        // A. Reconstruction: Load more history if current input is thin
        const historyTake = currentMessages.length === 0 ? 30 : 15;
        const history = await prisma.message.findMany({
          where: { user_id: input.user_id },
          orderBy: { createdAt: 'desc' },
          take: historyTake,
        });

        historicalMessages = history
          .reverse()
          .map((m) =>
            m.role === 'human'
              ? new HumanMessage(m.content)
              : new AIMessage(m.content),
          );

        // B. Load Context (Summary, Memory, Tool Logs)
        const [sum, mems, logs] = await Promise.all([
          prisma.conversationSummary.findFirst({
            where: { user_id: input.user_id },
            orderBy: { createdAt: 'desc' },
          }),
          prisma.memory.findMany({
            where: { user_id: input.user_id },
            take: 5,
          }),
          prisma.toolLog.findMany({
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

      // 2. Initial State (Rule 7 Validation)
      const state: Partial<ScrpyState> = {
        messages:
          currentMessages.length === 0
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

      // 3. Invoke Graph with Output Safety (Rule 9)
      const result = await this.graph.invoke(state, {
        recursionLimit: 15, // Aggressively reduced for fast execution
      });

      // Fallback for Empty Response (Rule 9)
      const lastMsg = result.messages.at(-1);
      if (
        !lastMsg ||
        !lastMsg.content ||
        String(lastMsg.content).trim().length === 0
      ) {
        this.logger.warn(
          'Empty response detected from graph. Applying fallback.',
        );
        const fallback = new AIMessage(
          "I've analyzed your situation, but I cannot provide a specific action right now. Please tell me more about what you'd like to achieve.",
        );
        result.messages.push(fallback);
      }

      // 4. Save New Messages, Memories & Update Summary
      const newMessages = result.messages.slice(state.messages?.length || 0);
      if (input.user_id) {
        await Promise.all(
          newMessages
            .filter(
              (msg) =>
                msg instanceof HumanMessage || msg instanceof AIMessage,
            )
            .map((msg) =>
              prisma.message.create({
                data: {
                  role: msg instanceof HumanMessage ? 'human' : 'ai',
                  content: String(msg.content),
                  user_id: input.user_id,
                },
              }),
            ),
        );
      }

      // ✅ Save New Memories discovered by Scripy
      if (input.user_id && result.memory_to_save?.length) {
        await Promise.all(
          result.memory_to_save.map((mem) =>
            prisma.memory
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
              }),
          ),
        );
      }

      // ✅ Rolling Summarization Logic (Maintain 15-msg window)
      if (input.user_id && result.messages.length > 15 && this.model) {
        // Filter for significant messages only (skip technical noise)
        const clearHistory = result.messages
          .filter(
            (m) =>
              m instanceof HumanMessage ||
              (m instanceof AIMessage && !m.tool_calls?.length),
          )
          .slice(-6)
          .map(
            (m) =>
              `${m instanceof HumanMessage ? 'User' : 'Elara'}: ${String(m.content)}`,
          )
          .join('\n');

        const summaryPrompt = `Summarize the current progress of this conversation in 2 concise sentences.
         Focus on what the user wanted and what Elara has achieved so far.
         Previous Summary: ${result.conversation_summary}
         Recent Significant Exchange:
         ${clearHistory}`;

        try {
          const summaryMsg = await this.model.invoke([
            new SystemMessage(summaryPrompt),
          ]);

          // Consistent upsert to avoid race conditions and maintain one summary per user
          await prisma.conversationSummary
            .upsert({
              where: { user_id: input.user_id },
              update: { summary: String(summaryMsg.content) },
              create: {
                user_id: input.user_id,
                summary: String(summaryMsg.content),
              },
            })
            .catch((e) =>
              this.logger.error(`Summary Persist Error: ${e.message}`),
            );
        } catch (error) {
          this.logger.warn(`Summary generation failed: ${error.message}`);
        }
      }

      return result as ScrpyState;
    } catch (error: any) {
      this.logger.error(`Orchestration Failed: ${error.message}`);

      // Log detailed error information
      if (error.response) {
        this.logger.error(`Status: ${error.response.status}`);
        try {
          this.logger.error(`Data: ${JSON.stringify(error.response.data)}`);
        } catch {
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
}
