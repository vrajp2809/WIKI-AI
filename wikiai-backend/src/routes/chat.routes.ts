import { Router } from 'express';
import { ChatService } from '../services/ai/chat.service';
import { authenticate, attachPersona } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/apiError';
import { CreateSessionSchema, SendMessageSchema, ok } from '../models';
import { AnalyticsService } from '../services/analytics/analytics.service';

const router = Router();
const chatService = new ChatService();
const analyticsService = new AnalyticsService();

// GET /api/v1/chat/sessions
router.get(
  '/sessions',
  authenticate,
  asyncHandler(async (req, res) => {
    const sessions = await chatService.getSessions(req.user!.userId);
    res.json(ok(sessions));
  })
);

// POST /api/v1/chat/sessions
router.post(
  '/sessions',
  authenticate,
  validate(CreateSessionSchema),
  asyncHandler(async (req, res) => {
    const { topic, title } = req.body;
    const session = await chatService.createSession(req.user!.userId, topic, title);
    res.status(201).json(ok(session));
  })
);

// GET /api/v1/chat/sessions/:id
router.get(
  '/sessions/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const data = await chatService.getSession(req.params.id, req.user!.userId);
    res.json(ok(data));
  })
);

// POST /api/v1/chat/sessions/:id/messages
router.post(
  '/sessions/:id/messages',
  authenticate,
  attachPersona,
  aiRateLimit,
  validate(SendMessageSchema),
  asyncHandler(async (req, res) => {
    const message = await chatService.sendMessage(
      req.params.id,
      req.user!.userId,
      req.body.content,
      req.persona!,
      req.body.topic
    );

    analyticsService
      .trackEvent(req.user!.userId, 'chat', undefined, { sessionId: req.params.id })
      .catch(() => {});

    res.json(ok(message));
  })
);

export default router;
