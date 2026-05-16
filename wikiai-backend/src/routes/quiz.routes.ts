import { Router } from 'express';
import { QuizService } from '../services/ai/quiz.service';
import { RagPipelineService } from '../services/rag/pipeline.service';
import { authenticate, attachPersona } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/apiError';
import { GenerateQuizSchema, SubmitQuizSchema, ok } from '../models';
import { AnalyticsService } from '../services/analytics/analytics.service';

const router = Router();
const quizService = new QuizService();
const ragService = new RagPipelineService();
const analyticsService = new AnalyticsService();

// POST /api/v1/quiz/generate
router.post(
  '/generate',
  authenticate,
  attachPersona,
  aiRateLimit,
  validate(GenerateQuizSchema),
  asyncHandler(async (req, res) => {
    const { topic, questionCount } = req.body;
    const persona = req.persona!;

    // Try to get RAG context for the topic
    let context = '';
    try {
      await ragService.ingestArticle(topic);
    } catch { /* fallback to LLM knowledge */ }

    const questions = await quizService.generate(topic, context, persona, questionCount);
    const quizId = await quizService.saveQuiz(
      req.user!.userId, topic, persona.level, questions
    );

    analyticsService.trackEvent(req.user!.userId, 'quiz', topic).catch(() => {});

    res.status(201).json(ok({ id: quizId, topic, questions }));
  })
);

// POST /api/v1/quiz/:id/submit
router.post(
  '/:id/submit',
  authenticate,
  validate(SubmitQuizSchema),
  asyncHandler(async (req, res) => {
    const result = await quizService.submitQuiz(
      req.params.id,
      req.user!.userId,
      req.body.answers
    );
    res.json(ok(result));
  })
);

// GET /api/v1/quiz/history
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req, res) => {
    const history = await quizService.getHistory(req.user!.userId);
    res.json(ok(history));
  })
);

export default router;
