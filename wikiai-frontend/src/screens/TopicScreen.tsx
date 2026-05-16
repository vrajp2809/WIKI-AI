import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpenCheck,
  Brain,
  CheckCircle2,
  FileText,
  GitFork,
  Library,
  Layers,
  MessagesSquare,
  PlayCircle,
  Bookmark,
  Sparkles,
  Wand2,
} from 'lucide-react';

import { personaDescriptions } from '../constants/personas';
import { usePersonaContext } from '../hooks/usePersonaContext';
import { useAppStore } from '../store/app.store';
import {
  GeneratedQuiz,
  LearningVideo,
  TopicArticle,
  topicService,
} from '../services/topic.service';
import { learningService } from '../services/learning.service';
import { SearchResult } from '../types/search';

const personaLabel: Record<string, string> = {
  school_student: 'School Student',
  college_student: 'College Student',
  professor_researcher: 'Professor Researcher',
  casual_learner: 'Casual Learner',
};

const stripTopicMarkup = (value?: string) => value?.replace(/<[^>]+>/g, '') ?? '';
const htmlToPlainText = (blocks: OriginalBlock[]) => blocks
  .map((block) => {
    const doc = new DOMParser().parseFromString(block.html, 'text/html');
    return doc.body.textContent?.trim() ?? '';
  })
  .filter(Boolean)
  .join('\n\n');

type ExplanationMode = 'simplify' | 'deep' | 'example' | 'interview';
type ReaderMode = 'ai' | 'original';

interface OriginalBlock {
  html: string;
}

const explanationControls: Array<{
  id: ExplanationMode;
  label: string;
  instruction: string;
}> = [
  {
    id: 'simplify',
    label: 'Simplify',
    instruction: 'Explain this topic in very simple language with short sentences.',
  },
  {
    id: 'deep',
    label: 'Explain Deeply',
    instruction: 'Explain this topic deeply with mechanisms, important terms, and advanced connections.',
  },
  {
    id: 'example',
    label: 'Give Example',
    instruction: 'Explain this topic using a concrete real-world example and connect the example back to the idea.',
  },
  {
    id: 'interview',
    label: 'Interview Mode',
    instruction: 'Prepare this topic as interview preparation with likely questions and crisp answer points.',
  },
];

export const TopicScreen = () => {
  const { title = 'Topic' } = useParams();
  const navigate = useNavigate();
  const addSearch = useAppStore((state) => state.addSearch);
  const { currentPersona, explanationLevel, persona, uiMode, isProfessor, isStudent } = usePersonaContext();
  const topicTitle = decodeURIComponent(title);

  const [article, setArticle] = useState<TopicArticle | null>(null);
  const [summary, setSummary] = useState('');
  const [simpleExplanation, setSimpleExplanation] = useState('');
  const [activeExplanationMode, setActiveExplanationMode] = useState<ExplanationMode>('simplify');
  const [guidedExplanation, setGuidedExplanation] = useState('');
  const [readerMode, setReaderMode] = useState<ReaderMode>('ai');
  const [originalBlocks, setOriginalBlocks] = useState<OriginalBlock[]>([]);
  const [originalLoaded, setOriginalLoaded] = useState(false);
  const [generatedNotes, setGeneratedNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [videos, setVideos] = useState<LearningVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<LearningVideo | null>(null);
  const [quiz, setQuiz] = useState<GeneratedQuiz | null>(null);
  const [relatedTopics, setRelatedTopics] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [guidedLoading, setGuidedLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [error, setError] = useState('');

  const explainedFor = personaLabel[currentPersona] ?? 'Learner';
  const category = article?.description ?? (isProfessor ? 'Reference topic' : 'Learning topic');
  const heroInitial = topicTitle.trim().charAt(0).toUpperCase() || 'W';
  const fallbackSummary = useMemo(() => {
    if (isProfessor) {
      return `${topicTitle} is presented with a technical frame so you can connect the concept to definitions, mechanisms, and source material.`;
    }
    if (isStudent) {
      return `${topicTitle} explained in clear steps, with the main idea first and details after it.`;
    }
    return `${topicTitle} explained around your interests and current learning goal.`;
  }, [isProfessor, isStudent, topicTitle]);

  const adaptiveCards = useMemo(() => {
    if (isProfessor) {
      return [
        { title: 'Citation Trail', body: article?.url ? 'Open the source article and compare definitions, claims, and historical context.' : 'Source links will appear after the topic loads.' },
        { title: 'Research Lens', body: 'Focus on mechanisms, limitations, competing views, and terminology precision.' },
        { title: 'Reference Notes', body: 'Use the detailed view to extract terms worth validating against papers or textbooks.' },
      ];
    }

    if (isStudent) {
      return [
        { title: 'Main Idea', body: summary || fallbackSummary },
        { title: 'Flashcard', body: `Front: What is ${article?.title ?? topicTitle}? Back: ${article?.extract?.split('. ')[0] ?? fallbackSummary}` },
        { title: 'Visual Cue', body: 'Look at the image first, then connect it to the simplest one-line definition.' },
      ];
    }

    if (currentPersona === 'college_student') {
      return [
        { title: 'Exam Angle', body: 'Learn the definition, one application, and one limitation before moving deeper.' },
        { title: 'Key Terms', body: 'Convert the summary into short notes you can revise before a test or interview.' },
        { title: 'Practice Path', body: 'Read the summary, explain it aloud, then generate the quiz.' },
      ];
    }

    return [
      { title: 'Plain Story', body: 'Start with why the topic matters before memorizing any terms.' },
      { title: 'Curiosity Hook', body: 'Pick one surprising detail and follow it into a related topic.' },
      { title: 'Everyday Link', body: 'Ask for an example if the idea feels abstract.' },
    ];
  }, [article, currentPersona, fallbackSummary, isProfessor, isStudent, summary, topicTitle]);

  const studySource = summary || article?.extract || fallbackSummary;
  const studySentences = useMemo(
    () => studySource.split(/(?<=[.!?])\s+/).filter(Boolean),
    [studySource],
  );
  const flashcards = useMemo(() => [
    {
      front: `What is ${article?.title ?? topicTitle}?`,
      back: studySentences[0] ?? fallbackSummary,
    },
    {
      front: 'What should I remember first?',
      back: studySentences[1] ?? 'Start with the core definition, then connect one example.',
    },
    {
      front: isProfessor ? 'What should I verify?' : 'How can I revise this quickly?',
      back: isProfessor
        ? 'Check definitions, assumptions, limitations, and source context.'
        : 'Read the summary, flip these cards, then answer the quiz.',
    },
  ], [article?.title, fallbackSummary, isProfessor, studySentences, topicTitle]);
  const revisionSteps = useMemo(() => [
    `Read the personalized summary for ${article?.title ?? topicTitle}.`,
    isStudent ? 'Explain the main idea aloud in two simple sentences.' : 'Write the key terms and one application.',
    'Review the flashcards without looking at the answers.',
    'Generate the MCQ quiz and check every explanation.',
    isProfessor ? 'Follow the related topics as reference branches.' : 'Revisit one related topic to strengthen the concept.',
  ], [article?.title, isProfessor, isStudent, topicTitle]);
  const mindMapNodes = useMemo(() => [
    { label: article?.title ?? topicTitle, kind: 'root' },
    { label: category, kind: 'branch' },
    { label: explainedFor, kind: 'branch' },
    ...relatedTopics.slice(0, 4).map((item) => ({ label: item.title, kind: 'leaf' })),
  ], [article?.title, category, explainedFor, relatedTopics, topicTitle]);
  const visibleVideos = useMemo(
    () => videos.filter((video) => video.videoId !== selectedVideo?.videoId).slice(2),
    [selectedVideo?.videoId, videos],
  );

  useEffect(() => {
    let isMounted = true;

    const loadTopic = async () => {
      setLoading(true);
      setSummaryLoading(true);
      setError('');
      setArticle(null);
      setSummary('');
      setSimpleExplanation('');
      setGuidedExplanation('');
      setOriginalBlocks([]);
      setOriginalLoaded(false);
      setGeneratedNotes('');
      setNotesSaved(false);
      setBookmarked(false);
      setSelectedVideo(null);
      setQuiz(null);

      try {
        const articleData = await topicService.getArticle(topicTitle);
        if (!isMounted) return;
        setArticle(articleData);

        const [videosResult, relatedResult, originalResult] = await Promise.allSettled([
          topicService.getVideos(articleData.title, 6),
          topicService.getRelatedTopics(articleData.title, 7),
          topicService.getOriginalHtml(articleData.title),
        ]);

        if (!isMounted) return;

        if (videosResult.status === 'fulfilled') {
          const loadedVideos = videosResult.value.data.data ?? [];
          setVideos(loadedVideos);
          setSelectedVideo(loadedVideos[0] ?? null);
        } else {
          setVideos([]);
        }

        if (relatedResult.status === 'fulfilled') {
          const cleanRelated = (relatedResult.value.data.data ?? [])
            .filter((item: SearchResult) => item.title !== articleData.title)
            .slice(0, 6);
          setRelatedTopics(cleanRelated);
        } else {
          setRelatedTopics([]);
        }

        if (originalResult.status === 'fulfilled') {
          const parsed = new DOMParser().parseFromString(originalResult.value, 'text/html');
          parsed.querySelectorAll('style, script, table, sup.reference, .mw-editsection').forEach((node) => node.remove());
          parsed.querySelectorAll('a[href^="/wiki/"]').forEach((link) => {
            const href = link.getAttribute('href') ?? '';
            if (!href.includes(':')) {
              const nextTopic = decodeURIComponent(href.replace('/wiki/', '')).replace(/_/g, ' ');
              link.setAttribute('href', `/topic/${encodeURIComponent(nextTopic)}`);
            }
          });
          const blocks = Array.from(parsed.querySelectorAll('p, h2, h3, ul'))
            .map((node) => ({
              html: node.innerHTML,
            }))
            .filter((block) => block.html.replace(/<[^>]+>/g, '').trim().length > 40)
            .slice(0, 18);
          setOriginalBlocks(blocks);
        }
        setOriginalLoaded(true);
      } catch (topicError) {
        if (!isMounted) return;
        setError(topicError instanceof Error ? topicError.message : 'Topic could not be loaded.');
      } finally {
        if (isMounted) {
          setOriginalLoaded(true);
          setLoading(false);
          setSummaryLoading(false);
        }
      }
    };

    loadTopic();
    return () => {
      isMounted = false;
    };
  }, [fallbackSummary, topicTitle]);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      if (!article || !originalLoaded) return;

      setSummaryLoading(true);
      try {
        const sourceText = (htmlToPlainText(originalBlocks) || article.extract || topicTitle).slice(0, 9000);
        const summaryResult = await topicService.getPersonalizedSummary(sourceText, article.title, {
          level: persona.level,
          explanationStyle: persona.explanationStyle,
        });
        if (!isMounted) return;
        setSummary(summaryResult.data.data.summary);
      } catch {
        if (isMounted) setSummary(fallbackSummary);
      } finally {
        if (isMounted) setSummaryLoading(false);
      }
    };

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, [article, currentPersona, fallbackSummary, originalBlocks, originalLoaded, persona.explanationStyle, topicTitle]);

  const openTopic = (nextTitle: string) => {
    addSearch(nextTitle);
    navigate(`/topic/${encodeURIComponent(nextTitle)}`);
  };

  const handleSimplify = async () => {
    setSimpleLoading(true);
    try {
      const { data } = await topicService.explainSimply(article?.title ?? topicTitle);
      setSimpleExplanation(data.data.explanation);
    } finally {
      setSimpleLoading(false);
    }
  };

  const handleGuidedExplanation = async (mode: ExplanationMode) => {
    const control = explanationControls.find((item) => item.id === mode);
    if (!control) return;

    setActiveExplanationMode(mode);
    setGuidedLoading(true);
    try {
      if (mode === 'simplify') {
        const { data } = await topicService.explainSimply(article?.title ?? topicTitle);
        setGuidedExplanation(data.data.explanation);
        return;
      }

      const { data } = await topicService.getGuidedExplanation(
        article?.extract || summary || topicTitle,
        `${article?.title ?? topicTitle}: ${control.label}`,
        control.instruction,
      );
      setGuidedExplanation(data.data.summary);
    } finally {
      setGuidedLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setQuizLoading(true);
    try {
      const { data } = await topicService.generateQuiz(article?.title ?? topicTitle, 5);
      setQuiz(data.data);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleGenerateNotes = async () => {
    setNotesLoading(true);
    setNotesSaved(false);
    try {
      const { data } = await topicService.getGuidedExplanation(
        article?.extract || summary || topicTitle,
        `${article?.title ?? topicTitle}: study notes`,
        'Create concise study notes with headings, bullet points, key terms, and a final revision checklist.',
      );
      setGeneratedNotes(data.data.summary);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!generatedNotes) return;

    setNotesLoading(true);
    try {
      await topicService.saveNote(
        article?.title ?? topicTitle,
        `${article?.title ?? topicTitle} study notes`,
        generatedNotes,
        ['ai-notes', currentPersona],
      );
      setNotesSaved(true);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!article) return;

    await learningService.addBookmark(
      String(article.title),
      article.title,
      article.url,
      article.thumbnail,
    );
    setBookmarked(true);
  };

  if (error) {
    return (
      <section className={`page reader-page density-${uiMode.density}`}>
        <Link className="button ghost inline" to="/"><ArrowLeft size={18} /> Back</Link>
        <div className="panel empty-state">
          <h1>Topic not found</h1>
          <p>{error}</p>
          <button className="button primary inline" onClick={() => openTopic('Artificial intelligence')} type="button">
            Try demo topic
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={`page topic-page density-${uiMode.density}`}>
      <Link className="button ghost inline" to="/"><ArrowLeft size={18} /> Back</Link>

      <section className="topic-hero">
        <div className={`topic-image ${loading ? 'skeleton' : ''}`}>
          {article?.thumbnail ? <img src={article.thumbnail} alt={article.title} /> : <span>{heroInitial}</span>}
        </div>
        <div className="topic-hero-copy">
          <span className="eyebrow">{loading ? 'Loading topic' : category}</span>
          <h1>{article?.title ?? topicTitle}</h1>
          <p>{article?.extract || 'Preparing the Wikipedia overview and your personalized learning path.'}</p>
          {loading && (
            <div className="skeleton-stack">
              <span />
              <span />
              <span />
            </div>
          )}
          <div className="adaptive-summary">
            <span>{explanationLevel} explanation</span>
            <span>{persona.learningGoals ? `Goal: ${persona.learningGoals}` : personaDescriptions[currentPersona]}</span>
          </div>
          <div className="actions-row">
            <button className="button secondary inline" disabled={!article || bookmarked} onClick={handleBookmark} type="button">
              <Bookmark size={18} /> {bookmarked ? 'Bookmarked' : 'Save Topic'}
            </button>
            <Link className="button primary inline" to={`/chat?topic=${encodeURIComponent(article?.title ?? topicTitle)}`}>
              <MessagesSquare size={18} /> Ask about this topic
            </Link>
          </div>
        </div>
      </section>

      <section className="topic-main-grid single">
        <article className="ai-summary-panel">
          <div className="section-title-row">
            <Brain size={22} />
            <h2>{readerMode === 'ai' ? 'AI Personalized Summary' : 'Original Wikipedia Content'}</h2>
          </div>
          <div className="reader-toggle" aria-label="Reader mode">
            <button className={readerMode === 'ai' ? 'active' : ''} onClick={() => setReaderMode('ai')} type="button">
              AI explanation
            </button>
            <button className={readerMode === 'original' ? 'active' : ''} onClick={() => setReaderMode('original')} type="button">
              Original Wikipedia
            </button>
          </div>
          {readerMode === 'ai' ? (
            <p className="summary-text">
              {summaryLoading ? (
                <span className="skeleton-stack">
                  <span />
                  <span />
                  <span />
                </span>
              ) : summary || fallbackSummary}
            </p>
          ) : (
            <div className="original-content">
              {originalBlocks.length > 0 ? originalBlocks.map((block) => (
                <div
                  dangerouslySetInnerHTML={{ __html: block.html }}
                  key={block.html.slice(0, 80)}
                  onClick={(event) => {
                    const target = event.target as HTMLElement;
                    const link = target.closest('a');
                    if (!link) return;
                    const href = link.getAttribute('href');
                    if (!href?.startsWith('/topic/')) return;
                    event.preventDefault();
                    const nextTitle = decodeURIComponent(href.replace('/topic/', ''));
                    openTopic(nextTitle);
                  }}
                />
              )) : (
                <p className="muted">Original Wikipedia text is loading or unavailable for this topic.</p>
              )}
            </div>
          )}
        </article>
      </section>

      <section className={`adaptive-layer persona-${currentPersona}`}>
        <div className="section-title-row">
          {isProfessor ? <FileText size={22} /> : isStudent ? <Layers size={22} /> : <Sparkles size={22} />}
          <h2>{isProfessor ? 'Professor Research View' : isStudent ? 'Student Learning Cards' : 'Adaptive Study View'}</h2>
        </div>
        <div className="adaptive-card-grid">
          {adaptiveCards.map((card) => (
            <article className="adaptive-card" key={card.title}>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-controls-panel">
        <div>
          <div className="section-title-row">
            <MessagesSquare size={22} />
            <h2>AI Explanation Controls</h2>
          </div>
          <p>Switch the AI response style without leaving the topic.</p>
        </div>
        <div className="explanation-control-row">
          {explanationControls.map((control) => (
            <button
              className={`button ${activeExplanationMode === control.id ? 'primary' : 'secondary'}`}
              disabled={guidedLoading}
              key={control.id}
              onClick={() => handleGuidedExplanation(control.id)}
              type="button"
            >
              {guidedLoading && activeExplanationMode === control.id ? 'Generating...' : control.label}
            </button>
          ))}
        </div>
        {guidedExplanation && <p className="result-box">{guidedExplanation}</p>}
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <PlayCircle size={22} />
          <h2>YouTube Learning Section</h2>
        </div>
        {selectedVideo && (
          <div className="video-player-panel">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
              title={selectedVideo.title}
            />
            <div>
              <strong>{selectedVideo.title}</strong>
              <p>{selectedVideo.channelTitle}</p>
              <div className="up-next-list">
                <span className="eyebrow">Up next</span>
                {videos
                  .filter((video) => video.videoId !== selectedVideo.videoId)
                  .slice(0, 2)
                  .map((video) => (
                    <button key={video.videoId} onClick={() => setSelectedVideo(video)} type="button">
                      {video.thumbnail && <img src={video.thumbnail} alt="" />}
                      <span>{video.title}</span>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
        <div className="video-grid">
          {loading ? [1, 2, 3].map((item) => (
            <div className="video-card skeleton-card" key={item}>
              <span />
              <strong />
              <small />
            </div>
          )) : visibleVideos.length > 0 ? visibleVideos.map((video) => (
            <button
              className={`video-card ${selectedVideo?.videoId === video.videoId ? 'active' : ''}`}
              key={video.videoId}
              onClick={() => setSelectedVideo(video)}
              type="button"
            >
              {video.thumbnail && <img src={video.thumbnail} alt="" />}
              <strong>{video.title}</strong>
              <span>{video.channelTitle}</span>
            </button>
          )) : videos.length === 0 ? (
            <div className="empty-state compact">
              <strong>No videos loaded</strong>
              <p>Videos will appear here when the YouTube API key is available.</p>
            </div>
          ) : null}
        </div>
      </section>

      <section className="action-panel">
        <div>
          <div className="section-title-row">
            <Wand2 size={22} />
            <h2>Simplify Button</h2>
          </div>
          <p>Ask WikiAI to explain the same topic in simpler words.</p>
        </div>
        <button className="button secondary" disabled={simpleLoading} onClick={handleSimplify} type="button">
          <Sparkles size={18} /> {simpleLoading ? 'Simplifying...' : 'Explain Simply'}
        </button>
        {simpleExplanation && <p className="result-box">{simpleExplanation}</p>}
      </section>

      <section className="action-panel">
        <div>
          <div className="section-title-row">
            <BookOpenCheck size={22} />
            <h2>Quiz Section</h2>
          </div>
          <p>Generate a short quiz from this topic and your current persona.</p>
        </div>
        <button className="button primary" disabled={quizLoading} onClick={handleGenerateQuiz} type="button">
          {quizLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
        {quiz && (
          <div className="quiz-list">
            {quiz.questions.map((question, index) => (
              <div className="quiz-card" key={`${quiz.id}-${question.question}`}>
                <strong>{index + 1}. {question.question}</strong>
                <div className="quiz-options">
                  {question.options.map((option, optionIndex) => (
                    <span className={optionIndex === question.correctIndex ? 'correct' : ''} key={option}>
                      {option}
                    </span>
                  ))}
                </div>
                <p>{question.explanation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="learning-toolkit">
        <div className="section-title-row">
          <Library size={22} />
          <h2>Educational Toolkit</h2>
        </div>

        <div className="toolkit-grid">
          <article className="toolkit-panel">
            <div className="section-title-row">
              <Layers size={20} />
              <h2>Flashcards</h2>
            </div>
            <div className="flashcard-grid">
              {flashcards.map((card) => (
                <div className="flashcard" key={card.front}>
                  <strong>{card.front}</strong>
                  <p>{card.back}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="toolkit-panel">
            <div className="section-title-row">
              <FileText size={20} />
              <h2>Notes Generator</h2>
            </div>
            <p>Generate compact AI study notes from this topic and save them to your notes.</p>
            <div className="actions-row">
              <button className="button secondary" disabled={notesLoading} onClick={handleGenerateNotes} type="button">
                {notesLoading ? 'Generating...' : 'Generate Notes'}
              </button>
              <button className="button ghost" disabled={notesLoading || !generatedNotes} onClick={handleSaveNotes} type="button">
                {notesSaved ? 'Saved' : 'Save Notes'}
              </button>
            </div>
            {generatedNotes && <p className="result-box">{generatedNotes}</p>}
          </article>
        </div>

        <div className="toolkit-grid">
          <article className="toolkit-panel">
            <div className="section-title-row">
              <CheckCircle2 size={20} />
              <h2>Revision Mode</h2>
            </div>
            <ol className="revision-list">
              {revisionSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>

          <article className="toolkit-panel">
            <div className="section-title-row">
              <GitFork size={20} />
              <h2>Mind Map</h2>
            </div>
            <div className="mind-map">
              {mindMapNodes.map((node) => (
                <span className={node.kind} key={`${node.kind}-${node.label}`}>{node.label}</span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="content-section">
        <h2>Related Topics</h2>
        <div className="topic-grid">
          {relatedTopics.length > 0 ? relatedTopics.map((item) => (
            <button className="topic-card" key={item.title} onClick={() => openTopic(item.title)} type="button">
              <strong>{item.title}</strong>
              <span>{stripTopicMarkup(item.description ?? item.snippet) || 'Open adaptive topic reader'}</span>
            </button>
          )) : (
            <div className="empty-state compact">
              <strong>No related topics yet</strong>
              <p>Try a demo topic like AI, Black Hole, Neural Networks, or Blockchain.</p>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};
