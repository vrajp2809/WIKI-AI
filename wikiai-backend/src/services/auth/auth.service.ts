import bcrypt from 'bcryptjs';
import { TokenService } from './token.service';
import { ApiError } from '../../utils/apiError';
import { PersonaModel, RefreshTokenModel, UserModel } from '../../models/mongo';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private tokenService = new TokenService();

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<AuthTokens> {
    const normalizedEmail = email.toLowerCase();
    const existing = await UserModel.exists({ email: normalizedEmail });
    if (existing) {
      throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      email: normalizedEmail,
      passwordHash,
      displayName,
    });

    // Create default persona
    await PersonaModel.create({
      userId: user._id,
      level: 'college_student',
      interests: [],
      preferredLang: 'en',
      learningGoals: null,
      explanationStyle: 'exam_focused',
    });

    return this.issueTokens(user.id, user.email);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    return this.issueTokens(user.id, user.email);
  }

  async refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
    const hash = this.tokenService.hashToken(rawRefreshToken);

    const record = await RefreshTokenModel.findOne({
      tokenHash: hash,
      revoked: false,
    }).populate<{ userId: any }>('userId');
    if (!record) {
      throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired');
    }

    if (record.expiresAt < new Date()) {
      throw new ApiError(401, 'REFRESH_TOKEN_EXPIRED', 'Refresh token has expired. Please log in again.');
    }

    // Revoke the old token (rotation)
    record.revoked = true;
    await record.save();

    return this.issueTokens(record.userId.id, record.userId.email);
  }

  async logout(rawRefreshToken: string): Promise<void> {
    const hash = this.tokenService.hashToken(rawRefreshToken);
    await RefreshTokenModel.updateOne({ tokenHash: hash }, { revoked: true });
  }

  private async issueTokens(userId: string, email: string): Promise<AuthTokens> {
    const accessToken = this.tokenService.signAccessToken({ userId, email });
    const { raw, hash } = this.tokenService.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshTokenModel.create({
      userId,
      tokenHash: hash,
      expiresAt,
    });

    return { accessToken, refreshToken: raw };
  }
}
