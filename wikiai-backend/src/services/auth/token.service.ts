import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../../config/environment';

export interface JwtPayload {
  userId: string;
  email: string;
  personaLevel?: string;
}

export class TokenService {
  signAccessToken(payload: JwtPayload): string {
    const options: jwt.SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
    };

    return jwt.sign(payload, env.JWT_SECRET, {
      ...options,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  }

  generateRefreshToken(): { raw: string; hash: string } {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return { raw, hash };
  }

  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
