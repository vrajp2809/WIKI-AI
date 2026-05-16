import { OpenAIService } from '../ai/openai.service';
import { RagPipelineService } from '../rag/pipeline.service';
import { buildPersonaSystemPrompt } from '../../utils/promptBuilder';
import { Persona, ChatSession, ChatMessage } from '../../models';
import { ApiError } from '../../utils/apiError';
import { ChatMessageModel, ChatSessionModel } from '../../models/mongo';

export class ChatService {
  private openai = new OpenAIService();
  private rag = new RagPipelineService();

  async createSession(
    userId: string,
    topic?: string,
    title?: string
  ): Promise<ChatSession> {
    const cleanTopic = topic?.trim();
    const session = await ChatSessionModel.create({
      userId,
      topic: cleanTopic || null,
      title: title?.trim() || (cleanTopic ? `${cleanTopic} Q&A` : 'General AI tutor'),
    });
    return this.mapSession(session);
  }

  async getSessions(userId: string): Promise<ChatSession[]> {
    const sessions = await ChatSessionModel.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20);
    return sessions.map(this.mapSession);
  }

  async getSession(sessionId: string, userId: string): Promise<{
    session: ChatSession;
    messages: ChatMessage[];
  }> {
    const session = await ChatSessionModel.findOne({ _id: sessionId, userId });
    if (!session) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Chat session not found');

    const messages = await ChatMessageModel.find({ sessionId }).sort({ createdAt: 1 });

    return {
      session: this.mapSession(session),
      messages: messages.map(this.mapMessage),
    };
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    userContent: string,
    persona: Persona,
    topicOverride?: string
  ): Promise<ChatMessage> {
    // Verify session ownership
    const session = await ChatSessionModel.findOne({ _id: sessionId, userId });
    if (!session) throw new ApiError(404, 'SESSION_NOT_FOUND', 'Chat session not found');

    const topic = topicOverride?.trim() || session.topic || null;
    if (topic && topic !== session.topic) {
      session.topic = topic;
      session.title = `${topic} Q&A`;
      await session.save();
    }

    // Save user message
    await ChatMessageModel.create({
      sessionId,
      role: 'user',
      content: userContent,
    });

    // Fetch last 6 messages for context
    const history = await ChatMessageModel.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(6)
      .select({ role: 1, content: 1 })
      .lean();
    const chatHistory = history
      .reverse()
      .map((message) => ({ role: message.role, content: message.content }));

    // RAG: retrieve relevant Wikipedia content
    let aiResponse: string;
    let tokensUsed = 0;
    let metadata: ChatMessage['metadata'] = {
      topic,
      title: session.title,
      ragUsed: false,
      sources: [],
    };

    try {
      const result = await this.rag.queryAndGenerate(
        userContent,
        persona,
        chatHistory,
        topic
      );
      aiResponse = result.content;
      tokensUsed = result.tokensUsed;
      metadata = {
        topic,
        title: session.title,
        ragUsed: result.ragUsed,
        sources: result.sources,
      };
    } catch {
      // Fallback: answer without RAG context
      const system = buildPersonaSystemPrompt(persona, topic ? `Current chat topic: ${topic}` : '');
      const { content, tokensUsed: t } = await this.openai.complete(system, chatHistory, {
        maxTokens: personaMaxTokens(persona),
        temperature: 0.05,
      });
      aiResponse = content;
      tokensUsed = t;
    }

    // Save assistant message
    const assistantMessage = await ChatMessageModel.create({
      sessionId,
      role: 'assistant',
      content: aiResponse,
      tokensUsed,
      metadata,
    });

    // Update session timestamp
    await ChatSessionModel.updateOne({ _id: sessionId }, { updatedAt: new Date() });

    return this.mapMessage(assistantMessage);
  }

  private mapSession(row: any): ChatSession {
    return {
      id: row.id,
      userId: String(row.userId),
      topic: row.topic,
      title: row.title,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapMessage(row: any): ChatMessage {
    return {
      id: row.id,
      sessionId: String(row.sessionId),
      role: row.role,
      content: row.content,
      tokensUsed: row.tokensUsed,
      metadata: row.metadata,
      createdAt: row.createdAt,
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
