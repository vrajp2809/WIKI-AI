import { api } from './api';
import { ApiEnvelope } from '../types/api';
import { User } from '../types/auth';
import { Persona } from '../types/persona';

export const userService = {
  getMe: () => api.get<ApiEnvelope<User>>('/users/me'),
  updateMe: (data: Partial<Pick<User, 'displayName' | 'avatarUrl'>>) =>
    api.patch<ApiEnvelope<User>>('/users/me', data),
  getPersona: () => api.get<ApiEnvelope<Persona>>('/users/me/persona'),
  updatePersona: (data: Partial<Persona> & Pick<Persona, 'level'>) =>
    api.put<ApiEnvelope<Persona>>('/users/me/persona', data),
};
