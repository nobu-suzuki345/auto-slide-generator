# Auto Slide Generator - 設計書

## 1. システム概要

テキスト、マークダウン、Excel、Word、URL、キーワードなど様々な入力ソースから、AIが内容を分析・構造化し、リッチなデザインのPowerPointスライドを自動生成するシステム。複数のデザインテンプレートから選択可能。

### コンセプト
- **多彩な入力**: txt / md / xlsx / docx / URL / キーワード
- **AI駆動**: DeepSeekが内容を分析・要約・スライド構成を自動設計
- **リッチデザイン**: 複数のプロフェッショナルなテンプレートから選択
- **ワンクリック生成**: アップロード → テンプレート選択 → ダウンロード

## 2. 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| UI | React 18 + Tailwind CSS |
| PowerPoint生成 | PptxGenJS |
| AI（内容分析・構造化） | DeepSeek API (deepseek-reasoner) |
| ファイル読み取り | |
| - テキスト/MD | 直接読み取り |
| - Excel (.xlsx) | SheetJS (xlsx) |
| - Word (.docx) | mammoth |
| - URL | Cheerio |
| デプロイ | Vercel |

## 3. システムアーキテクチャ

```
【Step 1: 入力】
  ファイルアップロード or URL入力 or キーワード入力
      ↓
【Step 2: テキスト抽出】
  入力タイプに応じて処理:
  ・.txt / .md → そのまま読み取り
  ・.xlsx → SheetJS でセルデータ抽出
  ・.docx → mammoth でテキスト抽出
  ・URL → Cheerio でWebページスクレイピング
  ・キーワード → DeepSeekが内容をリサーチ＆生成
      ↓
【Step 3: AI分析・スライド構成設計】
  DeepSeek Reasoner に入力テキストを送信
  → スライド構成をJSON形式で生成:
    ・タイトルスライド
    ・目次
    ・各セクション（見出し + 本文 + 箇条書き）
    ・データスライド（表・グラフ用）
    ・まとめスライド
      ↓
【Step 4: テンプレート適用】
  ユーザーが選択したデザインテンプレートを適用
  → 色、フォント、レイアウト、背景を設定
      ↓
【Step 5: PowerPoint生成】
  PptxGenJS でスライドを構築
  → .pptx ファイルとしてダウンロード
```

## 4. ディレクトリ構成

```
auto-slide-generator/
├── docs/
│   └── design.md                  # 本設計書
├── src/
│   ├── app/
│   │   ├── layout.tsx             # ルートレイアウト
│   │   ├── page.tsx               # メインページ
│   │   └── api/
│   │       ├── extract/
│   │       │   └── route.ts       # テキスト抽出API
│   │       ├── generate-slides/
│   │       │   └── route.ts       # AI スライド構成生成API
│   │       └── create-pptx/
│   │           └── route.ts       # PowerPointファイル生成API
│   ├── components/
│   │   ├── InputSection.tsx        # 入力セクション（ファイル/URL/キーワード）
│   │   ├── TemplateSelector.tsx    # テンプレート選択
│   │   ├── SlidePreview.tsx        # スライドプレビュー
│   │   ├── ProgressBar.tsx         # 生成進捗表示
│   │   └── DownloadButton.tsx      # ダウンロードボタン
│   ├── lib/
│   │   ├── extractors/
│   │   │   ├── text-extractor.ts   # .txt/.md 読み取り
│   │   │   ├── excel-extractor.ts  # .xlsx 読み取り
│   │   │   ├── word-extractor.ts   # .docx 読み取り
│   │   │   └── url-extractor.ts    # URL スクレイピング
│   │   ├── deepseek.ts            # DeepSeek API クライアント
│   │   ├── slide-builder.ts       # PptxGenJS スライド構築
│   │   └── templates/
│   │       ├── index.ts           # テンプレート定義
│   │       ├── corporate-blue.ts  # コーポレートブルー
│   │       ├── modern-dark.ts     # モダンダーク
│   │       ├── gradient-sunset.ts # グラデーションサンセット
│   │       ├── minimal-white.ts   # ミニマルホワイト
│   │       ├── tech-neon.ts       # テックネオン
│   │       └── nature-green.ts    # ナチュラルグリーン
│   └── types/
│       └── index.ts               # 型定義
├── public/
│   └── template-previews/         # テンプレートプレビュー画像
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
└── .env.local                     # DeepSeek APIキー
```

## 5. デザインテンプレート一覧

### 6種類のリッチテンプレート

| # | テンプレート名 | 特徴 | 用途 |
|---|--------------|------|------|
| 1 | Corporate Blue | 青系グラデーション、プロフェッショナル | ビジネス提案、会議資料 |
| 2 | Modern Dark | ダークテーマ、シャープなデザイン | テック系、スタートアップ |
| 3 | Gradient Sunset | オレンジ〜ピンクのグラデーション | マーケティング、クリエイティブ |
| 4 | Minimal White | 白背景、余白を活かしたシンプルデザイン | レポート、学術発表 |
| 5 | Tech Neon | 暗い背景にネオンカラーのアクセント | IT・テクノロジー、デモ |
| 6 | Nature Green | 緑系、落ち着いたトーン | 環境・CSR、ヘルスケア |

### テンプレートが定義するもの
- 背景色 / グラデーション / 背景画像
- タイトルのフォント・サイズ・色・位置
- 本文のフォント・サイズ・色
- アクセントカラー（箇条書きのドット、区切り線等）
- ヘッダー / フッターのデザイン
- スライドレイアウトのバリエーション（タイトル/2カラム/箇条書き/データ等）

## 6. スライド構成（AIが生成するJSON）

DeepSeekが入力テキストを分析し、以下のJSON構造でスライド構成を生成する。

```typescript
interface SlideData {
  slides: Slide[];
}

interface Slide {
  type: 'title' | 'toc' | 'section' | 'content' | 'bullets' | 'data' | 'comparison' | 'quote' | 'summary';
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  data?: {
    headers: string[];
    rows: string[][];
  };
  columns?: {
    left: { title: string; bullets: string[] };
    right: { title: string; bullets: string[] };
  };
  quote?: { text: string; author: string };
  notes?: string;        // スピーカーノート
  imagePrompt?: string;  // 将来の画像生成用
}
```

### スライドタイプ一覧

| タイプ | 説明 | レイアウト |
|--------|------|-----------|
| title | タイトルスライド | 大きなタイトル + サブタイトル |
| toc | 目次 | 番号付きリスト |
| section | セクション区切り | 大きな見出しのみ |
| content | テキストコンテンツ | タイトル + 本文 |
| bullets | 箇条書き | タイトル + 箇条書きリスト |
| data | データ/表 | タイトル + テーブル |
| comparison | 比較（2カラム） | 左右に並べた情報 |
| quote | 引用 | 大きな引用文 + 出典 |
| summary | まとめ | タイトル + 要点リスト |

## 7. 画面設計

### メインページ（1画面で完結）

```
┌──────────────────────────────────────────────────────┐
│  📊 Auto Slide Generator                             │
│  AI が自動でプレゼン資料を作成します                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ Step 1: 入力 ──────────────────────────────┐    │
│  │  [📄 ファイル] [🔗 URL] [🔍 キーワード]      │    │
│  │                                              │    │
│  │  ┌──────────────────────────────────┐       │    │
│  │  │ ファイルをドラッグ＆ドロップ       │       │    │
│  │  │ または クリックして選択            │       │    │
│  │  │ 対応: txt, md, xlsx, docx        │       │    │
│  │  └──────────────────────────────────┘       │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌─ Step 2: テンプレート選択 ──────────────────┐    │
│  │  [Corporate] [Modern] [Sunset]              │    │
│  │  [Minimal]   [Neon]   [Nature]              │    │
│  │  ※ 選択中のテンプレートがプレビュー表示      │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ┌─ Step 3: オプション ───────────────────────┐    │
│  │  スライド枚数: [自動] [5枚] [10枚] [15枚]   │    │
│  │  言語: [日本語] [英語]                       │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  [🚀 スライドを生成する]                              │
│                                                      │
│  ┌─ プレビュー ──────────────────────────────┐     │
│  │  スライド1/10  [◀] [▶]                     │     │
│  │  ┌────────────────────┐                    │     │
│  │  │                    │                    │     │
│  │  │  スライドプレビュー  │                    │     │
│  │  │                    │                    │     │
│  │  └────────────────────┘                    │     │
│  │  [💾 PowerPointをダウンロード]               │     │
│  └──────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## 8. API Routes 詳細

### 8.1 POST /api/extract

入力ファイル/URL/キーワードからテキストを抽出する。

**リクエスト:** FormData（ファイル） or JSON（URL/キーワード）
**レスポンス:** `{ text: string, sourceType: string, metadata: object }`

### 8.2 POST /api/generate-slides

抽出テキストからDeepSeekでスライド構成を生成する。

**リクエスト:**
```json
{
  "text": "抽出されたテキスト...",
  "slideCount": "auto" | 5 | 10 | 15,
  "language": "ja" | "en"
}
```
**レスポンス:** `{ slides: Slide[] }`

### 8.3 POST /api/create-pptx

スライド構成 + テンプレートからPowerPointファイルを生成する。

**リクエスト:**
```json
{
  "slides": [...],
  "templateId": "corporate-blue"
}
```
**レスポンス:** .pptx ファイル（バイナリ）

## 9. DeepSeek プロンプト設計

```
あなたはプレゼンテーション構成の専門家です。
以下のテキストを分析し、プロフェッショナルなプレゼンテーションのスライド構成をJSON形式で生成してください。

ルール:
1. タイトルスライドから始める
2. 目次スライドを入れる
3. セクション区切りを適切に入れる
4. 箇条書きは1スライド最大5項目
5. データがあれば表スライドを使う
6. 比較データがあれば2カラム比較スライドを使う
7. 印象的な引用があれば引用スライドを使う
8. まとめスライドで締める
9. スピーカーノートも付ける
10. 日本語で出力
```

## 10. 環境変数

```
# DeepSeek API
DEEPSEEK_API_KEY=your_deepseek_api_key
```

## 11. 依存パッケージ

```json
{
  "dependencies": {
    "next": "^14",
    "react": "^18",
    "react-dom": "^18",
    "pptxgenjs": "^3.12",
    "openai": "^4",
    "xlsx": "^0.18",
    "mammoth": "^1.8",
    "cheerio": "^1.0",
    "react-dropzone": "^14"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/react": "^18",
    "@types/node": "^20",
    "tailwindcss": "^3",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

※ DeepSeek APIはOpenAI互換のため、`openai`パッケージで接続可能

## 12. デプロイ

- Vercelにデプロイ
- 環境変数: DEEPSEEK_API_KEY のみ
- Vercel Serverless FunctionsでPowerPoint生成
- maxDuration: 60秒（DeepSeekの思考時間を考慮）

## 13. コスト概算

| 処理 | API | コスト目安 |
|------|-----|-----------|
| スライド構成生成 | DeepSeek Reasoner | ~$0.03-0.10 |
| **1回のスライド生成** | | **~$0.03-0.10** |
