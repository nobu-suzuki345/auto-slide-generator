import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import type { SlideData } from '@/types';

export const runtime = 'nodejs';

function getClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY が設定されていません。');
  return new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, slideCount, language } = body;

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'テキストが指定されていません。' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const lang = language === 'en' ? 'en' : 'ja';
    const count = slideCount === 'auto' ? 'auto' : Number(slideCount);

    const countInstruction = count === 'auto'
      ? (lang === 'ja' ? '内容に応じて最適なスライド枚数を自動決定してください。' : 'Automatically determine the optimal number of slides.')
      : (lang === 'ja' ? `スライドを${count}枚程度で構成してください。` : `Structure with approximately ${count} slides.`);

    const systemPrompt = buildSystemPrompt(lang);
    const userPrompt = `${countInstruction}\n\n以下のテキストからスライドを生成してください:\n\n${text}`;

    const client = getClient();

    // ストリーミングで受信
    const stream = await client.chat.completions.create({
      model: 'deepseek-reasoner',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
    });

    // ストリーミングレスポンスを返す
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              // 進捗をSSEで送信
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', content: delta })}\n\n`));
            }
          }

          // 全文受信完了 → JSONパース
          let jsonStr = fullContent.trim();
          const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (codeBlockMatch) jsonStr = codeBlockMatch[1].trim();

          // { で始まる部分を抽出
          const jsonStart = jsonStr.indexOf('{');
          const jsonEnd = jsonStr.lastIndexOf('}');
          if (jsonStart !== -1 && jsonEnd !== -1) {
            jsonStr = jsonStr.slice(jsonStart, jsonEnd + 1);
          }

          const slideData: SlideData = JSON.parse(jsonStr);

          // バリデーション
          if (!slideData.slides || !Array.isArray(slideData.slides)) {
            throw new Error('スライド情報が含まれていません。');
          }

          const validTypes = ['title', 'toc', 'section', 'content', 'bullets', 'data', 'chart', 'comparison', 'quote', 'summary'];
          for (const slide of slideData.slides) {
            if (!validTypes.includes(slide.type)) slide.type = 'content';
            if (!slide.title) slide.title = '';
          }

          // 完了データを送信
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done', slides: slideData.slides })}\n\n`));
        } catch (err) {
          const message = err instanceof Error ? err.message : 'スライド生成に失敗しました';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('スライド生成エラー:', error);
    return new Response(JSON.stringify({ error: 'スライド生成に失敗しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

function buildSystemPrompt(language: 'ja' | 'en'): string {
  if (language === 'en') {
    return `You are a presentation structure expert. Analyze the given text and generate a professional presentation slide structure in JSON format.
Output ONLY valid JSON matching: { "slides": [{ "type": "title"|"toc"|"section"|"content"|"bullets"|"data"|"chart"|"comparison"|"quote"|"summary", "title": "string", ... }] }`;
  }

  return `あなたはプレゼンテーション構成の専門家であり、リサーチャーです。
以下のテキストを分析し、プロフェッショナルで見やすいプレゼンテーションのスライド構成をJSON形式で生成してください。

キーワードリサーチの場合:
- キーワードから想定される内容を深く調査・推論し、詳細な情報を盛り込んでください

★最重要: プレゼンスライドとして見やすさを最大化すること★
- 1スライドの文字数は少なく。キーワード・短いフレーズで表現する
- 長い文章は絶対に書かない
- 情報が多い場合はスライドを分割する

コンテンツのルール:
1. タイトルスライド（キャッチーなタイトル + 短いサブタイトル1行）
2. 目次スライド
3. bulletsスライド: 最大4項目。各項目は短いフレーズ（15文字以内）+ 補足1文（30文字以内）
4. dataスライド: 表は3〜5列、3〜5行
5. comparisonスライド: 左右それぞれ3〜4項目
6. contentスライド: 2〜3文のみ
7. まとめスライド: 3〜4個のキーポイント
8. 全スライドにスピーカーノート
9. 日本語で出力
10. chartスライドでは必ずchartフィールドにデータを入れる

以下のJSON構造のみを出力（マークダウンやコードフェンスは不要）:
{
  "slides": [
    {
      "type": "title" | "toc" | "section" | "content" | "bullets" | "data" | "chart" | "comparison" | "quote" | "summary",
      "title": "文字列",
      "subtitle": "文字列（任意）",
      "content": "文字列（任意）",
      "bullets": ["文字列の配列（任意）"],
      "data": { "headers": ["文字列"], "rows": [["文字列"]] },
      "chart": { "type": "bar"|"pie"|"line"|"doughnut", "title": "タイトル", "labels": ["ラベル"], "datasets": [{ "name": "名前", "values": [数値] }] },
      "columns": { "left": { "title": "文字列", "bullets": ["文字列"] }, "right": { "title": "文字列", "bullets": ["文字列"] } },
      "quote": { "text": "文字列", "author": "文字列" },
      "notes": "文字列（任意）"
    }
  ]
}`;
}
