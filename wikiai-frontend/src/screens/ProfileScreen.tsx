import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Bookmark, BookOpen, Flame, StickyNote } from 'lucide-react';

import { PersonaPill } from '../components/PersonaPill';
import { ExplanationSwitcher } from '../components/ExplanationSwitcher';
import { explanationLevelLabels } from '../constants/adaptive';
import { explanationStyleLabels, personaDescriptions, personaLevels } from '../constants/personas';
import { useAuth } from '../hooks/useAuth';
import { usePersonaContext } from '../hooks/usePersonaContext';
import {
  Bookmark as SavedBookmark,
  LearningProgress,
  Note,
  TopTopic,
  learningService,
} from '../services/learning.service';
import { useAppStore } from '../store/app.store';

export const ProfileScreen = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const user = useAppStore((state) => state.user);
  const persona = useAppStore((state) => state.persona);
  const searchHistory = useAppStore((state) => state.searchHistory);
  const setPersona = useAppStore((state) => state.setPersona);
  const { explanationLevel, uiMode } = usePersonaContext();
  const activeLevel = persona?.level ?? 'school_student';
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [topTopics, setTopTopics] = useState<TopTopic[]>([]);
  const [bookmarks, setBookmarks] = useState<SavedBookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadLearning = async () => {
      const [progressResult, topicsResult, bookmarksResult, notesResult] = await Promise.allSettled([
        learningService.getProgress(),
        learningService.getTopTopics(),
        learningService.getBookmarks(),
        learningService.getNotes(),
      ]);

      if (!isMounted) return;
      if (progressResult.status === 'fulfilled') setProgress(progressResult.value.data.data);
      if (topicsResult.status === 'fulfilled') setTopTopics(topicsResult.value.data.data ?? []);
      if (bookmarksResult.status === 'fulfilled') setBookmarks(bookmarksResult.value.data.data ?? []);
      if (notesResult.status === 'fulfilled') setNotes(notesResult.value.data.data ?? []);
    };

    loadLearning();
    return () => {
      isMounted = false;
    };
  }, []);

  const streak = Math.min(
    30,
    new Set(searchHistory.map((item) => item.searchedAt.slice(0, 10))).size,
  );
  const topicsLearned = topTopics.length || searchHistory.length;
  const openTopic = (topic: string) => navigate(`/topic/${encodeURIComponent(topic)}`);

  return (
    <section className={`page density-${uiMode.density}`}>
      <div className="page-header">
        <h1>Profile</h1>
        <p>{user?.displayName ?? 'WikiAI Reader'}</p>
      </div>

      <section className="content-section">
        <h2>Learning persona</h2>
        {personaLevels.map((level) => (
          <button
            key={level}
            onClick={() =>
              setPersona({
                ...(persona ?? { interests: [], preferredLang: 'en', learningGoals: null }),
                level,
                explanationStyle: persona?.explanationStyle ?? 'exam_focused',
              })
            }
            className={`persona-card ${activeLevel === level ? 'active' : ''}`}
            type="button"
          >
            <PersonaPill level={level} />
            <span>{personaDescriptions[level]}</span>
          </button>
        ))}
      </section>

      <section className="content-section">
        <h2>Saved preferences</h2>
        <div className="panel">
          <ExplanationSwitcher />
          <p>Depth: {explanationLevelLabels[explanationLevel]}</p>
          <p>Style: {explanationStyleLabels[persona?.explanationStyle ?? 'exam_focused']}</p>
          <p>Interests: {persona?.interests?.length ? persona.interests.join(', ') : 'Not selected yet'}</p>
          <p>Goals: {persona?.learningGoals || 'Not added yet'}</p>
        </div>
      </section>

      <section className="learning-dashboard">
        <div className="section-title-row">
          <BarChart3 size={22} />
          <h2>Learning Progress</h2>
        </div>
        <div className="progress-grid">
          <article className="progress-card">
            <BookOpen size={20} />
            <strong>{topicsLearned}</strong>
            <span>Topics learned</span>
          </article>
          <article className="progress-card">
            <Flame size={20} />
            <strong>{streak}</strong>
            <span>Learning streak</span>
          </article>
          <article className="progress-card">
            <BarChart3 size={20} />
            <strong>{progress?.allTime.averageQuizScore ?? '--'}{progress?.allTime.averageQuizScore !== null && progress ? '%' : ''}</strong>
            <span>Quiz average</span>
          </article>
          <article className="progress-card">
            <Bookmark size={20} />
            <strong>{progress?.allTime.bookmarks ?? bookmarks.length}</strong>
            <span>Bookmarks</span>
          </article>
        </div>
        {progress && (
          <div className="activity-strip">
            <span>30 days</span>
            <strong>{progress.last30Days.reads}</strong> reads
            <strong>{progress.last30Days.quizzes}</strong> quizzes
            <strong>{progress.last30Days.chats}</strong> chats
            <strong>{progress.last30Days.searches}</strong> searches
          </div>
        )}
      </section>

      <section className="content-section">
        <h2>Continue Learning</h2>
        <div className="learning-list">
          {searchHistory.slice(0, 5).map((item) => (
            <button className="history-row" key={`${item.query}-${item.searchedAt}`} onClick={() => openTopic(item.query)} type="button">
              <strong>{item.query}</strong>
              <span>Resume adaptive reader</span>
            </button>
          ))}
          {searchHistory.length === 0 && <p className="muted">Recent topics will appear after you start learning.</p>}
        </div>
      </section>

      <div className="profile-learning-grid">
        <section className="content-section">
          <h2>Top Topics</h2>
          <div className="chips">
            {topTopics.map((item) => (
              <button className="chip" key={item.topic} onClick={() => openTopic(item.topic)} type="button">
                {item.topic} · {item.count}
              </button>
            ))}
            {topTopics.length === 0 && <p className="muted">Your strongest topics will appear here.</p>}
          </div>
        </section>

        <section className="content-section">
          <h2>Saved Topics</h2>
          <div className="learning-list">
            {bookmarks.slice(0, 5).map((item) => (
              <button className="history-row" key={item.id} onClick={() => openTopic(item.articleTitle)} type="button">
                <strong>{item.articleTitle}</strong>
                <span>Bookmarked topic</span>
              </button>
            ))}
            {bookmarks.length === 0 && <p className="muted">Save topics from the topic screen to build your library.</p>}
          </div>
        </section>
      </div>

      <section className="content-section">
        <div className="section-title-row">
          <StickyNote size={22} />
          <h2>Saved Notes</h2>
        </div>
        <div className="notes-grid">
          {notes.slice(0, 4).map((note) => (
            <article className="note-card" key={note.id}>
              <strong>{note.title}</strong>
              <p>{note.content.slice(0, 180)}{note.content.length > 180 ? '...' : ''}</p>
              <span>{note.topic ?? 'General'} · {note.tags.join(', ') || 'study note'}</span>
            </article>
          ))}
          {notes.length === 0 && <p className="muted">Generated study notes will appear here after you save them.</p>}
        </div>
      </section>

      <button className="button secondary" onClick={logout} type="button">Sign out</button>
    </section>
  );
};
