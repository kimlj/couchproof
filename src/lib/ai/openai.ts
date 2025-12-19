import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCompletion(
  prompt: string,
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: options?.model || 'gpt-4-turbo-preview',
    messages: [{ role: 'user', content: prompt }],
    temperature: options?.temperature || 0.8,
    max_tokens: options?.maxTokens || 500,
  });

  return completion.choices[0]?.message?.content || '';
}
