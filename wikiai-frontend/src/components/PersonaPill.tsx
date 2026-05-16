import { personaLabels } from '../constants/personas';
import { PersonaLevel } from '../types/persona';

interface PersonaPillProps {
  level: PersonaLevel;
}

export const PersonaPill = ({ level }: PersonaPillProps) => (
  <span className="persona-pill">{personaLabels[level]}</span>
);
