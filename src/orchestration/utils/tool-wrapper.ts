import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { RunnableConfig } from '@langchain/core/runnables';

/**
 * Creates a Scry tool that has access to the conversation state.
 * This wrapper allows tools to access user context (user_id, etc.)
 * from the LangGraph state.
 */
export function createScryTool(
  handler: (args: any, state: any) => Promise<string>,
  config: {
    name: string;
    description: string;
    schema: z.ZodTypeAny;
    requireUser?: boolean; // Defaults to true
  },
) {
  const requireUser = config.requireUser !== false;

  return tool(
    async (args, runnableConfig: RunnableConfig) => {
      // Extract state from configurable (LangGraph passes state here)
      const state = (runnableConfig as any).configurable?.state || {};

      // Centralized User Validation
      if (requireUser && !state.user_id) {
        console.error(
          `❌ [TOOL ERROR] ${config.name}: Missing user_id in state`,
        );
        console.error('Available state keys:', Object.keys(state));
        return '❌ **Authentication Error:** Your session is missing user identification. Please log in again to use this tool.';
      }

      return handler(args, state);
    },
    {
      name: config.name,
      description: config.description,
      schema: config.schema,
    },
  );
}
