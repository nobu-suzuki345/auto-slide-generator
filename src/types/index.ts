// スライドタイプ定義
export type SlideType =
  | 'title'
  | 'toc'
  | 'section'
  | 'content'
  | 'bullets'
  | 'data'
  | 'comparison'
  | 'quote'
  | 'summary'
  | 'chart';

// チャートデータ
export interface ChartData {
  type: 'bar' | 'pie' | 'line' | 'doughnut';
  title?: string;
  labels: string[];
  datasets: {
    name: string;
    values: number[];
  }[];
}

// スライド構造
export interface Slide {
  type: SlideType;
  title: string;
  subtitle?: string;
  content?: string;
  bullets?: string[];
  data?: {
    headers: string[];
    rows: string[][];
  };
  chart?: ChartData;
  columns?: {
    left: { title: string; bullets: string[] };
    right: { title: string; bullets: string[] };
  };
  quote?: {
    text: string;
    author: string;
  };
  notes?: string;
  imagePrompt?: string;
}

// AI が生成するスライドデータ
export interface SlideData {
  slides: Slide[];
}

// デザインテンプレート
export interface Template {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    titleText: string;
  };
  fonts: {
    title: string;
    body: string;
  };
  style: {
    titleLayout: 'center' | 'left-bold' | 'split' | 'bottom-bar' | 'diagonal' | 'overlay';
    bulletIcon: 'circle' | 'arrow' | 'check' | 'dash' | 'number' | 'diamond';
    decorations: ('sidebar' | 'corner-circle' | 'top-gradient' | 'bottom-line' | 'diagonal-stripe' | 'dot-pattern')[];
  };
}

// 入力ソース
export interface InputSource {
  type: 'file' | 'url' | 'keyword';
  content: string;
  filename?: string;
  fileType?: string;
}
