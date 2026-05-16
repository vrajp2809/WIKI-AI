import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import { AppLayout } from './components/AppLayout';
import { ChatScreen } from './screens/ChatScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SignupScreen } from './screens/SignupScreen';
import { TopicScreen } from './screens/TopicScreen';
import { selectIsAuthenticated, useAppStore } from './store/app.store';

export const App = () => {
  const isAuthenticated = useAppStore(selectIsAuthenticated);
  const persona = useAppStore((state) => state.persona);
  const onboardingTarget =
    persona?.interests?.length && persona.learningGoals && persona.explanationStyle
      ? '/'
      : '/onboarding';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to={onboardingTarget} replace /> : <LoginScreen />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={onboardingTarget} replace /> : <SignupScreen />} />
        <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/topic/:title" element={<TopicScreen />} />
          <Route path="/chat" element={<ChatScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Route>
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
      </Routes>
    </Router>
  );
};
