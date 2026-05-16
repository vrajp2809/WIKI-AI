import axios from 'axios';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  explanationLevelLabels,
  explanationLevelToStyle,
  explanationStyleToLevel,
} from '../constants/adaptive';
import {
  explanationStyleDescriptions,
  explanationStyleLabels,
  personaDescriptions,
  personaLabels,
  personaLevels,
  personaPurposes,
} from '../constants/personas';
import { userService } from '../services/user.service';
import { useAppStore } from '../store/app.store';
import { ExplanationLevel, PersonaLevel } from '../types/persona';

const suggestedInterests = [
  'Science',
  'History',
  'Technology',
  'Mathematics',
  'Biology',
  'Current affairs',
  'Literature',
  'Research papers',
];

export const OnboardingScreen = () => {
  const navigate = useNavigate();
  const persona = useAppStore((state) => state.persona);
  const setPersona = useAppStore((state) => state.setPersona);
  const [level, setLevel] = useState<PersonaLevel>(persona?.level ?? 'college_student');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(
    explanationStyleToLevel[persona?.explanationStyle ?? 'exam_focused'],
  );
  const [interests, setInterests] = useState<string[]>(persona?.interests ?? []);
  const [customInterest, setCustomInterest] = useState('');
  const [learningGoals, setLearningGoals] = useState(persona?.learningGoals ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const canSave = useMemo(() => level && explanationLevel && interests.length > 0 && learningGoals.trim().length > 0, [
    explanationLevel,
    interests.length,
    learningGoals,
    level,
  ]);

  const toggleInterest = (interest: string) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest].slice(0, 10),
    );
  };

  const addCustomInterest = () => {
    const next = customInterest.trim();
    if (!next || interests.includes(next) || interests.length >= 10) {
      setCustomInterest('');
      return;
    }
    setInterests((current) => [...current, next]);
    setCustomInterest('');
  };

  const saveOnboarding = async () => {
    if (!canSave) {
      setError('Choose a persona, at least one interest, a learning goal, and an explanation style.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      const response = await userService.updatePersona({
        level,
        interests,
        preferredLang: 'en',
        learningGoals: learningGoals.trim(),
        explanationStyle: explanationLevelToStyle[explanationLevel],
      });
      setPersona(response.data.data);
      navigate('/');
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : undefined;
      setError(message ?? 'Could not save onboarding. Restart the backend and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="page onboarding-page">
      <div className="page-header">
        <span className="eyebrow">Personal setup</span>
        <h1>Shape WikiAI around how you learn.</h1>
        <p>These choices control explanation depth, examples, quizzes, and the reading layer we build in the next phases.</p>
      </div>

      <section className="onboarding-section">
        <div>
          <h2>Choose your role</h2>
          <p>Pick the closest mode. You can change it later.</p>
        </div>
        <div className="option-grid">
          {personaLevels.map((item) => (
            <button
              className={`option-card ${level === item ? 'active' : ''}`}
              key={item}
              onClick={() => setLevel(item)}
              type="button"
            >
              <strong>{personaLabels[item]}</strong>
              <span>{personaPurposes[item]}</span>
              <small>{personaDescriptions[item]}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="onboarding-section">
        <div>
          <h2>Pick interests</h2>
          <p>Choose up to ten topics so examples feel closer to your world.</p>
        </div>
        <div className="chips">
          {suggestedInterests.map((interest) => (
            <button
              className={`chip ${interests.includes(interest) ? 'active' : ''}`}
              key={interest}
              onClick={() => toggleInterest(interest)}
              type="button"
            >
              {interest}
            </button>
          ))}
        </div>
        <div className="inline-field">
          <input
            value={customInterest}
            onChange={(event) => setCustomInterest(event.target.value)}
            placeholder="Add your own interest"
          />
          <button className="button secondary" onClick={addCustomInterest} type="button">Add</button>
        </div>
      </section>

      <section className="onboarding-section">
        <div>
          <h2>Explanation depth</h2>
          <p>Switch instantly later from the sidebar: Beginner, Intermediate, or Expert.</p>
        </div>
        <div className="option-grid">
          {(['beginner', 'intermediate', 'expert'] as ExplanationLevel[]).map((item) => {
            const style = explanationLevelToStyle[item];
            return (
            <button
              className={`option-card compact ${explanationLevel === item ? 'active' : ''}`}
              key={item}
              onClick={() => setExplanationLevel(item)}
              type="button"
            >
              <strong>{explanationLevelLabels[item]}</strong>
              <span>{explanationStyleLabels[style]}</span>
              <small>{explanationStyleDescriptions[style]}</small>
            </button>
          )})}
        </div>
      </section>

      <section className="onboarding-section">
        <label className="field">
          <span>Learning goals</span>
          <textarea
            value={learningGoals}
            onChange={(event) => setLearningGoals(event.target.value)}
            placeholder="Example: I want to understand biology topics for exams and interviews."
            rows={5}
          />
        </label>
      </section>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="actions-row">
        <button className="button primary" onClick={saveOnboarding} disabled={isSaving} type="button">
          {isSaving ? 'Saving...' : 'Save preferences'}
        </button>
        <button className="button ghost" onClick={() => navigate('/')} type="button">Skip for now</button>
      </div>
    </section>
  );
};
