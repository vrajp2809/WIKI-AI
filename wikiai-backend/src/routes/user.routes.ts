import { Router } from 'express';
import { UserService } from '../services/user/user.service';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { asyncHandler } from '../utils/apiError';
import { UpdatePersonaSchema, ok } from '../models';
import { z } from 'zod';

const router = Router();
const userService = new UserService();

const UpdateUserSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional(),
});

// GET /api/v1/users/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await userService.getById(req.user!.userId);
    res.json(ok(user));
  })
);

// PATCH /api/v1/users/me
router.patch(
  '/me',
  authenticate,
  validate(UpdateUserSchema),
  asyncHandler(async (req, res) => {
    const user = await userService.update(req.user!.userId, req.body);
    res.json(ok(user));
  })
);

// GET /api/v1/users/me/persona
router.get(
  '/me/persona',
  authenticate,
  asyncHandler(async (req, res) => {
    const persona = await userService.getPersona(req.user!.userId);
    res.json(ok(persona));
  })
);

// PUT /api/v1/users/me/persona
router.put(
  '/me/persona',
  authenticate,
  validate(UpdatePersonaSchema),
  asyncHandler(async (req, res) => {
    const persona = await userService.upsertPersona(req.user!.userId, req.body);
    res.json(ok(persona));
  })
);

export default router;
