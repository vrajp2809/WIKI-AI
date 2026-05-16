import { Types } from 'mongoose';
import { BookmarkModel, LearningEventModel, QuizModel } from '../../models/mongo';

export class AnalyticsService {
  async trackEvent(
    userId: string,
    eventType: string,
    topic?: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await LearningEventModel.create({
      userId,
      eventType,
      topic: topic ?? null,
      metadata: metadata ?? {},
    });
  }

  async getProgress(userId: string) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const userObjectId = new Types.ObjectId(userId);
    const [eventRows, quizzes, bookmarkCount] = await Promise.all([
      LearningEventModel.aggregate([
        { $match: { userId: userObjectId, createdAt: { $gt: thirtyDaysAgo } } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
      QuizModel.find({ userId }),
      BookmarkModel.countDocuments({ userId }),
    ]);

    const eventCounts: Record<string, number> = {};
    for (const row of eventRows) {
      eventCounts[row._id] = row.count;
    }

    const completedQuizzes = quizzes.filter((quiz: any) => quiz.score !== null && quiz.total);
    const averageQuizScore = completedQuizzes.length
      ? Math.round(
          completedQuizzes.reduce(
            (sum: number, quiz: any) => sum + (quiz.score / quiz.total) * 100,
            0,
          ) / completedQuizzes.length,
        )
      : null;

    return {
      last30Days: {
        searches: eventCounts['search'] ?? 0,
        chats: eventCounts['chat'] ?? 0,
        quizzes: eventCounts['quiz'] ?? 0,
        reads: eventCounts['read'] ?? 0,
      },
      allTime: {
        quizzesTotal: quizzes.length,
        averageQuizScore,
        bookmarks: bookmarkCount,
      },
    };
  }

  async getTopTopics(userId: string, limit = 5) {
    const userObjectId = new Types.ObjectId(userId);
    const rows = await LearningEventModel.aggregate([
      { $match: { userId: userObjectId, topic: { $ne: null } } },
      { $group: { _id: "$topic", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
    return rows.map((r: any) => ({ topic: r._id, count: r.count }));
  }
}
