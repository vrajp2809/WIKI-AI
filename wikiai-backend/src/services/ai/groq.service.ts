import Groq from 'groq-sdk';
import { env } from "../../config/environment";
import { logger } from "../../utils/logger";
import { CompletionOptions } from "./openai.service";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class GroqService {
  private client: any;

  constructor() {
    if (!env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }
    this.client = new Groq({ apiKey: env.GROQ_API_KEY as string });
  }

  async complete(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }> ,
    options: number | CompletionOptions = 1500,
  ): Promise<{ content: string; tokensUsed: number }> {
    const completionOptions = typeof options === 'number'
      ? { maxTokens: options, temperature: 0.05 }
      : { maxTokens: 1500, temperature: 0.05, ...options };
    const formattedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as any, content: m.content })),
    ];

    const response = await this.client.chat.completions.create({
      model: env.GROQ_CHAT_MODEL,
      max_tokens: completionOptions.maxTokens,
      temperature: completionOptions.temperature,
      messages: formattedMessages,
    });

    const rawText = response.choices?.[0]?.message?.content ?? '';
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    const tokensUsed = response.usage?.total_tokens ?? Math.ceil(cleaned.length / 4);

    logger.debug('Groq completion', { model: env.GROQ_CHAT_MODEL, tokensUsed });

    return { content: cleaned, tokensUsed };
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('GroqService does not provide embeddings in this project');
  }
}
