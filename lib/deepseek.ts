import OpenAI from 'openai';

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
});

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  try {
    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the given text from ${sourceLang} to ${targetLang}. Only return the translation, no explanations or additional text. Keep the same tone and style.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000, // Increased for longer segments
    });

    const translation = response.choices[0]?.message?.content || '';
    return translation.trim();
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Translation failed. Please try again.');
  }
}
