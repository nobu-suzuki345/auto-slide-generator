import { NextRequest, NextResponse } from 'next/server';
import { buildPptx } from '@/lib/slide-builder';
import type { Slide } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slides, templateId } = body as {
      slides: Slide[];
      templateId: string;
    };

    if (!slides || !Array.isArray(slides) || slides.length === 0) {
      return NextResponse.json(
        { error: 'スライドデータが指定されていません。' },
        { status: 400 }
      );
    }

    if (!templateId) {
      return NextResponse.json(
        { error: 'テンプレートIDが指定されていません。' },
        { status: 400 }
      );
    }

    const pptxBuffer = await buildPptx({ slides }, templateId);

    return new NextResponse(new Uint8Array(pptxBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': 'attachment; filename="presentation.pptx"',
        'Content-Length': String(pptxBuffer.length),
      },
    });
  } catch (error) {
    console.error('PPTX生成エラー:', error);
    const message =
      error instanceof Error ? error.message : 'PowerPointの生成に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
