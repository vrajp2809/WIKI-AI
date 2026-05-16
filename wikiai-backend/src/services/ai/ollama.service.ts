import axios from "axios";
import { env } from "../../config/environment";
import { logger } from "../../utils/logger";
import { CompletionOptions } from "./openai.service";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OllamaService {
  private client = axios.create({
    baseURL: env.OLLAMA_BASE_URL,
    timeout: 30000,
  });

  async complete(
    systemPrompt: string,
    messages: Array<{ role: string; content: string }>,
    options: number | CompletionOptions = 1500,
  ): Promise<{ content: string; tokensUsed: number }> {
    const completionOptions = typeof options === 'number'
      ? { maxTokens: options, temperature: 0.05 }
      : { maxTokens: 1500, temperature: 0.05, ...options };
    const formattedMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await this.client.post("/api/chat", {
      model: env.OLLAMA_CHAT_MODEL,
      messages: formattedMessages,
      stream: false,
      options: {
        num_predict: completionOptions.maxTokens,
        temperature: completionOptions.temperature,
        top_p: 0.9,
      },
    });

    const content = response.data.message?.content ?? "";
    // Ollama doesn't provide token counts, so we'll estimate
    const tokensUsed = Math.ceil(content.length / 4); // rough estimate

    logger.debug("Ollama completion", {
      model: env.OLLAMA_CHAT_MODEL,
      tokensUsed,
    });

    return { content, tokensUsed };
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.post("/api/embed", {
      model: env.OLLAMA_EMBEDDING_MODEL,
      input: text,
    });

    return response.data.embeddings[0];
  }
}
