export type PersonaLevel = 'school_student' | 'college_student' | 'professor_researcher' | 'casual_learner';

export type ExplanationStyle = 'simple' | 'exam_focused' | 'technical' | 'story_based';

export type ExplanationLevel = 'beginner' | 'intermediate' | 'expert';

export interface Persona {
  id?: string;
  userId?: string;
  level: PersonaLevel;
  interests: string[];
  preferredLang: string;
  learningGoals: string | null;
  explanationStyle: ExplanationStyle;
  updatedAt?: string;
}
