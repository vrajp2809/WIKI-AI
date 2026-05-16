import mongoose, { Schema } from "mongoose";

const toJson = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
};

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true, toJSON: toJson, toObject: toJson },
);

const RefreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revoked: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);

const PersonaSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    level: {
      type: String,
      enum: ["school_student", "college_student", "professor_researcher", "casual_learner"],
      default: "college_student",
    },
    interests: { type: [String], default: [] },
    preferredLang: { type: String, default: "en" },
    learningGoals: { type: String, default: null },
    explanationStyle: {
      type: String,
      enum: ["simple", "exam_focused", "technical", "story_based"],
      default: "exam_focused",
    },
  },
  { timestamps: { createdAt: false, updatedAt: true }, toJSON: toJson, toObject: toJson },
);

const ChatSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, default: null },
    title: { type: String, default: null },
  },
  { timestamps: true, toJSON: toJson, toObject: toJson },
);

const ChatMessageSchema = new Schema(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "ChatSession", required: true, index: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    tokensUsed: { type: Number, default: undefined },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);

const QuizSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, default: null },
    personaLevel: { type: String, default: null },
    questions: { type: [Schema.Types.Mixed], default: [] },
    userAnswers: { type: [Number], default: [] },
    score: { type: Number, default: null },
    total: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);

const NoteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    topic: { type: String, default: null },
    title: { type: String, required: true },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: toJson, toObject: toJson },
);

const BookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    articleId: { type: String, required: true },
    articleTitle: { type: String, required: true },
    articleUrl: { type: String, default: null },
    thumbnail: { type: String, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);
BookmarkSchema.index({ userId: 1, articleId: 1 }, { unique: true });

const RecentSearchSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);

const LearningEventSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventType: { type: String, required: true },
    topic: { type: String, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false }, toJSON: toJson, toObject: toJson },
);
LearningEventSchema.index({ createdAt: 1 });

export const UserModel = mongoose.model("User", UserSchema);
export const RefreshTokenModel = mongoose.model("RefreshToken", RefreshTokenSchema);
export const PersonaModel = mongoose.model("Persona", PersonaSchema);
export const ChatSessionModel = mongoose.model("ChatSession", ChatSessionSchema);
export const ChatMessageModel = mongoose.model("ChatMessage", ChatMessageSchema);
export const QuizModel = mongoose.model("Quiz", QuizSchema);
export const NoteModel = mongoose.model("Note", NoteSchema);
export const BookmarkModel = mongoose.model("Bookmark", BookmarkSchema);
export const RecentSearchModel = mongoose.model("RecentSearch", RecentSearchSchema);
export const LearningEventModel = mongoose.model("LearningEvent", LearningEventSchema);
