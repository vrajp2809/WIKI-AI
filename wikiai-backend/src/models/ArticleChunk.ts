import mongoose, { Schema, Document } from "mongoose";

export interface IArticleChunk extends Document {
  articleId: string;
  articleTitle: string;
  chunkIndex: number;
  chunkText: string;
  embedding: number[];
}

const ArticleChunkSchema = new Schema<IArticleChunk>(
  {
    articleId: { type: String, required: true, index: true },
    articleTitle: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    chunkText: { type: String, required: true },
    embedding: { type: [Number], required: true },
  },
  {
    timestamps: true,
  },
);

// Compound index for efficient queries
ArticleChunkSchema.index({ articleId: 1, chunkIndex: 1 }, { unique: true });

export const ArticleChunk = mongoose.model<IArticleChunk>(
  "ArticleChunk",
  ArticleChunkSchema,
);
