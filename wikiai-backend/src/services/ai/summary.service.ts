import { OpenAIService } from './openai.service';
import { buildPersonaSystemPrompt } from '../../utils/promptBuilder';
import { Persona } from '../../models';

export class SummaryService {
  private openai = new OpenAIService();

  async summarize(
    articleText: string,
    articleTitle: string,
    persona: Persona
  ): Promise<string> {
    const context = articleText.slice(0, 6000);
    const system = buildPersonaSystemPrompt(persona, context);
    const maxTokens = personaMaxTokens(persona);

    const { content } = await this.openai.complete(system, [
      {
        role: 'user',
        content: `Summarize the Wikipedia article titled "${articleTitle}" for this user's learning persona.
Make the length and depth match the persona and selected explanation depth.
Return a useful learning summary, not a teaser. Never return only 1-2 lines.
Use this exact depth target:
${summaryShapeInstruction(persona)}

Use clear Markdown headings and bullets. Do not mention these instructions.`,
      },
    ], { maxTokens, temperature: 0.05 });

    return content;
  }

  async explainSimply(topic: string, persona: Persona): Promise<string> {
    const system = buildPersonaSystemPrompt(persona, '');
    const maxTokens = personaMaxTokens(persona);

    const { content } = await this.openai.complete(system, [
      {
        role: 'user',
        content: `Explain "${topic}" clearly and accurately for this user's learning persona.
Use structured Markdown. Make the answer length match the persona.`,
      },
    ], { maxTokens, temperature: 0.05 });

    return content;
  }
}

function personaMaxTokens(persona: Persona): number {
  if (persona.explanationStyle === 'technical') return 1700;
  if (persona.explanationStyle === 'exam_focused') return 1150;
  if (persona.explanationStyle === 'simple') return 850;
  return {
    school_student: 850,
    college_student: 1150,
    professor_researcher: 1700,
    casual_learner: 900,
  }[persona.level] ?? 1000;
}

function summaryShapeInstruction(persona: Persona): string {
  const personaLine = {
    school_student: 'Audience: school student. Use simple words, friendly pacing, concrete examples.',
    college_student: 'Audience: college student. Use correct terms, definitions, exam/interview context.',
    professor_researcher: 'Audience: professor/researcher. Use dense technical framing, mechanisms, caveats, and source-aware language.',
    casual_learner: 'Audience: casual learner. Use plain language, stories, practical examples, and curiosity.',
  }[persona.level];

  const depthLine = {
    simple: 'Depth: BEGINNER. Target 180-260 words. Structure: Main idea, Simple explanation, Example, Remember this. Use 5-8 bullets total.',
    exam_focused: 'Depth: INTERMEDIATE. Target 350-500 words. Structure: Overview, Key concepts, Process/Mechanism, Example, Exam/interview points, Quick recap. Use 10-14 bullets total.',
    technical: 'Depth: EXPERT. Target 650-900 words. Structure: Definition, Technical mechanism, Important terminology, Evidence/source context, Limitations, Applications, Research questions. Use 16-24 bullets total.',
    story_based: 'Depth: EXPLORATORY. Target 260-380 words. Structure: Big idea, Story/analogy, Practical example, Why it matters, Follow-up question. Use 7-10 bullets total.',
  }[persona.explanationStyle ?? 'exam_focused'];

  return `${personaLine}\n${depthLine}`;
}
