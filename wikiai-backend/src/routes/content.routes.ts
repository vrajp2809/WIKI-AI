import { Router } from 'express';
import { NotesService } from '../services/analytics/notes.service';
import { BookmarksService } from '../services/analytics/bookmarks.service';
import { YouTubeService } from '../services/youtube/youtube.service';
import { AnalyticsService } from '../services/analytics/analytics.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/apiError';
import {
  CreateNoteSchema, UpdateNoteSchema,
  CreateBookmarkSchema,
  ok,
} from '../models';

// ===== NOTES =====
export const notesRouter = Router();
const notesService = new NotesService();

notesRouter.get('/', authenticate, asyncHandler(async (req, res) => {
  res.json(ok(await notesService.getAll(req.user!.userId)));
}));

notesRouter.post('/', authenticate, validate(CreateNoteSchema), asyncHandler(async (req, res) => {
  const note = await notesService.create(req.user!.userId, req.body);
  res.status(201).json(ok(note));
}));

notesRouter.patch('/:id', authenticate, validate(UpdateNoteSchema), asyncHandler(async (req, res) => {
  const note = await notesService.update(req.params.id, req.user!.userId, req.body);
  res.json(ok(note));
}));

notesRouter.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  await notesService.delete(req.params.id, req.user!.userId);
  res.json(ok({ message: 'Note deleted' }));
}));

// ===== BOOKMARKS =====
export const bookmarksRouter = Router();
const bookmarksService = new BookmarksService();

bookmarksRouter.get('/', authenticate, asyncHandler(async (req, res) => {
  res.json(ok(await bookmarksService.getAll(req.user!.userId)));
}));

bookmarksRouter.post('/', authenticate, validate(CreateBookmarkSchema), asyncHandler(async (req, res) => {
  const bookmark = await bookmarksService.add(req.user!.userId, req.body);
  res.status(201).json(ok(bookmark));
}));

bookmarksRouter.delete('/:articleId', authenticate, asyncHandler(async (req, res) => {
  await bookmarksService.remove(req.user!.userId, req.params.articleId);
  res.json(ok({ message: 'Bookmark removed' }));
}));

// ===== YOUTUBE =====
export const youtubeRouter = Router();
const youtubeService = new YouTubeService();

youtubeRouter.get('/search', authenticate, asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '');
  const limit = Math.min(parseInt(String(req.query.limit ?? '5')), 10);
  const videos = await youtubeService.searchEducationalVideos(q, limit);
  res.json(ok(videos));
}));

// ===== ANALYTICS =====
export const analyticsRouter = Router();
const analyticsService = new AnalyticsService();

analyticsRouter.get('/progress', authenticate, asyncHandler(async (req, res) => {
  const progress = await analyticsService.getProgress(req.user!.userId);
  res.json(ok(progress));
}));

analyticsRouter.get('/topics', authenticate, asyncHandler(async (req, res) => {
  const topics = await analyticsService.getTopTopics(req.user!.userId);
  res.json(ok(topics));
}));
