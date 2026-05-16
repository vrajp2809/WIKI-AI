export interface SearchResult {
  title: string;
  description?: string;
  snippet?: string;
  id?: string;
  pageId?: number;
  url?: string;
  thumbnail?: string;
}

export interface SearchHistoryItem {
  query: string;
  searchedAt: string;
}
