import { Bookmark } from '../../models';
import { ApiError } from '../../utils/apiError';
import { BookmarkModel } from '../../models/mongo';

export class BookmarksService {
  async add(
    userId: string,
    data: { articleId: string; articleTitle: string; articleUrl?: string; thumbnail?: string }
  ): Promise<Bookmark> {
    try {
      const bookmark = await BookmarkModel.findOneAndUpdate(
        { userId, articleId: data.articleId },
        {
          userId,
          articleId: data.articleId,
          articleTitle: data.articleTitle,
          articleUrl: data.articleUrl ?? null,
          thumbnail: data.thumbnail ?? null,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
      return this.mapBookmark(bookmark);
    } catch {
      throw new ApiError(500, 'BOOKMARK_ERROR', 'Could not save bookmark');
    }
  }

  async getAll(userId: string): Promise<Bookmark[]> {
    const bookmarks = await BookmarkModel.find({ userId }).sort({ createdAt: -1 });
    return bookmarks.map(this.mapBookmark);
  }

  async remove(userId: string, articleId: string): Promise<void> {
    const result = await BookmarkModel.deleteOne({ userId, articleId });
    if (!result.deletedCount) throw new ApiError(404, 'BOOKMARK_NOT_FOUND', 'Bookmark not found');
  }

  private mapBookmark(row: any): Bookmark {
    return {
      id: row.id,
      userId: String(row.userId),
      articleId: row.articleId,
      articleTitle: row.articleTitle,
      articleUrl: row.articleUrl,
      thumbnail: row.thumbnail,
      createdAt: row.createdAt,
    };
  }
}
