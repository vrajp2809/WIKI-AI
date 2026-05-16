import { WikipediaService } from '../wikipedia/wikipedia.service';
import { ChunkerService } from '../wikipedia/chunker.service';
import { EmbeddingService } from './embedding.service';
import { RetrievalService } from './retrieval.service';
import { OpenAIService } from '../ai/openai.service';
import { buildPersonaSystemPrompt } from '../../utils/promptBuilder';
import { Persona } from '../../models';
import { logger } from '../../utils/logger';

export class RagPipelineService {
  private wikipedia = new WikipediaService();
  private chunker = new ChunkerService();
  private embedding = new EmbeddingService();
  private retrieval = new RetrievalService();
  private openai = new OpenAIService();

  /**
   * Fetch, chunk, embed, and store a Wikipedia article.
   * Skips if article is already indexed.
   */
  async ingestArticle(articleTitle: string): Promise<{ articleId: string }> {
    const article = await this.wikipedia.fetchArticle(articleTitle);

    const alreadyIndexed = await this.embedding.isArticleIndexed(article.id);
    if (alreadyIndexed) {
      logger.debug(`Article already indexed: ${article.title}`);
      return { articleId: article.id };
    }

    const chunks = this.chunker.chunk(article.text, 500, 50);
    logger.info(`Indexing "${article.title}": ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i++) {
      const vector = await this.embedding.embed(chunks[i]);
      await this.embedding.storeChunk({
        articleId: article.id,
        articleTitle: article.title,
        chunkIndex: i,
        chunkText: chunks[i],
        embedding: vector,
      });
    }

    return { articleId: article.id };
  }

  /**
   * Given a user query + persona, retrieve relevant chunks and generate a response.
   */
  async queryAndGenerate(
    userQuery: string,
    persona: Persona,
    chatHistory: Array<{ role: string; content: string }>,
    topicHint?: string | null
  ): Promise<{
    content: string;
    tokensUsed: number;
    sources: Array<{ articleTitle: string; similarity: number; excerpt: string }>;
    ragUsed: boolean;
  }> {
    if (topicHint) {
      await this.ingestArticle(topicHint);
    }

    // Embed the query
    const queryVector = await this.embedding.embed(topicHint ? `${topicHint}\n${userQuery}` : userQuery);

    // Retrieve top-5 most relevant chunks
    const chunks = await this.retrieval.similaritySearch(queryVector, 8);

    if (chunks.length === 0) {
      // No chunks found — answer from LLM knowledge only
      const system = buildPersonaSystemPrompt(persona, '');
      const response = await this.openai.complete(system, [
        ...chatHistory.slice(-6),
        { role: 'user', content: userQuery },
      ], { maxTokens: personaMaxTokens(persona), temperature: 0.05 });
      return { ...response, sources: [], ragUsed: false };
    }

    const topicLower = topicHint?.toLowerCase();
    const relevantChunks = chunks
      .filter((c) => !topicLower || c.articleTitle.toLowerCase() === topicLower || c.similarity > 0.55)
      .slice(0, 5);

    const sourceContext = relevantChunks
      .map((c) => `[From: ${c.articleTitle}]\n${c.chunkText}`)
      .join('\n\n---\n\n');
    const context = [
      topicHint ? `Current chat topic: ${topicHint}` : '',
      sourceContext,
    ].filter(Boolean).join('\n\n---\n\n');

    const system = buildPersonaSystemPrompt(persona, context);

    const messages = [
      ...chatHistory.slice(-6),
      { role: 'user', content: userQuery },
    ];

    const response = await this.openai.complete(system, messages, {
      maxTokens: personaMaxTokens(persona),
      temperature: 0.05,
    });
    return {
      ...response,
      ragUsed: Boolean(context),
      sources: relevantChunks.map((chunk) => ({
        articleTitle: chunk.articleTitle,
        similarity: chunk.similarity,
        excerpt: chunk.chunkText.slice(0, 260),
      })),
    };
  }
}

function personaMaxTokens(persona: Persona): number {
  return {
    school_student: 650,
    college_student: 950,
    professor_researcher: 1500,
    casual_learner: 750,
  }[persona.level] ?? 900;
}
