import { api } from './api';

export interface LearningProgress {
  last30Days: {
    searches: number;
    chats: number;
    quizzes: number;
    reads: number;
  };
  allTime: {
    quizzesTotal: number;
    averageQuizScore: number | null;
    bookmarks: number;
  };
}

export interface TopTopic {
  topic: string;
  count: number;
}

export interface Bookmark {
  id: string;
  articleId: string;
  articleTitle: string;
  articleUrl: string | null;
  thumbnail: string | null;
  createdAt: string;
}

export interface Note {
  id: string;
  topic: string | null;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export const learningService = {
  getProgress: () => api.get('/analytics/progress'),
  getTopTopics: () => api.get('/analytics/topics'),
  getBookmarks: () => api.get('/bookmarks'),
  addBookmark: (articleId: string, articleTitle: string, articleUrl?: string, thumbnail?: string) =>
    api.post('/bookmarks', { articleId, articleTitle, articleUrl, thumbnail }),
  removeBookmark: (articleId: string) => api.delete(`/bookmarks/${encodeURIComponent(articleId)}`),
  getNotes: () => api.get('/notes'),
};
