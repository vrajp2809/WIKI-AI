import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Bot, Brain, GraduationCap, Loader2, MessageSquarePlus, Send, UserRound } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { personaDescriptions } from '../constants/personas';
import { usePersonaContext } from '../hooks/usePersonaContext';
import { chatService } from '../services/chat.service';
import { useAppStore } from '../store/app.store';

interface ChatSession {
  id: string;
  topic: string | null;
  title: string | null;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  tokensUsed?: number;
  metadata?: {
    ragUsed?: boolean;
    topic?: string | null;
    title?: string | null;
    sources?: Array<{
      articleTitle: string;
      similarity: number;
      excerpt: string;
    }>;
  };
  createdAt: string;
}

const personaLabel: Record<string, string> = {
  school_student: 'Student Tutor',
  college_student: 'College Coach',
  professor_researcher: 'Research Assistant',
  casual_learner: 'Curiosity Guide',
};

const personaModeLabel: Record<string, string> = {
  school_student: 'school student',
  college_student: 'college student',
  professor_researcher: 'professor',
  casual_learner: 'casual learner',
};

const renderStructuredText = (content: string) => {
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.map((line, index) => {
    const key = `${index}-${line.slice(0, 24)}`;
    const heading = line.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '');
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);

    if (/^#{1,4}\s+/.test(line) || (/^[A-Z][A-Za-z /&-]{2,40}:$/.test(line) && line.length < 46)) {
      return <strong className="structured-heading" key={key}>{heading.replace(/:$/, '')}</strong>;
    }

    if (bullet) {
      return <p className="structured-bullet" key={key}>{bullet[1].replace(/\*\*/g, '')}</p>;
    }

    if (numbered) {
      return <p className="structured-bullet numbered" key={key}>{numbered[1].replace(/\*\*/g, '')}</p>;
    }

    return <p key={key}>{line.replace(/\*\*/g, '')}</p>;
  });
};

const suggestedQuestions: Record<string, string[]> = {
  school_student: [
    'Explain with analogy',
    'Teach me step by step',
    'Give a simple example',
    'Ask me a quick revision question',
  ],
  college_student: [
    'Important for exam?',
    'Give real-world example',
    'Summarize key points',
    'Ask interview questions',
  ],
  professor_researcher: [
    'Explain technical assumptions',
    'Give citations and references',
    'Compare competing views',
    'List research limitations',
  ],
  casual_learner: [
    'Explain with analogy',
    'Why does this matter?',
    'Give real-world example',
    'Tell me a short story',
  ],
};

export const ChatScreen = () => {
  const [searchParams] = useSearchParams();
  const {
    currentPersona,
    explanationLevel,
    isProfessor,
    isStudent,
    uiMode,
  } = usePersonaContext();
  const searchHistory = useAppStore((state) => state.searchHistory);
  const topicFromUrl = searchParams.get('topic')?.trim() || '';
  const latestTopic = topicFromUrl || searchHistory[0]?.query || '';

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const promptChips = suggestedQuestions[currentPersona] ?? suggestedQuestions.casual_learner;
  const tutorName = personaLabel[currentPersona] ?? 'AI Tutor';
  const contextLine = latestTopic
    ? `Context-aware chat for ${latestTopic}`
    : 'Start with any topic, or open a topic first for tighter context.';
  const activeTopic = activeSession?.topic || latestTopic;
  const sessionTitle = (session: ChatSession) => (
    session.topic ? `${session.topic} Q&A` : session.title || 'General AI tutor'
  );
  const visibleSessions = sessions.filter((session, index, list) => {
    const key = (session.topic || session.title || session.id).toLowerCase();
    return list.findIndex((item) => (item.topic || item.title || item.id).toLowerCase() === key) === index;
  });

  const welcomeMessage = useMemo<ChatMessage>(() => ({
    id: 'welcome',
    sessionId: activeSession?.id ?? 'local',
    role: 'assistant',
    content: isProfessor
      ? 'I am ready to answer with technical depth, definitions, limitations, and source-aware framing.'
      : isStudent
        ? 'I will explain step by step in simple language, then help you practice.'
        : 'Ask me anything and I will adapt the explanation to your learning style.',
    createdAt: new Date().toISOString(),
  }), [activeSession?.id, isProfessor, isStudent]);

  useEffect(() => {
    let isMounted = true;

    const loadChat = async () => {
      setIsLoading(true);
      setError('');

      try {
        const sessionsResponse = await chatService.getSessions();
        if (!isMounted) return;

        const existingSessions: ChatSession[] = sessionsResponse.data.data ?? [];
        const matchingTopicSession = latestTopic
          ? existingSessions.find((session) => session.topic?.toLowerCase() === latestTopic.toLowerCase())
          : undefined;
        let nextSession = matchingTopicSession ?? existingSessions[0];

        if (!nextSession || (topicFromUrl && nextSession.topic?.toLowerCase() !== topicFromUrl.toLowerCase())) {
          const created = await chatService.createSession(latestTopic || undefined, latestTopic ? `${latestTopic} Q&A` : 'General AI tutor');
          nextSession = created.data.data;
        }

        setSessions(nextSession && !existingSessions.some((session) => session.id === nextSession.id)
          ? [nextSession, ...existingSessions]
          : existingSessions);
        setActiveSession(nextSession);

        const sessionResponse = await chatService.getSession(nextSession.id);
        if (!isMounted) return;
        setMessages(sessionResponse.data.data.messages ?? []);
      } catch (chatError) {
        if (!isMounted) return;
        setError(chatError instanceof Error ? chatError.message : 'Chat could not be loaded.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadChat();
    return () => {
      isMounted = false;
    };
  }, [latestTopic, topicFromUrl]);

  const visibleMessages = messages.length ? messages : [welcomeMessage];

  const sendMessage = async (content: string) => {
    const cleanContent = content.trim();
    if (!cleanContent || !activeSession || isSending) {
      return;
    }

    const optimisticMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      sessionId: activeSession.id,
      role: 'user',
      content: cleanContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, optimisticMessage]);
    setDraft('');
    setIsSending(true);
    setError('');

    try {
      const response = await chatService.sendMessage(activeSession.id, cleanContent, activeTopic || undefined);
      setMessages((current) => [...current, response.data.data]);
      setActiveSession((current) => current ? { ...current, title: response.data.data.metadata?.title ?? current.title, topic: response.data.data.metadata?.topic ?? current.topic } : current);
      setSessions((current) => current.map((session) => (
        session.id === activeSession.id
          ? { ...session, topic: response.data.data.metadata?.topic ?? session.topic, updatedAt: new Date().toISOString() }
          : session
      )));
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Message failed. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(draft);
  };

  const startNewSession = async () => {
    setIsLoading(true);
    setError('');
    try {
      const created = await chatService.createSession(latestTopic || undefined, latestTopic ? `${latestTopic} Q&A` : 'General AI tutor');
      const nextSession = created.data.data;
      setActiveSession(nextSession);
      setSessions((current) => [nextSession, ...current]);
      setMessages([]);
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : 'Could not start a new chat.');
    } finally {
      setIsLoading(false);
    }
  };

  const openSession = async (session: ChatSession) => {
    if (session.id === activeSession?.id || isLoading) {
      return;
    }

    setActiveSession(session);
    setIsLoading(true);
    setError('');
    try {
      const sessionResponse = await chatService.getSession(session.id);
      setMessages(sessionResponse.data.data.messages ?? []);
    } catch (sessionError) {
      setError(sessionError instanceof Error ? sessionError.message : 'Could not load this chat.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={`page chat-page density-${uiMode.density}`}>
      <div className="chat-header">
        <div className="page-header">
          <span className="eyebrow">{contextLine}</span>
          <h1>{tutorName}</h1>
          <p>
            Answers adapt to {personaModeLabel[currentPersona] ?? 'your'} mode with {explanationLevel} depth.
          </p>
        </div>
        <button className="button secondary" onClick={startNewSession} type="button">
          <MessageSquarePlus size={18} /> New chat
        </button>
      </div>

      <div className="chat-shell">
        <aside className="chat-context-panel">
          <GraduationCap size={26} />
          <strong>{tutorName}</strong>
          <p>{personaDescriptions[currentPersona]}</p>
          <div className="adaptive-summary">
            <span>{explanationLevel} responses</span>
            <span>{activeTopic ? `Topic: ${activeTopic}` : 'No topic selected'}</span>
          </div>
          {sessions.length > 0 && (
            <div className="session-list">
              <span className="eyebrow">Recent Chats</span>
              {visibleSessions.slice(0, 5).map((session) => (
                <button
                  className={activeSession?.id === session.id ? 'active' : ''}
                  key={session.id}
                  onClick={() => openSession(session)}
                  type="button"
                >
                  {sessionTitle(session)}
                </button>
              ))}
            </div>
          )}
        </aside>

        <main className="chat-console">
          <div className="suggested-row">
            {promptChips.map((prompt) => (
              <button className="chip" disabled={isSending || isLoading} key={prompt} onClick={() => sendMessage(prompt)} type="button">
                {prompt}
              </button>
            ))}
          </div>

          <div className="message-list">
            {isLoading ? (
              <div className="empty-chat-state">
                <Loader2 size={26} />
                <p>Preparing your AI tutor...</p>
              </div>
            ) : visibleMessages.map((message) => (
              <article className={`message-bubble ${message.role}`} key={message.id}>
                <div className="message-avatar">
                  {message.role === 'assistant' ? <Bot size={18} /> : <UserRound size={18} />}
                </div>
                <div>
                  <span>{message.role === 'assistant' ? tutorName : 'You'}</span>
                  <div className="structured-text">{renderStructuredText(message.content)}</div>
                  {message.metadata?.sources?.length ? (
                    <div className="message-sources">
                      <span>Wikipedia context</span>
                      {message.metadata.sources.slice(0, 3).map((source) => (
                        <small key={`${message.id}-${source.articleTitle}-${source.similarity}`}>
                          {source.articleTitle}
                        </small>
                      ))}
                    </div>
                  ) : null}
                  {message.tokensUsed ? <small>{message.tokensUsed} tokens</small> : null}
                </div>
              </article>
            ))}
            {isSending && (
              <article className="message-bubble assistant">
                <div className="message-avatar"><Brain size={18} /></div>
                <div>
                  <span>{tutorName}</span>
                  <p>Thinking with your topic and persona...</p>
                </div>
              </article>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <form className="chat-composer" onSubmit={handleSubmit}>
            <textarea
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                isProfessor
                  ? 'Ask for mechanisms, citations, or limitations...'
                  : isStudent
                    ? 'Ask your doubt in simple words...'
                    : 'Ask your AI tutor...'
              }
              rows={2}
              value={draft}
            />
            <button className="button primary" disabled={isSending || !draft.trim()} type="submit">
              <Send size={18} /> Send
            </button>
          </form>
        </main>
      </div>
    </section>
  );
};
