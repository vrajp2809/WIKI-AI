import { Persona } from './persona';

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthStatePayload {
  user: User | null;
  persona: Persona | null;
  tokens: AuthTokens;
}
