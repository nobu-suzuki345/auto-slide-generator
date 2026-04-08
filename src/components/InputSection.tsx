'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

type TabType = 'file' | 'url' | 'keyword';

interface InputSectionProps {
  onInputsChange: (files: File[], urls: string[], keyword: string) => void;
}

const ACCEPTED_EXTENSIONS: Record<string, string[]> = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
};

export default function InputSection({ onInputsChange }: InputSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('file');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [keyword, setKeyword] = useState('');

  const updateParent = useCallback(
    (newFiles: File[], newUrls: string[], newKeyword: string) => {
      onInputsChange(newFiles, newUrls, newKeyword);
    },
    [onInputsChange]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const updated = [...files, ...acceptedFiles];
      setFiles(updated);
      updateParent(updated, urls, keyword);
    },
    [files, urls, keyword, updateParent]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_EXTENSIONS,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const updated = files.filter((_, i) => i !== index);
    setFiles(updated);
    updateParent(updated, urls, keyword);
  };

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    try {
      new URL(trimmed);
    } catch {
      return;
    }
    if (urls.includes(trimmed)) return;
    const updated = [...urls, trimmed];
    setUrls(updated);
    setUrlInput('');
    updateParent(files, updated, keyword);
  };

  const removeUrl = (index: number) => {
    const updated = urls.filter((_, i) => i !== index);
    setUrls(updated);
    updateParent(files, updated, keyword);
  };

  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    updateParent(files, urls, value);
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'file', label: 'ファイル', icon: '\u{1F4C4}' },
    { key: 'url', label: 'URL', icon: '\u{1F517}' },
    { key: 'keyword', label: 'キーワード', icon: '\u{1F50D}' },
  ];

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'xlsx': return '\u{1F4CA}';
      case 'docx': return '\u{1F4DD}';
      case 'md': return '\u{1F4D1}';
      default: return '\u{1F4C4}';
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-gradient-to-b from-violet-500/20 to-transparent text-violet-300 border-b-2 border-violet-400'
                : 'text-gray-400 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5">
        {/* File Tab */}
        {activeTab === 'file' && (
          <div className="space-y-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? 'border-violet-400 bg-violet-500/10'
                  : 'border-white/20 hover:border-violet-400/50 hover:bg-white/5'
              }`}
            >
              <input {...getInputProps()} />
              <div className="text-4xl mb-3">{'\u{1F4E4}'}</div>
              <p className="text-gray-300 font-medium">
                {isDragActive
                  ? 'ここにドロップ...'
                  : 'ファイルをドラッグ＆ドロップ'}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                またはクリックして選択
              </p>
              <p className="text-gray-600 text-xs mt-3">
                対応形式: .txt, .md, .xlsx, .docx
              </p>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{fileIcon(file.name)}</span>
                      <span className="text-sm text-gray-300 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-gray-500 hover:text-red-400 transition-colors ml-3 flex-shrink-0"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* URL Tab */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addUrl()}
                placeholder="https://example.com"
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/15 text-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all"
              />
              <button
                onClick={addUrl}
                className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
              >
                追加
              </button>
            </div>

            {urls.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {urls.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/30 max-w-full"
                  >
                    <span className="text-xs">{'\u{1F517}'}</span>
                    <span className="text-sm text-violet-300 truncate max-w-[250px]">
                      {url}
                    </span>
                    <button
                      onClick={() => removeUrl(index)}
                      className="text-violet-400 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {urls.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">
                URLを追加してWebページの内容を取得します
              </p>
            )}
          </div>
        )}

        {/* Keyword Tab */}
        {activeTab === 'keyword' && (
          <div className="space-y-3">
            <textarea
              value={keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              placeholder="例: AI技術の最新動向、リモートワークの生産性向上策..."
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/15 text-gray-200 placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/50 transition-all"
            />
            <p className="text-gray-500 text-xs">
              キーワードやトピックを入力すると、AIがリサーチして内容を生成します
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
