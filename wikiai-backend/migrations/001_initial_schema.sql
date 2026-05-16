-- WikiAI Database Schema
-- Run this file to initialize the database

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================
-- USERS
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name  VARCHAR(100),
  avatar_url    TEXT,
  is_verified   BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- REFRESH TOKENS
-- =====================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked    BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- =====================
-- PERSONAS
-- =====================
CREATE TABLE IF NOT EXISTS personas (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  level           VARCHAR(50) NOT NULL DEFAULT 'college_student',
  interests       TEXT[] DEFAULT '{}',
  preferred_lang  VARCHAR(10) DEFAULT 'en',
  learning_goals  TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- ARTICLE CHUNKS (RAG)
-- =====================
CREATE TABLE IF NOT EXISTS article_chunks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id    VARCHAR(100) NOT NULL,
  article_title TEXT NOT NULL,
  chunk_index   INTEGER NOT NULL,
  chunk_text    TEXT NOT NULL,
  embedding     vector(1536),
  metadata      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, chunk_index)
);
CREATE INDEX IF NOT EXISTS idx_article_chunks_article_id ON article_chunks(article_id);
CREATE INDEX IF NOT EXISTS idx_article_chunks_embedding ON article_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =====================
-- CHAT SESSIONS
-- =====================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  topic      VARCHAR(255),
  title      VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- =====================
-- CHAT MESSAGES
-- =====================
CREATE TABLE IF NOT EXISTS chat_messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role        VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  tokens_used INTEGER,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- =====================
-- QUIZZES
-- =====================
CREATE TABLE IF NOT EXISTS quizzes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  topic         VARCHAR(255),
  persona_level VARCHAR(50),
  questions     JSONB NOT NULL DEFAULT '[]',
  user_answers  JSONB DEFAULT '[]',
  score         INTEGER,
  total         INTEGER,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);

-- =====================
-- NOTES
-- =====================
CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  topic      VARCHAR(255),
  title      VARCHAR(255) NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  tags       TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);

-- =====================
-- BOOKMARKS
-- =====================
CREATE TABLE IF NOT EXISTS bookmarks (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  article_id    VARCHAR(100) NOT NULL,
  article_title TEXT NOT NULL,
  article_url   TEXT,
  thumbnail     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, article_id)
);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id);

-- =====================
-- RECENT SEARCHES
-- =====================
CREATE TABLE IF NOT EXISTS recent_searches (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  query      VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recent_searches_user_id ON recent_searches(user_id);

-- =====================
-- LEARNING EVENTS (Analytics)
-- =====================
CREATE TABLE IF NOT EXISTS learning_events (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  topic      VARCHAR(255),
  metadata   JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_created_at ON learning_events(created_at);
