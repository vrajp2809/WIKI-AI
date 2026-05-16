import { OpenAIService } from './openai.service';
import { buildQuizSystemPrompt } from '../../utils/promptBuilder';
import { Persona, QuizQuestion } from '../../models';
import { ApiError } from '../../utils/apiError';
import { QuizModel } from '../../models/mongo';

interface GeneratedQuiz {
  questions: QuizQuestion[];
}

export class QuizService {
  private openai = new OpenAIService();

  async generate(
    topic: string,
    context: string,
    persona: Persona,
    questionCount: number = 5
  ): Promise<QuizQuestion[]> {
    const system = buildQuizSystemPrompt(persona);

    const prompt = `Generate exactly ${questionCount} multiple-choice quiz questions about "${topic}".
${context ? `Use this context:\n${context.slice(0, 3000)}\n` : ''}

Return ONLY this JSON structure, nothing else:
{
  "questions": [
    {
      "question": "Clear, specific question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}`;

    const { content } = await this.openai.complete(system, [
      { role: 'user', content: prompt },
    ], 2000);

    let parsed: GeneratedQuiz;
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw new ApiError(500, 'QUIZ_PARSE_ERROR', 'Failed to generate quiz. Please try again.');
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new ApiError(500, 'QUIZ_EMPTY', 'Quiz generation returned no questions.');
    }

    return parsed.questions;
  }

  async saveQuiz(
    userId: string,
    topic: string,
    personaLevel: string,
    questions: QuizQuestion[]
  ): Promise<string> {
    const quiz = await QuizModel.create({
      userId,
      topic,
      personaLevel,
      questions,
      total: questions.length,
    });
    return quiz.id;
  }

  async submitQuiz(
    quizId: string,
    userId: string,
    answers: number[]
  ): Promise<{ score: number; total: number; results: any[] }> {
    const quiz = await QuizModel.findOne({ _id: quizId, userId });
    if (!quiz) throw new ApiError(404, 'QUIZ_NOT_FOUND', 'Quiz not found');

    const questions: QuizQuestion[] = quiz.questions as QuizQuestion[];
    let score = 0;

    const results = questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) score++;
      return {
        question: q.question,
        yourAnswer: q.options[answers[i]] ?? 'Not answered',
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
        explanation: q.explanation,
      };
    });

    quiz.score = score;
    quiz.userAnswers = answers;
    quiz.completedAt = new Date();
    await quiz.save();

    return { score, total: questions.length, results };
  }

  async getHistory(userId: string) {
    const quizzes = await QuizModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .select({ questions: 0, userAnswers: 0 });

    return quizzes.map((quiz: any) => ({
      id: quiz.id,
      topic: quiz.topic,
      personaLevel: quiz.personaLevel,
      score: quiz.score,
      total: quiz.total,
      completedAt: quiz.completedAt,
      createdAt: quiz.createdAt,
    }));
  }
}
