"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createModel = void 0;
const openai_1 = require("@langchain/openai");
const createModel = (apiKey, modelName = 'openai/gpt-4o-mini') => {
    const key = apiKey || process.env.OPENROUTER_API_KEY || '';
    if (!key) {
        console.warn('⚠️ OPENROUTER_API_KEY is missing in environment variables! AI features will be disabled.');
        return null;
    }
    const cleanKey = key.replace(/"/g, '').trim();
    return new openai_1.ChatOpenAI({
        apiKey: cleanKey,
        model: modelName,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 1,
        timeout: 15000,
        configuration: {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
                'HTTP-Referer': 'https://elara-ai.com',
                'X-Title': 'Elara AI',
            },
        },
    });
};
exports.createModel = createModel;
//# sourceMappingURL=openai-model.js.map