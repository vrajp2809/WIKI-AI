import { ExplanationLevel, ExplanationStyle, PersonaLevel } from '../types/persona';

export const explanationLevelLabels: Record<ExplanationLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

export const explanationLevelToStyle: Record<ExplanationLevel, ExplanationStyle> = {
  beginner: 'simple',
  intermediate: 'exam_focused',
  expert: 'technical',
};

export const explanationStyleToLevel: Record<ExplanationStyle, ExplanationLevel> = {
  simple: 'beginner',
  exam_focused: 'intermediate',
  story_based: 'intermediate',
  technical: 'expert',
};

export const personaUiModes: Record<
  PersonaLevel,
  {
    density: 'visual' | 'balanced' | 'dense';
    homeTitle: string;
    searchPlaceholder: string;
    primaryAction: string;
    featureBadges: string[];
  }
> = {
  school_student: {
    density: 'visual',
    homeTitle: 'Learn a topic step by step',
    searchPlaceholder: 'Try photosynthesis, fractions, volcanoes...',
    primaryAction: 'Start learning',
    featureBadges: ['Visual cards', 'Quick quiz', 'Simple examples'],
  },
  college_student: {
    density: 'balanced',
    homeTitle: 'Prepare smarter from Wikipedia',
    searchPlaceholder: 'Search exam, interview, or concept topics...',
    primaryAction: 'Study topic',
    featureBadges: ['Key terms', 'Interview angles', 'Practice questions'],
  },
  professor_researcher: {
    density: 'dense',
    homeTitle: 'Explore topics with source-aware depth',
    searchPlaceholder: 'Search advanced concepts, methods, authors...',
    primaryAction: 'Open research view',
    featureBadges: ['Citations', 'Research links', 'Dense summaries'],
  },
  casual_learner: {
    density: 'visual',
    homeTitle: 'Explore anything, lightly',
    searchPlaceholder: 'Search a topic you are curious about...',
    primaryAction: 'Explore',
    featureBadges: ['Plain language', 'Stories', 'Curiosity trails'],
  },
};

export const trendingTopics = [
  'Artificial intelligence',
  'Climate change',
  'Photosynthesis',
  'Indian Constitution',
  'Quantum mechanics',
  'World War II',
];

export const personaRecommendations: Record<PersonaLevel, string[]> = {
  school_student: [
    'Photosynthesis',
    'Human digestive system',
    'Electric current',
    'Water cycle',
    'Solar system',
  ],
  college_student: [
    'Database normalization',
    'Operating system scheduling',
    'Machine learning',
    'Constitutional law',
    'Thermodynamics',
  ],
  professor_researcher: [
    'Transformer architecture',
    'CRISPR gene editing',
    'Graph neural network',
    'Bayesian inference',
    'Dark matter',
  ],
  casual_learner: [
    'Why is the sky blue',
    'History of coffee',
    'How airplanes fly',
    'Ancient Egypt',
    'Ocean currents',
  ],
};

export const searchSuggestionBank: Record<PersonaLevel, string[]> = {
  school_student: ['simple explanation', 'diagram', 'quiz', 'examples'],
  college_student: ['exam notes', 'interview questions', 'summary', 'applications'],
  professor_researcher: ['citations', 'recent research', 'methodology', 'limitations'],
  casual_learner: ['overview', 'fun facts', 'story', 'why it matters'],
};
