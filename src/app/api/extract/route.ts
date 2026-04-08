import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/extractors/text-extractor';
import { extractTextFromExcel } from '@/lib/extractors/excel-extractor';
import { extractTextFromWord } from '@/lib/extractors/word-extractor';
import { extractTextFromUrl } from '@/lib/extractors/url-extractor';

interface Source {
  type: string;
  name: string;
}

function getExtractorForFile(filename: string) {
  const ext = filename.toLowerCase().split('.').pop();
  switch (ext) {
    case 'txt':
    case 'md':
      return { extract: extractTextFromFile, type: ext };
    case 'xlsx':
      return { extract: extractTextFromExcel, type: 'xlsx' };
    case 'docx':
      return { extract: extractTextFromWord, type: 'docx' };
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const extractedTexts: string[] = [];
    const sources: Source[] = [];

    // Process files
    const files = formData.getAll('files');
    for (const entry of files) {
      if (!(entry instanceof File)) continue;

      const extractor = getExtractorForFile(entry.name);
      if (!extractor) {
        return NextResponse.json(
          { error: `未対応のファイル形式です: ${entry.name}` },
          { status: 400 }
        );
      }

      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const text = await extractor.extract(buffer);
      extractedTexts.push(text);
      sources.push({ type: extractor.type, name: entry.name });
    }

    // Process URLs
    const urlsRaw = formData.get('urls');
    if (urlsRaw && typeof urlsRaw === 'string') {
      const urls: string[] = JSON.parse(urlsRaw);
      for (const url of urls) {
        const text = await extractTextFromUrl(url);
        extractedTexts.push(text);
        sources.push({ type: 'url', name: url });
      }
    }

    // Process keyword
    const keywordRaw = formData.get('keyword');
    if (keywordRaw && typeof keywordRaw === 'string' && keywordRaw.trim()) {
      const keyword = keywordRaw.trim();
      extractedTexts.push(`キーワードリサーチ: ${keyword}`);
      sources.push({ type: 'keyword', name: keyword });
    }

    if (extractedTexts.length === 0) {
      return NextResponse.json(
        { error: '入力データがありません。ファイル、URL、またはキーワードを指定してください。' },
        { status: 400 }
      );
    }

    const combinedText = extractedTexts.join('\n\n--- 次のソース ---\n\n');

    return NextResponse.json({ text: combinedText, sources });
  } catch (error) {
    console.error('テキスト抽出エラー:', error);
    const message =
      error instanceof Error ? error.message : 'テキストの抽出に失敗しました';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
