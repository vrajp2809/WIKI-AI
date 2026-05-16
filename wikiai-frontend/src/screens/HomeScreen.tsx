import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  personaRecommendations,
  trendingTopics,
} from '../constants/adaptive';
import { personaDescriptions } from '../constants/personas';
import { usePersonaContext } from '../hooks/usePersonaContext';
import { useAppStore } from '../store/app.store';

const popularTopics = ['Artificial intelligence', 'Human brain', 'Blockchain', 'Evolution', 'Data structures'];
const topicImages: Record<string, string> = {
  'Artificial intelligence': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80',
  'Human brain': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80',
  Blockchain: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80',
  Evolution: 'https://images.unsplash.com/photo-1529528744093-6f8abeee511d?auto=format&fit=crop&w=900&q=80',
  'Data structures': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'Climate change': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  Photosynthesis: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80',
  'Indian Constitution': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
  'Quantum mechanics': 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80',
  'World War II': 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=900&q=80',
  'Black hole': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80',
  'Neural network': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80',
  Biology: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=900&q=80',
  Mathematics: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80',
  maths: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80',
  Exam: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
  sort: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  'Human digestive system': 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=900&q=80',
  'Electric current': 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
  'Water cycle': 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
  'Solar system': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  'Database normalization': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
  'Operating system scheduling': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80',
  'Machine learning': 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80',
  'Constitutional law': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80',
  Thermodynamics: 'https://images.unsplash.com/photo-1581093458791-9f3c3aeaf31a?auto=format&fit=crop&w=900&q=80',
};
const fallbackTopicImages = [
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=900&q=80',
];
const displayTopicName = (title: string) => {
  const cleanTitle = title.trim();
  const corrections: Record<string, string> = {
    exma: 'Exam',
    maths: 'Mathematics',
  };
  return corrections[cleanTitle.toLowerCase()] ?? cleanTitle;
};
const fallbackImageFor = (title: string) => {
  const seed = [...title].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return fallbackTopicImages[seed % fallbackTopicImages.length];
};
const demoTopics = [
  { title: 'Artificial intelligence', label: 'AI', detail: 'Adaptive summaries, tutor chat, and study tools' },
  { title: 'Black hole', label: 'Black Hole', detail: 'Student and professor explanations' },
  { title: 'Neural network', label: 'Neural Networks', detail: 'Examples, quiz, and mind map' },
  { title: 'Blockchain', label: 'Blockchain', detail: 'Real-world explanation topic' },
];
const topicCollections = [
  {
    name: 'Science',
    detail: 'Core concepts with diagrams, simple explanations, and quiz-ready notes.',
    topics: [
      { title: 'Black hole', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=900&q=80' },
      { title: 'Photosynthesis', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80' },
      { title: 'Human brain', image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80' },
      { title: 'Climate change', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80' },
      { title: 'Quantum mechanics', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    name: 'Maths',
    detail: 'Practice definitions, formulas, examples, and interview-style questions.',
    topics: [
      { title: 'Calculus', image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=900&q=80' },
      { title: 'Linear algebra', image: 'https://images.unsplash.com/photo-1635070041409-e63e783ce3c1?auto=format&fit=crop&w=900&q=80' },
      { title: 'Probability', image: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80' },
      { title: 'Prime number', image: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?auto=format&fit=crop&w=900&q=80' },
      { title: 'Pythagorean theorem', image: 'https://images.unsplash.com/photo-1561089489-f13d5e730d72?auto=format&fit=crop&w=900&q=80' },
    ],
  },
  {
    name: 'Technology',
    detail: 'Modern engineering topics explained from beginner to research depth.',
    topics: [
      { title: 'Artificial intelligence', image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=900&q=80' },
      { title: 'Neural network', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80' },
      { title: 'Blockchain', image: 'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=900&q=80' },
      { title: 'Database normalization', image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80' },
      { title: 'Operating system', image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80' },
    ],
  },
];

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { currentPersona, persona, uiMode, isProfessor, isStudent } = usePersonaContext();
  const addSearch = useAppStore((state) => state.addSearch);
  const [query, setQuery] = useState('');

  const recommendations = [
    ...persona.interests,
    ...personaRecommendations[currentPersona],
  ].filter(Boolean).slice(0, 8);

  const openTopic = (title: string) => {
    const cleanTitle = displayTopicName(title);
    if (!cleanTitle) {
      return;
    }

    addSearch(cleanTitle);
    navigate(`/topic/${encodeURIComponent(cleanTitle)}`);
  };
  const imageStyle = (title: string) => {
    const displayTitle = displayTopicName(title);
    const imageUrl = topicImages[displayTitle] ?? topicImages[title] ?? fallbackImageFor(displayTitle);
    return {
      backgroundImage: `linear-gradient(180deg, rgba(10, 20, 18, 0.06), rgba(9, 18, 16, 0.78)), url(${imageUrl})`,
    };
  };

  return (
    <section className={`page home-page density-${uiMode.density}`}>
      <form
        className="smart-search-panel home-search-first"
        onSubmit={(event) => {
          event.preventDefault();
          openTopic(query);
        }}
      >
        <label className="field">
          <span>Search Wikipedia</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={uiMode.searchPlaceholder}
          />
        </label>
        <button className="button primary" type="submit">{uiMode.primaryAction}</button>
      </form>

      <div className="home-hero compact">
        <div className="page-header">
          <span className="eyebrow">Adaptive learning home</span>
          <h1>{uiMode.homeTitle}</h1>
          <p>{personaDescriptions[currentPersona]}</p>
        </div>
        <div className="adaptive-summary">
          {uiMode.featureBadges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        {!persona.learningGoals ? (
          <button className="button secondary inline" onClick={() => navigate('/onboarding')} type="button">
            Complete onboarding
          </button>
        ) : null}
      </div>

      <section className="demo-strip">
        <div>
          <span className="eyebrow">Featured topics</span>
          <h2>Start with a strong learning path</h2>
        </div>
        <div className="demo-topic-grid">
          {demoTopics.map((item) => (
            <button className="demo-topic-card image-topic-card" key={item.title} onClick={() => openTopic(item.title)} style={imageStyle(item.title)} type="button">
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2>Browse by subject</h2>
        {topicCollections.map((group) => (
          <article className="subject-showcase" key={group.name}>
            <div className="subject-heading">
              <strong>{group.name}</strong>
              <span>{group.detail}</span>
            </div>
            <div className="subject-card-row">
              {group.topics.map((topic) => (
                <button
                  className="subject-topic-card"
                  key={topic.title}
                  onClick={() => openTopic(topic.title)}
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(10, 20, 18, 0.08), rgba(9, 18, 16, 0.78)), url(${topic.image})` }}
                  type="button"
                >
                  <strong>{topic.title}</strong>
                  <span>{isProfessor ? 'Open research view' : isStudent ? 'Study with cards' : 'Open adaptive topic'}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="content-section">
        <h2>{isProfessor ? 'Research trends' : 'Trending topics'}</h2>
        <div className="topic-grid wide-topic-grid">
          {trendingTopics.map((item) => (
            <button className="topic-card image-topic-card" key={item} onClick={() => openTopic(item)} style={imageStyle(item)} type="button">
              <strong>{item}</strong>
              <span>{isProfessor ? 'Open with citations and research framing' : 'Open adaptive topic reader'}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2>Recommended for you</h2>
        <div className="recommendation-row">
          {recommendations.map((item) => (
            <button className="recommendation-card image-topic-card" key={item} onClick={() => openTopic(item)} style={imageStyle(item)} type="button">
              <strong>{displayTopicName(item)}</strong>
              <span>
                {isProfessor
                  ? 'Advanced source trail'
                  : isStudent
                    ? 'Simplified learning path'
                    : 'Personalized overview'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2>Popular searches</h2>
        <div className="popular-search-grid">
          {popularTopics.map((item) => (
            <button className="popular-search-card image-topic-card" key={item} onClick={() => openTopic(item)} style={imageStyle(item)} type="button">
              <strong>{item}</strong>
              <span>Explore topic</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
};
