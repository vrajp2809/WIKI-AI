import { z } from 'zod';

// ========================
// PERSONA
// ========================
export const PersonaLevelEnum = z.enum([
  'school_student',
  'college_student',
  'professor_researcher',
  'casual_learner',
]);
export type PersonaLevel = z.infer<typeof PersonaLevelEnum>;

export const ExplanationStyleEnum = z.enum([
  'simple',
  'exam_focused',
  'technical',
  'story_based',
]);
export type ExplanationStyle = z.infer<typeof ExplanationStyleEnum>;

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Persona {
  id: string;
  userId: string;
  level: PersonaLevel;
  interests: string[];
  preferredLang: string;
  learningGoals: string | null;
  explanationStyle: ExplanationStyle;
  updatedAt: Date;
}

// ========================
// AUTH
// ========================
export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  displayName: z.string().min(2).max(100),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

// ========================
// PERSONA
// ========================
export const UpdatePersonaSchema = z.object({
  level: PersonaLevelEnum,
  interests: z.array(z.string()).max(10).optional(),
  preferredLang: z.string().length(2).optional(),
  learningGoals: z.string().max(500).optional(),
  explanationStyle: ExplanationStyleEnum.optional(),
});

// ========================
// CHAT
// ========================
export type MessageRole = 'user' | 'assistant';

export interface ChatSession {
  id: string;
  userId: string;
  topic: string | null;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  tokensUsed?: number;
  metadata?: {
    sources?: Array<{
      articleTitle: string;
      similarity: number;
      excerpt: string;
    }>;
    topic?: string | null;
    title?: string | null;
    ragUsed?: boolean;
  } & Record<string, unknown>;
  createdAt: Date;
}

export const SendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  topic: z.string().max(255).optional(),
});

export const CreateSessionSchema = z.object({
  topic: z.string().max(255).optional(),
  title: z.string().max(255).optional(),
});

// ========================
// QUIZ
// ========================
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  topic: string | null;
  personaLevel: string | null;
  questions: QuizQuestion[];
  score: number | null;
  total: number | null;
  completedAt: Date | null;
  createdAt: Date;
}

export const GenerateQuizSchema = z.object({
  topic: z.string().min(1).max(255),
  questionCount: z.number().int().min(3).max(10).default(5),
});

export const SubmitQuizSchema = z.object({
  answers: z.array(z.number().int().min(0).max(3)),
});

// ========================
// NOTES
// ========================
export interface Note {
  id: string;
  userId: string;
  topic: string | null;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const CreateNoteSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().default(''),
  topic: z.string().max(255).optional(),
  tags: z.array(z.string()).max(10).default([]),
});

export const UpdateNoteSchema = CreateNoteSchema.partial();

// ========================
// BOOKMARKS
// ========================
export interface Bookmark {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string | null;
  thumbnail: string | null;
  createdAt: Date;
}

export const CreateBookmarkSchema = z.object({
  articleId: z.string().min(1),
  articleTitle: z.string().min(1),
  articleUrl: z.string().url().optional(),
  thumbnail: z.string().url().optional(),
});

// ========================
// AI
// ========================
export const SummarizeSchema = z.object({
  articleText: z.string().min(1).max(50000),
  articleTitle: z.string().min(1),
  personaLevel: PersonaLevelEnum.optional(),
  explanationStyle: ExplanationStyleEnum.optional(),
});

export const ExplainSchema = z.object({
  topic: z.string().min(1).max(255),
});

// ========================
// SEARCH
// ========================
export const SearchSchema = z.object({
  q: z.string().min(1).max(255),
  limit: z.string().default('10').transform(Number),
});

// ========================
// API RESPONSE
// ========================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const ok = <T>(data: T, meta?: ApiResponse['meta']): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

export const fail = (
  code: string,
  message: string,
  details?: unknown
): ApiResponse => ({
  success: false,
  error: { code, message, details },
});
