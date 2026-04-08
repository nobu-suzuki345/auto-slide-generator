import { NextRequest, NextResponse } from 'next/server';
import { generateSlides } from '@/lib/deepseek';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, slideCount, language } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'テキストが指定されていません。' },
        { status: 400 }
      );
    }

    const count = slideCount === 'auto' ? 'auto' : Number(slideCount);
    const lang = language === 'en' ? 'en' : 'ja';

    const slideData = await generateSlides(text, count as 'auto' | 5 | 10 | 15, lang);

    return NextResponse.json({ slides: slideData.slides });
  } catch (error) {
    console.error('スライド生成エラー:', error);
    const message =
      error instanceof Error ? error.message : 'スライドの生成に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
