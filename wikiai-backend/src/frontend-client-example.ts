/**
 * WikiAI React Native - API Client
 * Place this file in your Expo app at: src/api/client.ts
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${token}`,
          };
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;

        await AsyncStorage.multiSet([
          ['accessToken', accessToken],
          ['refreshToken', newRefreshToken],
        ]);

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Navigate to login screen
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// =====================
// AUTH
// =====================
export const authApi = {
  register: (email: string, password: string, displayName: string) =>
    api.post('/auth/register', { email, password, displayName }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// =====================
// USER / PERSONA
// =====================
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    api.patch('/users/me', data),
  getPersona: () => api.get('/users/me/persona'),
  updatePersona: (data: any) => api.put('/users/me/persona', data),
};

// =====================
// SEARCH
// =====================
export const searchApi = {
  search: (q: string, limit = 10) => api.get('/search', { params: { q, limit } }),
  history: () => api.get('/search/history'),
};

// =====================
// AI
// =====================
export const aiApi = {
  summarize: (articleTitle: string, articleText: string) =>
    api.post('/ai/summarize', { articleTitle, articleText }),
  explain: (topic: string) => api.post('/ai/explain', { topic }),
};

// =====================
// CHAT
// =====================
export const chatApi = {
  getSessions: () => api.get('/chat/sessions'),
  createSession: (topic?: string, title?: string) =>
    api.post('/chat/sessions', { topic, title }),
  getSession: (id: string) => api.get(`/chat/sessions/${id}`),
  sendMessage: (sessionId: string, content: string) =>
    api.post(`/chat/sessions/${sessionId}/messages`, { content }),
};

// =====================
// QUIZ
// =====================
export const quizApi = {
  generate: (topic: string, questionCount = 5) =>
    api.post('/quiz/generate', { topic, questionCount }),
  submit: (quizId: string, answers: number[]) =>
    api.post(`/quiz/${quizId}/submit`, { answers }),
  history: () => api.get('/quiz/history'),
};

// =====================
// NOTES
// =====================
export const notesApi = {
  getAll: () => api.get('/notes'),
  create: (data: { title: string; content: string; topic?: string; tags?: string[] }) =>
    api.post('/notes', data),
  update: (id: string, data: any) => api.patch(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
};

// =====================
// BOOKMARKS
// =====================
export const bookmarksApi = {
  getAll: () => api.get('/bookmarks'),
  add: (data: { articleId: string; articleTitle: string; articleUrl?: string; thumbnail?: string }) =>
    api.post('/bookmarks', data),
  remove: (articleId: string) => api.delete(`/bookmarks/${articleId}`),
};

// =====================
// YOUTUBE
// =====================
export const youtubeApi = {
  search: (q: string, limit = 5) => api.get('/youtube/search', { params: { q, limit } }),
};

// =====================
// ANALYTICS
// =====================
export const analyticsApi = {
  getProgress: () => api.get('/analytics/progress'),
  getTopTopics: () => api.get('/analytics/topics'),
};

export default api;
