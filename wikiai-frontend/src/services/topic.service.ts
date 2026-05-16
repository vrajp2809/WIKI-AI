import { api } from './api';

export interface TopicArticle {
  title: string;
  description?: string;
  extract: string;
  thumbnail?: string;
  url?: string;
}

export interface LearningVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedQuiz {
  id: string;
  topic: string;
  questions: QuizQuestion[];
}

const wikiSummaryUrl = (title: string) =>
  `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
const wikiParseUrl = (title: string) =>
  `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(title)}&prop=text&format=json&origin=*`;

export const topicService = {
  async getArticle(title: string): Promise<TopicArticle> {
    const response = await fetch(wikiSummaryUrl(title), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Wikipedia article was not found.');
    }

    const data = await response.json();
    return {
      title: data.title ?? title,
      description: data.description,
      extract: data.extract ?? '',
      thumbnail: data.thumbnail?.source,
      url: data.content_urls?.desktop?.page,
    };
  },

  async getOriginalHtml(title: string): Promise<string> {
    const response = await fetch(wikiParseUrl(title), {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Wikipedia source content was not found.');
    }

    const data = await response.json();
    return data.parse?.text?.['*'] ?? '';
  },

  getPersonalizedSummary: (
    articleText: string,
    articleTitle: string,
    persona?: { level: string; explanationStyle: string },
  ) =>
    api.post('/ai/summarize', {
      articleText,
      articleTitle,
      personaLevel: persona?.level,
      explanationStyle: persona?.explanationStyle,
    }),

  getGuidedExplanation: (articleText: string, articleTitle: string, instruction: string) =>
    api.post('/ai/summarize', {
      articleText: `${instruction}\n\nTopic material:\n${articleText}`,
      articleTitle,
    }),

  explainSimply: (topic: string) => api.post('/ai/explain', { topic }),

  getVideos: (topic: string, limit = 6) =>
    api.get('/youtube/search', { params: { q: topic, limit } }),

  generateQuiz: (topic: string, questionCount = 5) =>
    api.post('/quiz/generate', { topic, questionCount }),

  saveNote: (topic: string, title: string, content: string, tags: string[] = []) =>
    api.post('/notes', { topic, title, content, tags }),

  getRelatedTopics: (topic: string, limit = 6) =>
    api.get('/search', { params: { q: topic, limit } }),
};
