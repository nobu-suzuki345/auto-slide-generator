/**
 * Excel ファイル (.xlsx) からテキストを抽出する
 * SheetJS (xlsx) パッケージを使用
 */

import * as XLSX from 'xlsx';

/**
 * Excel ファイルのセルデータをテキストとして抽出する
 * 全シートを読み取り、タブ区切りで行を結合する
 */
export async function extractTextFromExcel(
  input: Buffer | File
): Promise<string> {
  let buffer: Buffer;

  if (input instanceof File) {
    const arrayBuffer = await input.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } else {
    buffer = input;
  }

  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const parts: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    parts.push(`Sheet: ${sheetName}`);

    const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });

    for (const row of rows) {
      if (!row || row.length === 0) continue;

      const cells = row.map((cell) => {
        if (cell === null || cell === undefined) return '';
        return String(cell);
      });

      // 空行をスキップ
      if (cells.every((c) => c === '')) continue;

      parts.push(cells.join('\t'));
    }

    parts.push(''); // シート間に空行
  }

  return parts.join('\n').trim();
}
