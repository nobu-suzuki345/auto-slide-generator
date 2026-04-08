/**
 * Word ファイル (.docx) からテキストを抽出する
 * mammoth パッケージを使用
 */

import mammoth from 'mammoth';

/**
 * Word ファイルをプレーンテキストに変換する
 */
export async function extractTextFromWord(
  input: Buffer | File
): Promise<string> {
  let buffer: Buffer;

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = input;
  }

  const result = await mammoth.extractRawText({ buffer });

  if (result.messages && result.messages.length > 0) {
    const warnings = result.messages
      .filter((m) => m.type === 'warning')
      .map((m) => m.message);
    if (warnings.length > 0) {
      console.warn('Word抽出時の警告:', warnings.join(', '));
    }
  }

  return result.value.trim();
}
