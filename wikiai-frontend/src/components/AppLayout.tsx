import { Home, LogOut, MessageCircle, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { ExplanationSwitcher } from './ExplanationSwitcher';
import { PersonaPill } from './PersonaPill';
import { useAuth } from '../hooks/useAuth';
import { usePersonaContext } from '../hooks/usePersonaContext';

export const AppLayout = () => (
  <AppLayoutContent />
);

const AppLayoutContent = () => {
  const { logout } = useAuth();
  const { currentPersona, uiMode } = usePersonaContext();

  return (
    <div className={`app-shell density-${uiMode.density}`}>
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">W</div>
          <div>
            <strong>WikiAI</strong>
            <span>Personalized Wikipedia</span>
          </div>
        </div>

        <div className="sidebar-persona">
          <PersonaPill level={currentPersona} />
          <ExplanationSwitcher />
        </div>

        <nav className="nav-links" aria-label="Primary navigation">
          <NavLink to="/" end>
            <Home size={18} />
            Home
          </NavLink>
          <NavLink to="/chat">
            <MessageCircle size={18} />
            Chat
          </NavLink>
          <NavLink to="/profile">
            <UserRound size={18} />
            Profile
          </NavLink>
        </nav>

        <button className="sidebar-logout" onClick={logout} type="button">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className="main-surface">
        <Outlet />
      </main>
    </div>
  );
};
