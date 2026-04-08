/**
 * テキストファイル (.txt / .md) からテキストを抽出する
 */

/**
 * Buffer または File からテキストを読み取る
 * UTF-8 エンコーディングとして処理
 */
export async function extractTextFromFile(
  input: Buffer | File
): Promise<string> {
  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('utf-8').trim();
  }

  return input.toString('utf-8').trim();
}
