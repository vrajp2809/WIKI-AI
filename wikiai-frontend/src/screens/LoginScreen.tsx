import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { AuthShell } from '../components/AuthShell';
import { FormField } from '../components/FormField';
import { useAuth } from '../hooks/useAuth';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error?.message
        : undefined;
      setError(message ?? 'Login failed. Restart the backend and check that http://localhost:3000 is running.');
    }
  };

  return (
    <AuthShell
      title="Read Wikipedia at your level"
      subtitle="A clean study website that adapts explanations for students, college learners, and professors."
    >
      <form className="form-stack" onSubmit={handleLogin}>
        <div>
          <h2>Welcome back</h2>
          <p>Continue your personalized reading layer.</p>
        </div>
        <FormField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <FormField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <Link className="button ghost" to="/signup">
          Create account
        </Link>
      </form>
    </AuthShell>
  );
};
