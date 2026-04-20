import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),

  // External services (optional, but validated if present)
  TAVILY_API_KEY: z.string().min(1).optional(),
  APOLLO_API_KEY: z.string().min(1).optional(),
  CALENDLY_API_KEY: z.string().min(1).optional(),
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().min(1).optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  // SMTP
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().min(1).optional(),
  SMTP_PASS: z.string().min(1).optional(),

  // Vapi AI Calls
  VAPI_API_KEY: z.string().min(1).optional(),
  VAPI_ASSISTANT_ID: z.string().min(1).optional(),
  VAPI_PHONE_NUMBER_ID: z.string().min(1).optional(),

  // Storage
  PROPOSAL_STORAGE_PATH: z.string().min(1).optional(),

  // PostgreSQL (optional - for Docker/local dev)
  POSTGRES_USER: z.string().optional(),
  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join('.') || 'env'}: ${i.message}`)
      .join('\n');
    throw new Error(`Environment validation failed:\n${message}`);
  }
  return parsed.data;
}
