import OpenAI from 'openai';
import { env } from './environment';

export const openaiClient = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});
