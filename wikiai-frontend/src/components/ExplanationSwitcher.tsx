import axios from 'axios';
import { useState } from 'react';
import { Gauge } from 'lucide-react';

import {
  explanationLevelLabels,
  explanationLevelToStyle,
} from '../constants/adaptive';
import { userService } from '../services/user.service';
import { usePersonaContext } from '../hooks/usePersonaContext';
import { ExplanationLevel } from '../types/persona';

const levels: ExplanationLevel[] = ['beginner', 'intermediate', 'expert'];

export const ExplanationSwitcher = () => {
  const { explanationLevel, persona, setPersona } = usePersonaContext();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const switchLevel = async (level: ExplanationLevel) => {
    if (level === explanationLevel || isSaving) {
      return;
    }

    const nextPersona = {
      ...persona,
      explanationStyle: explanationLevelToStyle[level],
    };

    setPersona(nextPersona);
    setIsSaving(true);
    setError('');

    try {
      const response = await userService.updatePersona(nextPersona);
      setPersona(response.data.data);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : undefined;
      setError(message ?? 'Style saved locally. Restart backend to sync.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="explanation-switcher" aria-label="Explanation depth">
      <span><Gauge size={15} /> Depth</span>
      <div className="segmented-control">
        {levels.map((level) => (
          <button
            className={explanationLevel === level ? 'active' : ''}
            key={level}
            onClick={() => switchLevel(level)}
            type="button"
          >
            {explanationLevelLabels[level]}
          </button>
        ))}
      </div>
      {error ? <small>{error}</small> : null}
    </div>
  );
};
