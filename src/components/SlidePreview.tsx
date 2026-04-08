'use client';

import { useState } from 'react';
import type { Slide } from '@/types';

interface SlidePreviewProps {
  slides: Slide[];
}

function SlideTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    title: 'タイトル',
    toc: '目次',
    section: 'セクション',
    content: 'コンテンツ',
    bullets: '箇条書き',
    data: 'データ',
    chart: 'グラフ',
    comparison: '比較',
    quote: '引用',
    summary: 'まとめ',
  };

  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-violet-500/20 text-violet-300 uppercase tracking-wide">
      {labels[type] || type}
    </span>
  );
}

function SlideCard({ slide }: { slide: Slide }) {
  return (
    <div className="aspect-[16/9] rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 flex flex-col justify-between overflow-hidden">
      <div className="space-y-3 min-h-0 overflow-hidden">
        <SlideTypeLabel type={slide.type} />

        <h3 className={`font-bold leading-tight ${
          slide.type === 'title' || slide.type === 'section'
            ? 'text-xl text-white'
            : 'text-base text-gray-100'
        }`}>
          {slide.title}
        </h3>

        {slide.subtitle && (
          <p className="text-sm text-violet-300">{slide.subtitle}</p>
        )}

        {slide.content && (
          <p className="text-xs text-gray-400 line-clamp-3">{slide.content}</p>
        )}

        {slide.bullets && slide.bullets.length > 0 && (
          <ul className="space-y-1">
            {slide.bullets.slice(0, 4).map((b, i) => (
              <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                <span className="text-violet-400 mt-0.5 flex-shrink-0">{'\u2022'}</span>
                <span className="line-clamp-1">{b}</span>
              </li>
            ))}
            {slide.bullets.length > 4 && (
              <li className="text-xs text-gray-500">
                ...他 {slide.bullets.length - 4} 項目
              </li>
            )}
          </ul>
        )}

        {slide.quote && (
          <div className="italic text-xs text-gray-400">
            <p className="line-clamp-2">&ldquo;{slide.quote.text}&rdquo;</p>
            <p className="text-violet-400 mt-1">-- {slide.quote.author}</p>
          </div>
        )}

        {slide.data && (
          <div className="text-xs text-gray-500">
            {'\u{1F4CA}'} {slide.data.headers.length}列 x {slide.data.rows.length}行のテーブル
          </div>
        )}

        {slide.chart && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <span>{slide.chart.type === 'pie' ? '🥧' : slide.chart.type === 'line' ? '📈' : '📊'}</span>
            {slide.chart.type === 'pie' ? '円' : slide.chart.type === 'line' ? '折れ線' : slide.chart.type === 'doughnut' ? 'ドーナツ' : '棒'}グラフ
            ({slide.chart.labels?.length || 0}項目)
          </div>
        )}

        {slide.columns && (
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <p className="font-medium text-gray-300">{slide.columns.left.title}</p>
            </div>
            <div>
              <p className="font-medium text-gray-300">{slide.columns.right.title}</p>
            </div>
          </div>
        )}
      </div>

      {slide.notes && (
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-[10px] text-gray-600 line-clamp-1">
            {'\u{1F4DD}'} {slide.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SlidePreview({ slides }: SlidePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (slides.length === 0) return null;

  const goTo = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          {'\u25C0'} 前へ
        </button>

        <span className="text-sm text-gray-400">
          <span className="text-violet-300 font-semibold">{currentIndex + 1}</span>
          <span className="mx-1">/</span>
          <span>{slides.length}</span>
        </span>

        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === slides.length - 1}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
        >
          次へ {'\u25B6'}
        </button>
      </div>

      {/* Slide */}
      <SlideCard slide={slides[currentIndex]} />

      {/* Thumbnail strip */}
      {slides.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`flex-shrink-0 w-20 h-12 rounded-md border text-[8px] p-1 text-left overflow-hidden transition-all ${
                i === currentIndex
                  ? 'border-violet-400 bg-violet-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/25'
              }`}
            >
              <span className="text-gray-400 line-clamp-2">{slide.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
