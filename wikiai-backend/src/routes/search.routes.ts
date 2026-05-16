import { Router } from 'express';
import { WikipediaService } from '../services/wikipedia/wikipedia.service';
import { RagPipelineService } from '../services/rag/pipeline.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/apiError';
import { SearchSchema, ok } from '../models';
import { AnalyticsService } from '../services/analytics/analytics.service';

const router = Router();
const wikiService = new WikipediaService();
const ragService = new RagPipelineService();
const analyticsService = new AnalyticsService();

// GET /api/v1/search?q=quantum+physics
router.get(
  '/',
  authenticate,
  validate(SearchSchema, 'query'),
  asyncHandler(async (req, res) => {
    const { q, limit } = req.query as any;

    const results = await wikiService.search(q, limit);

    // Save to recent searches & track event (non-blocking)
    Promise.all([
      wikiService.saveRecentSearch(req.user!.userId, q),
      analyticsService.trackEvent(req.user!.userId, 'search', q),
    ]).catch(() => {});

    // Background: ingest top result for RAG
    if (results[0]) {
      ragService.ingestArticle(results[0].title).catch(() => {});
    }

    res.json(ok(results));
  })
);

// GET /api/v1/search/history
router.get(
  '/history',
  authenticate,
  asyncHandler(async (req, res) => {
    const searches = await wikiService.getRecentSearches(req.user!.userId);
    res.json(ok(searches));
  })
);

export default router;
