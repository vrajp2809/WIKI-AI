import { ReactNode } from 'react';

interface AuthShellProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthShell = ({ children, title, subtitle }: AuthShellProps) => (
  <main className="auth-page">
    <section className="auth-story">
      <div className="brand large">
        <div className="brand-mark">W</div>
        <div>
          <strong>WikiAI</strong>
          <span>Learning layer for Wikipedia</span>
        </div>
      </div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </section>

    <section className="auth-panel">{children}</section>
  </main>
);
