import { env } from "../../config/environment";
import { logger } from "../../utils/logger";
import { GroqService } from "./groq.service";
import { OllamaService } from "./ollama.service";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

export class OpenAIService {
  private ollama = new OllamaService();
  private groq: GroqService | null = null;

  constructor() {
    if (env.GROQ_API_KEY) {
      try {
        this.groq = new GroqService();
      } catch (err) {
        logger.warn('Failed to initialize GroqService: ' + (err as any).message);
        this.groq = null;
      }
    }
  }

  async complete(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    maxTokensOrOptions: number | CompletionOptions = 1500,
  ): Promise<{ content: string; tokensUsed: number }> {
    const options = typeof maxTokensOrOptions === 'number'
      ? { maxTokens: maxTokensOrOptions, temperature: 0.05 }
      : { temperature: 0.05, ...maxTokensOrOptions };

    if (this.groq) {
      try {
        return await this.groq.complete(systemPrompt, messages, options);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!message.includes('429') && !message.toLowerCase().includes('rate limit')) {
          throw error;
        }

        logger.warn('Groq rate limited; falling back to Ollama', { error: message });
      }
    }
    return this.ollama.complete(systemPrompt, messages, options);
  }

  async embed(text: string): Promise<number[]> {
    return this.ollama.embed(text);
  }
}
