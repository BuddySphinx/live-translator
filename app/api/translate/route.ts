import { NextRequest, NextResponse } from 'next/server';
import { translateText } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, sourceLang, targetLang } = body;

    if (!text || !sourceLang || !targetLang) {
      return NextResponse.json(
        { error: 'Missing required fields: text, sourceLang, targetLang' },
        { status: 400 }
      );
    }

    const translation = await translateText(text, sourceLang, targetLang);

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Translation failed. Please try again.' },
      { status: 500 }
    );
  }
}
