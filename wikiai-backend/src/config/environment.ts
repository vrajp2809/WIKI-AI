import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  API_VERSION: z.string().default("v1"),

  // JWT
  JWT_SECRET: z.string(),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),

  // Database
  MONGODB_URI: z.string(),

  // Redis
  REDIS_URL: z.string(),

  // OpenAI (optional; the current service path uses Ollama locally)
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().default("gpt-4o"),

  // Ollama
  OLLAMA_BASE_URL: z.string().default("http://localhost:11434"),
  OLLAMA_CHAT_MODEL: z.string().default("qwen2.5:3b"),
  OLLAMA_EMBEDDING_MODEL: z.string().default("qwen2.5:3b"),

  // HuggingFace Embeddings (legacy/optional)
  HUGGINGFACE_EMBEDDING_MODEL: z.string().default("BAAI/bge-small-en-v1.5"),

  // Groq (optional)
  GROQ_API_KEY: z.string().optional(),
  GROQ_CHAT_MODEL: z.string().default("llama-3.3-70b-versatile"),
  GROQ_EMBEDDING_MODEL: z.string().optional(),

  // YouTube Data API v3
  YOUTUBE_API_KEY: z.string().optional(),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().optional(),

  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().optional(),
  AWS_S3_BUCKET: z.string().optional(),

  // Rate Limiting
  AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().default(10),
  GLOBAL_RATE_LIMIT_PER_15MIN: z.coerce.number().default(200),

  // CORS
  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:5173,http://127.0.0.1:5173,http://localhost:8081,exp://localhost:19000"),

  // Logging
  LOG_LEVEL: z.string().default("debug"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
