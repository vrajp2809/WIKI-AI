import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { AuthShell } from '../components/AuthShell';
import { FormField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';

export const SignupScreen = () => {
  const { signup, isLoading } = useAuth();
  const [displayName, setDisplayName] = useState('Test User');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signup(email, password, displayName);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : undefined;
      setError(message ?? 'Signup failed. Restart the backend and check that http://localhost:3000 is running.');
    }
  };

  return (
    <AuthShell
      title="Build a learner profile"
      subtitle="Your persona decides whether the same Wikipedia topic feels simple, academic, or research-heavy."
    >
      <form className="form-stack" onSubmit={handleSignup}>
        <div>
          <h2>Create account</h2>
          <p>Start with a profile, then tune the app for your learning level.</p>
        </div>
        <FormField label="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
        <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <FormField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create account'}
        </button>
        <Link className="button ghost" to="/login">
          I already have an account
        </Link>
      </form>
    </AuthShell>
  );
};
