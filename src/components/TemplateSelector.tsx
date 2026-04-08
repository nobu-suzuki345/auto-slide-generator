'use client';

import { TEMPLATES } from '@/lib/templates';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

const templateMeta: Record<string, { preview: string[]; nameJa: string; descJa: string }> = {
  'corporate-blue': {
    preview: ['#1a365d', '#2b6cb0', '#63b3ed'],
    nameJa: 'コーポレートブルー',
    descJa: 'ビジネス提案・会議資料に最適',
  },
  'modern-dark': {
    preview: ['#1a1a2e', '#16213e', '#0f3460'],
    nameJa: 'モダンダーク',
    descJa: 'テック系・スタートアップ向け',
  },
  'gradient-sunset': {
    preview: ['#e53e3e', '#dd6b20', '#d69e2e'],
    nameJa: 'グラデーションサンセット',
    descJa: 'マーケティング・クリエイティブ向け',
  },
  'minimal-white': {
    preview: ['#f7fafc', '#e2e8f0', '#a0aec0'],
    nameJa: 'ミニマルホワイト',
    descJa: 'レポート・学術発表に最適',
  },
  'tech-neon': {
    preview: ['#0a0a0a', '#7928ca', '#00d4ff'],
    nameJa: 'テックネオン',
    descJa: 'IT・テクノロジー・デモ向け',
  },
  'nature-green': {
    preview: ['#276749', '#38a169', '#68d391'],
    nameJa: 'ナチュラルグリーン',
    descJa: '環境・CSR・ヘルスケア向け',
  },
};

export default function TemplateSelector({
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {TEMPLATES.map((template) => {
        const meta = templateMeta[template.id];
        const isSelected = selectedId === template.id;

        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`group relative rounded-xl p-4 text-left transition-all duration-300 border-2 ${
              isSelected
                ? 'border-violet-400 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                : 'border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8'
            }`}
          >
            {/* Color Preview */}
            <div className="flex gap-1 mb-3 h-12 rounded-lg overflow-hidden">
              {(meta?.preview || [template.colors.primary, template.colors.secondary, template.colors.accent]).map(
                (color, i) => (
                  <div
                    key={i}
                    className="flex-1 transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                )
              )}
            </div>

            {/* Name */}
            <p className={`text-sm font-semibold mb-1 transition-colors ${
              isSelected ? 'text-violet-300' : 'text-gray-200'
            }`}>
              {meta?.nameJa || template.name}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-500 leading-relaxed">
              {meta?.descJa || template.description}
            </p>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
