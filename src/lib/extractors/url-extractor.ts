/**
 * URL からテキストを抽出する
 * Cheerio パッケージを使用してHTMLをパース
 */

import * as cheerio from 'cheerio';

const MAX_CONTENT_LENGTH = 8000;

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * URL からWebページのテキストコンテンツを抽出する
 * script / style タグを除去し、article / main / body からテキストを取得
 */
export async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ja,en;q=0.9',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(
      `URLの取得に失敗しました: ${response.status} ${response.statusText}`
    );
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 不要な要素を除去
  $('script, style, noscript, iframe, svg, nav, footer, header').remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();
  $('.sidebar, .nav, .menu, .footer, .header, .advertisement, .ad').remove();

  // メインコンテンツを優先的に取得
  let text = '';

  const contentSelectors = ['article', 'main', '[role="main"]', '.content', '.post', '.entry'];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      text = element.text();
      break;
    }
  }

  // メインコンテンツが見つからない場合は body 全体を使用
  if (!text) {
    text = $('body').text();
  }

  // テキストの整形
  text = text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();

  // 文字数制限
  if (text.length > MAX_CONTENT_LENGTH) {
    text = text.substring(0, MAX_CONTENT_LENGTH) + '...';
  }

  if (!text) {
    throw new Error('ページからテキストを抽出できませんでした');
  }

  return text;
}
