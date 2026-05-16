import axios from 'axios';
import { env } from '../../config/environment';

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
  thumbnail: string;
  url: string;
  publishedAt: string;
}

export class YouTubeService {
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  async searchEducationalVideos(
    topic: string,
    maxResults = 5
  ): Promise<YouTubeVideo[]> {
    const { data } = await axios.get(`${this.baseUrl}/search`, {
      params: {
        part: 'snippet',
        q: `${topic} explained educational tutorial`,
        type: 'video',
        maxResults,
        videoCategoryId: '27', // Education
        relevanceLanguage: 'en',
        safeSearch: 'strict',
        order: 'relevance',
        key: env.YOUTUBE_API_KEY,
      },
    });

    return (data.items ?? []).map((item: any) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      description: (item.snippet.description ?? '').slice(0, 200),
      thumbnail: item.snippet.thumbnails?.medium?.url ?? '',
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      publishedAt: item.snippet.publishedAt,
    }));
  }
}
