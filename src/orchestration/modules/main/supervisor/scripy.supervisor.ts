import { Injectable } from '@nestjs/common';
import { SystemMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { SupervisorType, ScrpyState } from '../../../models/scrpy-state.model';

/**
 * NestJS Service for Scripy Supervisor
 * Responsible for routing user requests to appropriate specialist supervisors
 */
@Injectable()
export class ScripySupervisorService {
  private readonly autonomySchema = z.object({
    analysis: z
      .string()
      .describe(
        "A deep analysis of the user's current request and historical context.",
      ),
    reasoning: z
      .string()
      .describe(
        'Step-by-step reasoning for the chosen routing or planning decision.',
      ),
    plan: z
      .array(
        z.object({
          id: z.string().describe('Unique step ID (e.g., "step_1")'),
          supervisor: z.nativeEnum(SupervisorType),
          instruction: z.string().describe('Detailed instruction for this step'),
        }),
      )
      .optional()
      .describe(
        'A sequence of tasks if the request requires multiple specialists.',
      ),
    next: z.enum([
      SupervisorType.GENERAL,
      SupervisorType.LEADS,
      SupervisorType.COMMUNICATION,
      SupervisorType.SYSTEM,
      SupervisorType.USERS,
      SupervisorType.CAMPAIGN,
      SupervisorType.MEDIA,
      SupervisorType.ADS,
      'FINISH',
    ]),
    instruction: z
      .string()
      .optional()
      .describe('Specific instruction for the immediate next supervisor.'),
    memory_to_save: z
      .array(
        z.object({
          key: z.string(),
          value: z.string(),
          type: z.enum(['fact', 'preference', 'insight', 'project_context']),
        }),
      )
      .optional()
      .describe('Valuable insights to persist for future reference.'),
  });

  constructor(private chatModel: ChatOpenAI) {}

  /**
   * Main master supervisor - acts as the brain of the ecosystem
   */
  async supervise(state: ScrpyState): Promise<Partial<ScrpyState>> {
    const lastMessage = state.messages.at(-1);
    const userRequest =
      state.user_request ||
      (lastMessage instanceof HumanMessage ? String(lastMessage.content) : '');

    const systemPrompt = `You are the Master Brain of Elara, an advanced AI Orchestration System. 
Your role is to orchestrate complex business workflows by delegating tasks to specialized supervisors.

### OPERATIONAL PRINCIPLES:
1. **Strategic Planning**: If a request is complex, break it down into a multi-step plan.
2. **Contextual Memory**: Use stored facts and conversation history to make informed decisions.
3. **Efficiency**: Direct users to the most relevant specialist immediately.
4. **Sequencing**: If you create a plan, you will be called back after each step to manage the next transition.

### SPECIALISTS:
- **${SupervisorType.GENERAL}**: Greetings, capabilities, general guidance, and clarification.
- **${SupervisorType.LEADS}**: Company discovery and B2B contact enrichment.
- **${SupervisorType.ADS}**: Market research and high-converting ad copywriting.
- **${SupervisorType.COMMUNICATION}**: Messaging (Email/SMS/WA), proposals, appointments, and AI calls.
- **${SupervisorType.CAMPAIGN}**: Creating and managing marketing strategies.
- **${SupervisorType.MEDIA}**: Professional visual asset and image generation.
- **${SupervisorType.SYSTEM}**: Analytics, stats, and health monitoring.
- **${SupervisorType.USERS}**: Profile and account management.

### DECISION GUIDELINES:
- **New Multi-step Task**: Generate a 'plan' array and set 'next' to the first supervisor in that plan.
- **Continuation**: If a plan already exists in state, check progress and decide the next logical step.
- **Vague Request**: Route to ${SupervisorType.GENERAL} to ask for more details.
- **Task Complete**: Route to 'FINISH'.

CURRENT USER REQUEST: "${userRequest}"
EXISTING PLAN: ${JSON.stringify(state.tasks || [])}
CURRENT TASK CURSOR: ${state.task_cursor || 0}
TASK SUMMARIES SO FAR: ${JSON.stringify(state.task_summaries || [])}

Respond with strategic precision.`;

    const structuredModel = this.chatModel.withStructuredOutput(
      this.autonomySchema,
    );

    try {
      const decision = (await structuredModel.invoke([
        new SystemMessage(systemPrompt),
        ...state.messages,
      ])) as any;

      // Handle plan logic
      const updatedTasks = decision.plan || state.tasks || [];
      let nextCursor = state.task_cursor || 0;

      // If we are progressing through an existing or new plan
      if (decision.next !== 'FINISH' && decision.next !== SupervisorType.GENERAL) {
        // Simple logic: if we just decided on a supervisor that matches a plan step, 
        // we might want to advance the cursor in the future, but for now 
        // let the specialized supervisor do its job.
      }

      return {
        next: decision.next as SupervisorType | 'FINISH',
        reasoning: decision.reasoning,
        analysis: decision.analysis,
        memory_to_save: decision.memory_to_save,
        current_task: decision.instruction,
        tasks: updatedTasks,
        task_cursor: nextCursor,
        user_request: userRequest, // Ensure request is locked into state
      };
    } catch (e) {
      return {
        next: SupervisorType.GENERAL,
        reasoning: 'Fallback due to orchestration error.',
        analysis: 'Model failed to provide structured decision.',
      };
    }
  }
}

/**
 * Backward compatibility export
 * For existing code that uses the function pattern
 */
export const scripySupervisor = async (
  state: ScrpyState,
  model: ChatOpenAI,
) => {
  const service = new ScripySupervisorService(model);
  return service.supervise(state);
};
