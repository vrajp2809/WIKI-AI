import { EmbeddingService, SimilarChunk } from "./embedding.service";
import { OpenAIService } from "../ai/openai.service";

export class RetrievalService {
  private embeddingService = new EmbeddingService();
  private openai = new OpenAIService();

  async retrieve(
    query: string,
    limit: number = 5,
  ): Promise<
    Array<{
      articleId: string;
      articleTitle: string;
      chunkText: string;
      score: number;
    }>
  > {
    // Generate embedding for the query
    const queryEmbedding = await this.embeddingService.embed(query);

    // Search for similar chunks
    const similarChunks = await this.embeddingService.searchSimilar(
      queryEmbedding,
      limit,
    );

    return similarChunks.map((chunk) => ({
      articleId: chunk.articleId,
      articleTitle: chunk.articleTitle,
      chunkText: chunk.chunkText,
      score: chunk.score,
    }));
  }

  async similaritySearch(
    queryEmbedding: number[],
    limit: number = 5,
  ): Promise<SimilarChunk[]> {
    return this.embeddingService.searchSimilar(queryEmbedding, limit);
  }

  async generateAnswer(query: string, context: string[]): Promise<string> {
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided Wikipedia context.
Use only the information from the context to answer the question. If the context doesn't contain enough information to answer the question, say so.
Be concise but comprehensive in your answers.`;

    const userPrompt = `Question: ${query}

Context:
${context.join("\n\n")}

Answer:`;

    const messages = [{ role: "user", content: userPrompt }];
    const response = await this.openai.complete(systemPrompt, messages);

    return response.content;
  }
}
