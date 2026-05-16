import axios from 'axios';
import { RecentSearchModel } from '../../models/mongo';
import { ApiError } from '../../utils/apiError';

const WIKI_REST = 'https://en.wikipedia.org/api/rest_v1';
const WIKI_API = 'https://en.wikipedia.org/w/api.php';
const WIKI_HEADERS = {
  'User-Agent': 'WikiAIBackend/1.0 (local development; contact: dev@wikiai.local)',
  Accept: 'application/json',
};

export interface WikiArticle {
  id: string;
  title: string;
  text: string;
  summary: string;
  thumbnail?: string;
  url: string;
}

export interface WikiSearchResult {
  id: string;
  title: string;
  snippet: string;
}

export class WikipediaService {
  async fetchArticle(title: string): Promise<WikiArticle> {
    const [summaryRes, sectionsRes] = await Promise.all([
      axios.get(`${WIKI_REST}/page/summary/${encodeURIComponent(title)}`, {
        headers: WIKI_HEADERS,
      }),
      axios
        .get(`${WIKI_REST}/page/sections/${encodeURIComponent(title)}`, {
          headers: WIKI_HEADERS,
        })
        .catch(() => null),
    ]);

    const summary = summaryRes.data;
    const sections = sectionsRes?.data?.sections ?? [];

    const fullText = sections.length > 0
      ? sections.map((s: any) => s.text?.replace(/<[^>]+>/g, '') ?? '').join('\n\n')
      : summary.extract ?? '';

    return {
      id: String(summary.pageid),
      title: summary.title,
      text: fullText,
      summary: summary.extract ?? '',
      thumbnail: summary.thumbnail?.source,
      url: summary.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    };
  }

  async search(query: string, limit = 10): Promise<WikiSearchResult[]> {
    let data: any;
    try {
      const response = await axios.get(WIKI_API, {
        headers: WIKI_HEADERS,
        params: {
          action: 'query',
          list: 'search',
          srsearch: query,
          srlimit: limit,
          srprop: 'snippet|titlesnippet',
          format: 'json',
          origin: '*',
        },
      });
      data = response.data;
    } catch (err: any) {
      throw new ApiError(
        502,
        'WIKIPEDIA_SEARCH_FAILED',
        'Wikipedia search failed. Please try again.',
        { status: err.response?.status },
      );
    }

    return (data.query?.search ?? []).map((r: any) => ({
      id: String(r.pageid),
      title: r.title,
      snippet: r.snippet?.replace(/<[^>]+>/g, '') ?? '',
    }));
  }

  async saveRecentSearch(userId: string, query: string): Promise<void> {
    await RecentSearchModel.create({ userId, query });

    // Keep only last 20 searches
    const recent = await RecentSearchModel.find({ userId })
      .sort({ createdAt: -1 })
      .skip(20)
      .select({ _id: 1 });
    if (recent.length) {
      await RecentSearchModel.deleteMany({ _id: { $in: recent.map((row) => row._id) } });
    }
  }

  async getRecentSearches(userId: string): Promise<string[]> {
    const searches = await RecentSearchModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select({ query: 1 });
    return searches.map((r: any) => r.query);
  }
}
