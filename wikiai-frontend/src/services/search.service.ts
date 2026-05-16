import { api } from './api';
import { ApiEnvelope } from '../types/api';
import { SearchHistoryItem, SearchResult } from '../types/search';

export const searchService = {
  search: (q: string, limit = 10) =>
    api.get<ApiEnvelope<SearchResult[]>>('/search', { params: { q, limit } }),
  history: () => api.get<ApiEnvelope<SearchHistoryItem[]>>('/search/history'),
};
