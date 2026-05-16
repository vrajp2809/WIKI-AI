import { OpenAIService } from "../ai/openai.service";
import { ArticleChunk } from "../../models/ArticleChunk";

export interface SimilarChunk {
  articleId: string;
  articleTitle: string;
  chunkText: string;
  score: number;
  similarity: number;
}

export class EmbeddingService {
  private openai = new OpenAIService();

  async embed(text: string): Promise<number[]> {
    return this.openai.embed(text);
  }

  async storeChunk(data: {
    articleId: string;
    articleTitle: string;
    chunkIndex: number;
    chunkText: string;
    embedding: number[];
  }): Promise<void> {
    await ArticleChunk.findOneAndUpdate(
      { articleId: data.articleId, chunkIndex: data.chunkIndex },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async isArticleIndexed(articleId: string): Promise<boolean> {
    const chunk = await ArticleChunk.exists({ articleId });
    return Boolean(chunk);
  }

  async searchSimilar(queryEmbedding: number[], limit = 5): Promise<SimilarChunk[]> {
    const chunks = await ArticleChunk.find().select({
      articleId: 1,
      articleTitle: 1,
      chunkText: 1,
      embedding: 1,
    });

    return chunks
      .map((chunk) => {
        const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
        return {
          articleId: chunk.articleId,
          articleTitle: chunk.articleTitle,
          chunkText: chunk.chunkText,
          score: similarity,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  const length = Math.min(a.length, b.length);
  if (!length) return 0;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
