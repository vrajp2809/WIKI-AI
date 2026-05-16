# WikiAI Backend

WikiAI Backend is a Node.js, Express, and TypeScript API for a personalized Wikipedia learning app. It uses MongoDB for data storage, Redis for caching/rate-limit support, and Ollama for local AI chat and embeddings.

## Main Features

- **Authentication**: register, login, refresh token, and logout with email/password.
- **User persona**: stores a learning level such as `school_student`, `college_student`, or `professor_researcher`.
- **Personalized AI**: explanations, summaries, chat replies, and quizzes are adapted to the user persona.
- **Wikipedia search**: searches Wikipedia topics and can fetch article content.
- **RAG pipeline**: chunks Wikipedia articles, stores embeddings in MongoDB, and retrieves relevant chunks for grounded chat responses.
- **YouTube videos**: fetches educational YouTube video recommendations for a topic.
- **Learning tools**: notes, bookmarks, quiz history, search history, and learning analytics.

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js + TypeScript |
| API | Express.js |
| Database | MongoDB + Mongoose |
| Cache | Redis |
| AI | Ollama |
| Validation | Zod |
| Auth | JWT access token + refresh token |
| Logging | Winston |

## Requirements

- Node.js 20+
- MongoDB
- Redis
- Ollama, for AI chat and embeddings
- YouTube Data API key, for video search

## Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Important values:

```env
PORT=3000
API_VERSION=v1
JWT_SECRET=your-long-secret
MONGODB_URI=mongodb://localhost:27017/wikiai_db
REDIS_URL=redis://localhost:6380

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen2.5:3b
OLLAMA_EMBEDDING_MODEL=qwen2.5:3b

YOUTUBE_API_KEY=your-youtube-api-key
ALLOWED_ORIGINS=http://localhost:8081,exp://localhost:19000
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start MongoDB and Redis with Docker:

```bash
docker compose up mongodb redis -d
```

The Compose Redis service is exposed on host port `6380`, so local `npm run dev`
uses `REDIS_URL=redis://localhost:6380`. When the API runs inside Compose, it
uses the internal Docker URL `redis://redis:6379`.

Start the development server:

```bash
npm run dev
```

Check the API:

```bash
curl http://localhost:3000/api/v1/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## Useful Scripts

```bash
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm start                # Run compiled app from dist
npm run test:connections # Test service connections
```

## API Overview

Base URL:

```txt
http://localhost:3000/api/v1
```

Most routes require:

```txt
Authorization: Bearer <accessToken>
```

### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Logout |

### User

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/users/me` | Get profile |
| PATCH | `/users/me` | Update profile |
| GET | `/users/me/persona` | Get persona |
| PUT | `/users/me/persona` | Update persona |

### Learning

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/search?q=topic` | Search Wikipedia |
| GET | `/search/history` | Get recent searches |
| POST | `/ai/summarize` | Summarize article text |
| POST | `/ai/explain` | Explain a topic |
| POST | `/chat/sessions` | Create chat session |
| POST | `/chat/sessions/:id/messages` | Send chat message |
| POST | `/quiz/generate` | Generate quiz |
| POST | `/quiz/:id/submit` | Submit quiz answers |
| GET | `/youtube/search?q=topic` | Fetch educational videos |

### User Content

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET/POST | `/notes` | List or create notes |
| PATCH/DELETE | `/notes/:id` | Update or delete note |
| GET/POST | `/bookmarks` | List or add bookmarks |
| DELETE | `/bookmarks/:articleId` | Remove bookmark |
| GET | `/analytics/progress` | Get learning progress |
| GET | `/analytics/topics` | Get top topics |

## Notes

- MongoDB is the only database used by this backend.
- The AI service currently uses Ollama locally.
- YouTube search requires a valid `YOUTUBE_API_KEY`.
- RAG storage currently keeps article chunks and embeddings in MongoDB.
