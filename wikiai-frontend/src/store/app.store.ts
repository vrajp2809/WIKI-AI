import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AuthTokens, User } from '../types/auth';
import { Persona } from '../types/persona';
import { SearchHistoryItem } from '../types/search';

interface AppState {
  user: User | null;
  persona: Persona | null;
  accessToken: string | null;
  refreshToken: string | null;
  searchHistory: SearchHistoryItem[];
  setAuth: (tokens: AuthTokens, user?: User | null, persona?: Persona | null) => Promise<void>;
  setUser: (user: User | null) => void;
  setPersona: (persona: Persona | null) => void;
  addSearch: (query: string) => void;
  clearSearchHistory: () => void;
  logout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      persona: null,
      accessToken: null,
      refreshToken: null,
      searchHistory: [],
      setAuth: async (tokens, user = null, persona = null) => {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          persona,
        });
      },
      setUser: (user) => set({ user }),
      setPersona: (persona) => set({ persona }),
      addSearch: (query) => {
        const cleanQuery = query.trim();
        if (!cleanQuery) {
          return;
        }

        const nextItem = {
          query: cleanQuery,
          searchedAt: new Date().toISOString(),
        };
        const existing = get().searchHistory.filter(
          (item) => item.query.toLowerCase() !== cleanQuery.toLowerCase(),
        );

        set({ searchHistory: [nextItem, ...existing].slice(0, 12) });
      },
      clearSearchHistory: () => set({ searchHistory: [] }),
      logout: async () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          persona: null,
          accessToken: null,
          refreshToken: null,
          searchHistory: [],
        });
      },
    }),
    {
      name: 'wikiai-app-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        persona: state.persona,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        searchHistory: state.searchHistory,
      }),
    },
  ),
);

export const selectIsAuthenticated = (state: AppState) => Boolean(state.accessToken);
