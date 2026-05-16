import { Router } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { asyncHandler } from '../utils/apiError';
import { validate } from '../middleware/validate.middleware';
import { authRateLimit } from '../middleware/rateLimit.middleware';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, ok } from '../models';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const authService = new AuthService();

// POST /api/v1/auth/register
router.post(
  '/register',
  authRateLimit,
  validate(RegisterSchema),
  asyncHandler(async (req, res) => {
    const { email, password, displayName } = req.body;
    const tokens = await authService.register(email, password, displayName);
    res.status(201).json(ok(tokens));
  })
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authRateLimit,
  validate(LoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const tokens = await authService.login(email, password);
    res.json(ok(tokens));
  })
);

// POST /api/v1/auth/refresh
router.post(
  '/refresh',
  validate(RefreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    res.json(ok(tokens));
  })
);

// POST /api/v1/auth/logout
router.post(
  '/logout',
  authenticate,
  validate(RefreshTokenSchema),
  asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    res.json(ok({ message: 'Logged out successfully' }));
  })
);

export default router;
