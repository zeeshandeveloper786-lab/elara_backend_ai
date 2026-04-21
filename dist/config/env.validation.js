"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().optional(),
    DATABASE_URL: zod_1.z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: zod_1.z.string().min(1, 'JWT_SECRET is required'),
    TAVILY_API_KEY: zod_1.z.string().min(1).optional(),
    APOLLO_API_KEY: zod_1.z.string().min(1).optional(),
    CALENDLY_API_KEY: zod_1.z.string().min(1).optional(),
    OPENROUTER_API_KEY: zod_1.z.string().min(1).optional(),
    OPENAI_API_KEY: zod_1.z.string().min(1).optional(),
    TWILIO_ACCOUNT_SID: zod_1.z.string().min(1).optional(),
    TWILIO_AUTH_TOKEN: zod_1.z.string().min(1).optional(),
    TWILIO_PHONE_NUMBER: zod_1.z.string().min(1).optional(),
    SMTP_HOST: zod_1.z.string().min(1).optional(),
    SMTP_PORT: zod_1.z.coerce.number().int().positive().optional(),
    SMTP_USER: zod_1.z.string().min(1).optional(),
    SMTP_PASS: zod_1.z.string().min(1).optional(),
    VAPI_API_KEY: zod_1.z.string().min(1).optional(),
    VAPI_ASSISTANT_ID: zod_1.z.string().min(1).optional(),
    VAPI_PHONE_NUMBER_ID: zod_1.z.string().min(1).optional(),
    PROPOSAL_STORAGE_PATH: zod_1.z.string().min(1).optional(),
    POSTGRES_USER: zod_1.z.string().optional(),
    POSTGRES_PASSWORD: zod_1.z.string().optional(),
    POSTGRES_DB: zod_1.z.string().optional(),
});
function validateEnv(config) {
    const parsed = envSchema.safeParse(config);
    if (!parsed.success) {
        const message = parsed.error.issues
            .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
            .join('\n');
        throw new Error(`Environment validation failed:\n${message}`);
    }
    return parsed.data;
}
//# sourceMappingURL=env.validation.js.map