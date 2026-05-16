import { api } from './api';
import { ApiEnvelope } from '../types/api';
import { AuthTokens } from '../types/auth';

export const authService = {
  register: (email: string, password: string, displayName: string) =>
    api.post<ApiEnvelope<AuthTokens>>('/auth/register', { email, password, displayName }),
  login: (email: string, password: string) =>
    api.post<ApiEnvelope<AuthTokens>>('/auth/login', { email, password }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post<ApiEnvelope<AuthTokens>>('/auth/refresh', { refreshToken }),
};
