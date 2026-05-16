import { ExplanationStyle, PersonaLevel } from '../types/persona';

export const personaLabels: Record<PersonaLevel, string> = {
  school_student: 'School Student',
  college_student: 'College Student',
  professor_researcher: 'Professor',
  casual_learner: 'Casual Learner',
};

export const personaDescriptions: Record<PersonaLevel, string> = {
  school_student: 'Simple explanations, examples, quizzes, and friendly pacing.',
  college_student: 'Structured concepts, terminology, and useful context.',
  professor_researcher: 'Dense explanations, citations, source trails, and research framing.',
  casual_learner: 'Simplified exploration, stories, and practical everyday examples.',
};

export const personaPurposes: Record<PersonaLevel, string> = {
  school_student: 'Simple learning',
  college_student: 'Exam and interview preparation',
  professor_researcher: 'Technical and research depth',
  casual_learner: 'Simplified exploration',
};

export const personaLevels: PersonaLevel[] = [
  'school_student',
  'college_student',
  'professor_researcher',
  'casual_learner',
];

export const explanationStyleLabels: Record<ExplanationStyle, string> = {
  simple: 'Simple',
  exam_focused: 'Exam focused',
  technical: 'Technical',
  story_based: 'Story based',
};

export const explanationStyleDescriptions: Record<ExplanationStyle, string> = {
  simple: 'Clear steps, plain words, and less jargon.',
  exam_focused: 'Key terms, likely questions, and structured answers.',
  technical: 'Mechanisms, nuance, and precise vocabulary.',
  story_based: 'Analogies, narrative flow, and curiosity-led exploration.',
};

export const explanationStyles: ExplanationStyle[] = [
  'simple',
  'exam_focused',
  'technical',
  'story_based',
];
