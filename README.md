# WikiAI - Personalized Wikipedia Learning Platform

WikiAI is a full-stack learning platform that redesigns Wikipedia into an adaptive study experience. It combines persona-based explanations, AI chat, quiz generation, bookmarks, notes, analytics, and YouTube learning recommendations on top of Wikipedia content.

## What This Project Does

- Searches Wikipedia topics and opens topic pages with summaries and original content.
- Adapts explanations for different learner personas such as school student, college student, professor researcher, and casual learner.
- Provides AI-assisted topic summaries, simplified explanations, and context-aware chat.
- Generates quizzes, study notes, flashcards, revision steps, and mind-map style topic views.
- Saves bookmarks, notes, search history, and learning progress.
- Recommends educational YouTube videos for each topic.
- Uses a RAG pipeline so chat answers can be grounded in Wikipedia article chunks.

## Main Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- React Router
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- Redis
- JWT authentication
- Groq api for AI summary
- YouTube Data API for video search

### AI and Data Flow

- Wikipedia REST API and parse endpoints for article content
- Chunking and embedding pipeline for RAG
- Persona-aware prompt building
- AI-generated summaries, explanations, chat replies, and quizzes

## Project Structure

### Useful folders to keep

- `wikiai-backend/`: main API, AI services, RAG pipeline, analytics, notes, bookmarks, quizzes, and auth.
- `wikiai-frontend/`: main web app with onboarding, topic reader, chat, home page, and profile screens.

### Optional or separate folders

- `wikipedia-ai/`: separate Expo starter/prototype. It is not the main product implementation in this workspace.

### Files and folders that are not useful in GitHub source control

- `.env`: local secrets file. Do not commit.
- `node_modules/`: generated dependencies. Do not commit.
- `dist/`: build output. Do not commit.
- `logs/`: runtime logs. Do not commit.
- `*.log`: debug or server logs. Do not commit.
- `.DS_Store`: macOS metadata file. Do not commit.
- `test.html` and `WikiAI_Presentation_Slide.html`: presentation/demo artifacts, not part of the app codebase.

## Main Features

### Personalized learning

- Persona selection for different learning styles.
- Onboarding for interests, goals, and explanation depth.
- Adaptive home screen with persona-specific recommendations.

### Topic experience

- Wikipedia search and topic pages.
- AI summary and original Wikipedia content toggle.
- Simplify, deepen, example-based, and interview-mode explanations.
- Related topics and linked Wikipedia navigation.

### Learning tools

- Quiz generation and answer review.
- Notes generation and saving.
- Bookmarks for important topics.
- Flashcards and revision steps.
- Learning dashboard with progress and top topics.

### Chat and RAG

- Topic-aware chat sessions.
- Persona-aware answers.
- Wikipedia-grounded responses with source snippets.

### Media support

- Educational YouTube recommendations and embedded video player.

## Setup

This workspace contains a frontend and backend project. Run them separately.

### Backend setup

1. Open `wikiai-backend/`.
2. Create a local environment file from the example.
3. Install dependencies.
4. Start MongoDB, Redis, and Ollama.
5. Start the backend server.

Example:

```bash
cd wikiai-backend
npm install
npm run dev
```

### Frontend setup

1. Open `wikiai-frontend/`.
2. Install dependencies.
3. Start the Vite development server.

Example:

```bash
cd wikiai-frontend
npm install
npm run dev
```

## Environment Variables

### Backend `.env`

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

## Important Notes For GitHub Upload

- Keep only source code, configuration, and documentation.
- Remove generated folders like `dist/`, `node_modules/`, and log files before pushing.
- Do not upload local secret files such as `.env`.
- If you only want to publish the final product, keep `wikiai-backend/` and `wikiai-frontend/` and leave out `wikipedia-ai/`.

## Recommended Repository View

If your GitHub repo is meant to show the finished WikiAI project, the cleanest structure is:

```txt
wikipedia/
  README.md
  wikiai-backend/
  wikiai-frontend/
```

## Summary

WikiAI is designed as an adaptive Wikipedia learning app with AI tutoring, persona-based content delivery, and study tools. The main implementation lives in the backend and frontend folders, while the Expo folder and presentation/demo files are optional or separate from the core project.
