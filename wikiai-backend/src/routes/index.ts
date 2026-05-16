import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import searchRoutes from './search.routes';
import aiRoutes from './ai.routes';
import chatRoutes from './chat.routes';
import quizRoutes from './quiz.routes';
import {
  notesRouter,
  bookmarksRouter,
  youtubeRouter,
  analyticsRouter,
} from './content.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiRoutes);
router.use('/chat', chatRoutes);
router.use('/quiz', quizRoutes);
router.use('/notes', notesRouter);
router.use('/bookmarks', bookmarksRouter);
router.use('/youtube', youtubeRouter);
router.use('/analytics', analyticsRouter);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
