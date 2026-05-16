import { Router } from 'express';
import { SummaryService } from '../services/ai/summary.service';
import { RagPipelineService } from '../services/rag/pipeline.service';
import { authenticate, attachPersona } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { aiRateLimit } from '../middleware/rateLimit.middleware';
import { asyncHandler } from '../utils/apiError';
import { SummarizeSchema, ExplainSchema, ok } from '../models';
import { AnalyticsService } from '../services/analytics/analytics.service';

const router = Router();
const summaryService = new SummaryService();
const ragService = new RagPipelineService();
const analyticsService = new AnalyticsService();

// POST /api/v1/ai/summarize
router.post(
  '/summarize',
  authenticate,
  attachPersona,
  aiRateLimit,
  validate(SummarizeSchema),
  asyncHandler(async (req, res) => {
    const { articleText, articleTitle, personaLevel, explanationStyle } = req.body;
    const persona = {
      ...req.persona!,
      ...(personaLevel ? { level: personaLevel } : {}),
      ...(explanationStyle ? { explanationStyle } : {}),
    };
    const summary = await summaryService.summarize(articleText, articleTitle, persona);

    analyticsService.trackEvent(req.user!.userId, 'read', articleTitle).catch(() => {});

    res.json(ok({ summary, articleTitle }));
  })
);

// POST /api/v1/ai/explain
router.post(
  '/explain',
  authenticate,
  attachPersona,
  aiRateLimit,
  validate(ExplainSchema),
  asyncHandler(async (req, res) => {
    const { topic } = req.body;
    const explanation = await summaryService.explainSimply(topic, req.persona!);

    // Background ingest for future RAG queries
    ragService.ingestArticle(topic).catch(() => {});

    res.json(ok({ explanation, topic }));
  })
);

export default router;
