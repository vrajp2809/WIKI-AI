import {
  explanationStyleToLevel,
  personaUiModes,
} from '../constants/adaptive';
import { useAppStore } from '../store/app.store';
import { ExplanationLevel, Persona, PersonaLevel } from '../types/persona';

const fallbackPersona: Persona = {
  level: 'college_student',
  interests: [],
  preferredLang: 'en',
  learningGoals: null,
  explanationStyle: 'exam_focused',
};

export const usePersonaContext = () => {
  const persona = useAppStore((state) => state.persona) ?? fallbackPersona;
  const setPersona = useAppStore((state) => state.setPersona);
  const currentPersona: PersonaLevel = persona.level;
  const explanationLevel: ExplanationLevel =
    explanationStyleToLevel[persona.explanationStyle ?? 'exam_focused'];
  const uiMode = personaUiModes[currentPersona];

  return {
    currentPersona,
    explanationLevel,
    persona,
    setPersona,
    uiMode,
    isStudent: currentPersona === 'school_student',
    isProfessor: currentPersona === 'professor_researcher',
    isCasual: currentPersona === 'casual_learner',
  };
};
