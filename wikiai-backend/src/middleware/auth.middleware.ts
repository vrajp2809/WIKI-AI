import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/auth/token.service';
import { UserService } from '../services/user/user.service';
import { fail } from '../models';

const tokenService = new TokenService();
const userService = new UserService();

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json(fail('NO_TOKEN', 'Authorization header required'));
    return;
  }

  try {
    const token = header.slice(7);
    const payload = tokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json(fail('INVALID_TOKEN', 'Token is invalid or expired'));
  }
};

export const attachPersona = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) return next();

  try {
    req.persona = await userService.getPersona(req.user.userId);
  } catch {
    // Default persona if none found
    req.persona = {
      id: '',
      userId: req.user.userId,
      level: 'college_student',
      interests: [],
      preferredLang: 'en',
      learningGoals: null,
      explanationStyle: 'exam_focused',
      updatedAt: new Date(),
    };
  }
  next();
};
