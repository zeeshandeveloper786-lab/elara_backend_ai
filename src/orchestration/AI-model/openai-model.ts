import { ChatOpenAI } from '@langchain/openai';

export const createModel = (
  apiKey?: string,
  modelName: string = 'openai/gpt-4o-mini', // Faster model
) => {
  const key = apiKey || process.env.OPENROUTER_API_KEY || '';

  if (!key) {
    console.warn(
      '⚠️ OPENROUTER_API_KEY is missing in environment variables! AI features will be disabled.',
    );
    return null;
  }

  const cleanKey = key.replace(/"/g, '').trim();

  return new ChatOpenAI({
    apiKey: cleanKey,
    model: modelName,
    temperature: 0.7,
    maxTokens: 1000, // Reduced for faster responses
    topP: 1,
    timeout: 15000, // 15 second timeout for faster fail-fast
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': 'https://elara-ai.com',
        'X-Title': 'Elara AI',
      },
    },
  });
};
