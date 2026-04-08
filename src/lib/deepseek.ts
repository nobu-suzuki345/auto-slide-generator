/**
 * DeepSeek API クライアント
 * OpenAI 互換 SDK を使用して deepseek-reasoner モデルに接続
 */

import OpenAI from 'openai';
import { SlideData } from '@/types';

function getClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY が設定されていません。.env.local に設定してください。');
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  });
}

function buildSystemPrompt(language: 'ja' | 'en'): string {
  if (language === 'en') {
    return `You are a presentation structure expert.
Analyze the given text and generate a professional presentation slide structure in JSON format.

Rules:
1. Start with a title slide
2. Include a table of contents (toc) slide
3. Add section break slides between major topics
4. Maximum 5 bullet points per slide
5. Use data slides for tabular data
6. Use comparison slides for comparing items
7. Use quote slides for impactful quotes
8. End with a summary slide
9. Include speaker notes for each slide
10. Output all text in English

Output ONLY valid JSON matching this structure (no markdown, no code fences):
{
  "slides": [
    {
      "type": "title" | "toc" | "section" | "content" | "bullets" | "data" | "comparison" | "quote" | "summary",
      "title": "string",
      "subtitle": "string (optional)",
      "content": "string (optional)",
      "bullets": ["string array (optional)"],
      "data": { "headers": ["string"], "rows": [["string"]] },
      "columns": { "left": { "title": "string", "bullets": ["string"] }, "right": { "title": "string", "bullets": ["string"] } },
      "quote": { "text": "string", "author": "string" },
      "notes": "string (optional)"
    }
  ]
}`;
  }

  return `あなたはプレゼンテーション構成の専門家であり、リサーチャーです。
以下のテキストを分析し、プロフェッショナルで内容の充実したプレゼンテーションのスライド構成をJSON形式で生成してください。

キーワードリサーチの場合:
- キーワードから想定される内容を深く調査・推論し、詳細な情報を盛り込んでください
- 背景、現状、具体的な機能や特徴、活用事例、将来展望など多角的にカバーしてください
- 数値データ、比較、引用なども積極的に入れてください

★最重要: プレゼンスライドとして見やすさを最大化すること★
- 1スライドの文字数は少なく。キーワード・短いフレーズで表現する
- 長い文章は絶対に書かない。プレゼンは「見せる」もの
- 情報が多い場合はスライドを分割する

コンテンツのルール:
1. タイトルスライド（キャッチーなタイトル + 短いサブタイトル1行）
2. 目次スライド
3. セクション区切りスライドはインパクトのある一言で
4. bulletsスライド: 最大4項目。各項目は短いフレーズ（15文字以内）+ 補足1文（30文字以内）
5. dataスライド: 表は3〜5列、3〜5行。数値データ中心
6. comparisonスライド: 左右それぞれ3〜4項目の短いポイント
7. quoteスライド: インパクトのある1文のみ
8. contentスライド: タイトル + 2〜3文の説明のみ。長文禁止
9. まとめスライド: 3〜4個のキーポイントを短く
10. 全スライドにスピーカーノート（詳細はノートに書く。ノートは3〜5文で）
11. 日本語で出力
12. 具体的な数値・事例を入れる。ただしスライド上は簡潔に
13. 数値データがある場合はchartスライドを積極的に使う
14. chartスライドでは必ずchartフィールドに5個以上のデータポイントを入れる

以下のJSON構造のみを出力してください（マークダウンやコードフェンスは不要）:
{
  "slides": [
    {
      "type": "title" | "toc" | "section" | "content" | "bullets" | "data" | "chart" | "comparison" | "quote" | "summary",
      "title": "文字列",
      "subtitle": "文字列（任意）",
      "content": "文字列（任意）",
      "bullets": ["文字列の配列（任意）"],
      "data": { "headers": ["文字列"], "rows": [["文字列"]] },
      "chart": { "type": "bar" | "pie" | "line" | "doughnut", "title": "グラフタイトル", "labels": ["ラベル1", "ラベル2"], "datasets": [{ "name": "データ名", "values": [数値1, 数値2] }] },
      "columns": { "left": { "title": "文字列", "bullets": ["文字列"] }, "right": { "title": "文字列", "bullets": ["文字列"] } },
      "quote": { "text": "文字列", "author": "文字列" },
      "notes": "文字列（任意）"
    }
  ]
}`;
}

function buildUserPrompt(
  text: string,
  slideCount: 'auto' | 5 | 10 | 15,
  language: 'ja' | 'en'
): string {
  const countInstruction =
    slideCount === 'auto'
      ? language === 'ja'
        ? '内容に応じて最適なスライド枚数を自動決定してください。'
        : 'Automatically determine the optimal number of slides based on the content.'
      : language === 'ja'
        ? `スライドを${slideCount}枚程度で構成してください。`
        : `Structure the presentation with approximately ${slideCount} slides.`;

  const prefix =
    language === 'ja'
      ? `${countInstruction}\n\n以下のテキストからスライドを生成してください:\n\n`
      : `${countInstruction}\n\nGenerate slides from the following text:\n\n`;

  return prefix + text;
}

/**
 * テキストからスライド構成を生成する
 */
export async function generateSlides(
  text: string,
  slideCount: 'auto' | 5 | 10 | 15 = 'auto',
  language: 'ja' | 'en' = 'ja'
): Promise<SlideData> {
  const client = getClient();

  const response = await client.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [
      {
        role: 'system',
        content: buildSystemPrompt(language),
      },
      {
        role: 'user',
        content: buildUserPrompt(text, slideCount, language),
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('AIからの応答が空です。再度お試しください。');
  }

  // JSON を抽出（コードフェンスで囲まれている場合にも対応）
  let jsonStr = content.trim();

  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  let slideData: SlideData;
  try {
    slideData = JSON.parse(jsonStr);
  } catch {
    throw new Error('AIの応答をJSONとして解析できませんでした。再度お試しください。');
  }

  // バリデーション
  if (!slideData.slides || !Array.isArray(slideData.slides)) {
    throw new Error('生成されたデータにスライド情報が含まれていません。');
  }

  if (slideData.slides.length === 0) {
    throw new Error('スライドが1枚も生成されませんでした。');
  }

  const validTypes = [
    'title', 'toc', 'section', 'content', 'bullets',
    'data', 'chart', 'comparison', 'quote', 'summary',
  ];

  for (const slide of slideData.slides) {
    if (!validTypes.includes(slide.type)) {
      console.warn(`不明なスライドタイプ: ${slide.type}、contentとして扱います`);
      slide.type = 'content';
    }
    if (!slide.title) {
      slide.title = '';
    }
  }

  return slideData;
}
