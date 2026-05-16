import { useCallback, useState } from 'react';

import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { useAppStore } from '../store/app.store';

export const useAuth = () => {
  const setAuth = useAppStore((state) => state.setAuth);
  const logoutStore = useAppStore((state) => state.logout);
  const refreshToken = useAppStore((state) => state.refreshToken);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await authService.login(email, password);
        await setAuth(response.data.data);
        const [userResponse, personaResponse] = await Promise.all([
          userService.getMe(),
          userService.getPersona(),
        ]);
        useAppStore.getState().setUser(userResponse.data.data);
        useAppStore.getState().setPersona(personaResponse.data.data);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  const signup = useCallback(
    async (email: string, password: string, displayName: string) => {
      setIsLoading(true);
      try {
        const response = await authService.register(email, password, displayName);
        await setAuth(response.data.data);
        const [userResponse, personaResponse] = await Promise.all([
          userService.getMe(),
          userService.getPersona(),
        ]);
        useAppStore.getState().setUser(userResponse.data.data);
        useAppStore.getState().setPersona(personaResponse.data.data);
      } finally {
        setIsLoading(false);
      }
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    if (refreshToken) {
      authService.logout(refreshToken).catch(() => undefined);
    }
    await logoutStore();
  }, [logoutStore, refreshToken]);

  return { login, signup, logout, isLoading };
};
