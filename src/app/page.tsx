'use client';

import { useState, useCallback } from 'react';
import InputSection from '@/components/InputSection';
import TemplateSelector from '@/components/TemplateSelector';
import SlidePreview from '@/components/SlidePreview';
import ProgressBar from '@/components/ProgressBar';
import type { Slide } from '@/types';

type SlideCountOption = 'auto' | 5 | 10 | 15;
type LanguageOption = 'ja' | 'en';

const PASSWORD = 'snamo';
const PROGRESS_STEPS = ['テキスト抽出', 'AI分析・構成', 'スライド生成'];

export default function Home() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);

  // Input state
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');

  // Options
  const [templateId, setTemplateId] = useState('corporate-blue');
  const [slideCount, setSlideCount] = useState<SlideCountOption>('auto');
  const [language, setLanguage] = useState<LanguageOption>('ja');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleInputsChange = useCallback(
    (newFiles: File[], newUrls: string[], newKeyword: string) => {
      setFiles(newFiles);
      setUrls(newUrls);
      setKeyword(newKeyword);
    },
    []
  );

  const hasInput = files.length > 0 || urls.length > 0 || keyword.trim().length > 0;

  const handleGenerate = async () => {
    if (!hasInput) return;

    setIsGenerating(true);
    setError(null);
    setSlides([]);
    setProgressStep(0);

    try {
      // Step 1: Extract text
      setProgressStep(0);
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));
      if (urls.length > 0) {
        formData.append('urls', JSON.stringify(urls));
      }
      if (keyword.trim()) {
        formData.append('keyword', keyword.trim());
      }

      const extractRes = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!extractRes.ok) {
        const data = await extractRes.json();
        throw new Error(data.error || 'テキスト抽出に失敗しました');
      }

      const { text } = await extractRes.json();

      // Step 2: Generate slides with AI
      setProgressStep(1);
      const generateRes = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, slideCount, language }),
      });

      if (!generateRes.ok) {
        const data = await generateRes.json();
        throw new Error(data.error || 'スライド生成に失敗しました');
      }

      const { slides: generatedSlides } = await generateRes.json();

      // Step 3: Done
      setProgressStep(2);
      setSlides(generatedSlides);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (slides.length === 0) return;

    setIsDownloading(true);
    setError(null);

    try {
      const res = await fetch('/api/create-pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides, templateId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ダウンロードに失敗しました');
      }

      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });

      // Method 1: Try standard download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'presentation.pptx';
      a.setAttribute('type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      document.body.appendChild(a);

      // Use setTimeout to ensure the click fires
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            resolve();
          }, 1000);
        }, 100);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ダウンロードに失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  const slideCountOptions: { value: SlideCountOption; label: string }[] = [
    { value: 'auto', label: '自動' },
    { value: 5, label: '5枚' },
    { value: 10, label: '10枚' },
    { value: 15, label: '15枚' },
  ];

  const languageOptions: { value: LanguageOption; label: string }[] = [
    { value: 'ja', label: '日本語' },
    { value: 'en', label: 'English' },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent mb-2">
            Auto Slide Generator
          </h1>
          <p className="text-gray-500 text-sm mb-8">AIが自動でプレゼン資料を作成します</p>
          <div className="max-w-xs mx-auto border border-white/10 rounded-2xl p-6 bg-white/5">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">🔒 パスワードを入力</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (password === PASSWORD) { setIsLoggedIn(true); }
                  else { setPasswordError(true); }
                }
              }}
              placeholder="パスワード"
              className={`w-full px-4 py-3 bg-black/30 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors mb-3 ${
                passwordError ? 'border-red-500' : 'border-white/10 focus:border-violet-500'
              }`}
            />
            {passwordError && <p className="text-red-400 text-xs mb-3">パスワードが正しくありません</p>}
            <button
              onClick={() => {
                if (password === PASSWORD) { setIsLoggedIn(true); }
                else { setPasswordError(true); }
              }}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-bold transition-all"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Background gradient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-violet-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent">
            Auto Slide Generator
          </h1>
          <p className="mt-2 text-gray-400 text-sm sm:text-base">
            AIが自動でプロフェッショナルなプレゼン資料を作成します
          </p>
        </header>

        <div className="space-y-8">
          {/* Step 1: Input */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold">1</span>
              入力ソースを選択
            </h2>
            <InputSection onInputsChange={handleInputsChange} />
          </section>

          {/* Step 2: Template */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold">2</span>
              テンプレートを選択
            </h2>
            <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />
          </section>

          {/* Step 3: Options */}
          <section>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center text-xs font-bold">3</span>
              オプション設定
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 space-y-5">
              {/* Slide count */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">スライド枚数</label>
                <div className="flex flex-wrap gap-2">
                  {slideCountOptions.map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setSlideCount(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        slideCount === opt.value
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">出力言語</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        language === opt.value
                          ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                          : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Generate Button */}
          <div className="pt-2">
            <button
              onClick={handleGenerate}
              disabled={!hasInput || isGenerating}
              className="w-full py-4 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-[0.98]"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  生成中...
                </span>
              ) : (
                'スライドを生成する'
              )}
            </button>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProgressBar currentStep={progressStep} steps={PROGRESS_STEPS} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          {slides.length > 0 && !isGenerating && (
            <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold">
                  {'\u2713'}
                </span>
                プレビュー
              </h2>
              <SlidePreview slides={slides} />

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 active:scale-[0.98]"
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    ダウンロード中...
                  </span>
                ) : (
                  'PowerPointをダウンロード'
                )}
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-gray-600">
          Powered by DeepSeek AI + PptxGenJS
        </footer>
      </div>
    </div>
  );
}
