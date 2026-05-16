import { ApiError } from '../../utils/apiError';
import { User, Persona, PersonaLevel, ExplanationStyle } from '../../models';
import { PersonaModel, UserModel } from '../../models/mongo';

export class UserService {
  async getById(userId: string): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    return this.mapUser(user);
  }

  async update(
    userId: string,
    data: { displayName?: string; avatarUrl?: string }
  ): Promise<User> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      {
        ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      },
      { new: true },
    );
    if (!user) throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    return this.mapUser(user);
  }

  async getPersona(userId: string): Promise<Persona> {
    const persona = await PersonaModel.findOne({ userId });
    if (!persona) throw new ApiError(404, 'PERSONA_NOT_FOUND', 'Persona not found');

    return this.mapPersona(persona);
  }

  async upsertPersona(
    userId: string,
    data: {
      level: PersonaLevel;
      interests?: string[];
      preferredLang?: string;
      learningGoals?: string;
      explanationStyle?: ExplanationStyle;
    }
  ): Promise<Persona> {
    const persona = await PersonaModel.findOneAndUpdate(
      { userId },
      {
        level: data.level,
        ...(data.interests !== undefined ? { interests: data.interests } : {}),
        ...(data.preferredLang !== undefined ? { preferredLang: data.preferredLang } : {}),
        ...(data.learningGoals !== undefined ? { learningGoals: data.learningGoals } : {}),
        ...(data.explanationStyle !== undefined ? { explanationStyle: data.explanationStyle } : {}),
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    return this.mapPersona(persona);
  }

  private mapUser(row: any): User {
    return {
      id: row.id,
      email: row.email,
      displayName: row.displayName,
      avatarUrl: row.avatarUrl,
      isVerified: row.isVerified,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private mapPersona(row: any): Persona {
    return {
      id: row.id,
      userId: String(row.userId),
      level: row.level,
      interests: row.interests ?? [],
      preferredLang: row.preferredLang,
      learningGoals: row.learningGoals,
      explanationStyle: row.explanationStyle ?? 'exam_focused',
      updatedAt: row.updatedAt,
    };
  }
}
