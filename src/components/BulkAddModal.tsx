import React, { useState } from 'react';
import { X, Layers, Check, AlertCircle } from 'lucide-react';
import { Language, LinkItem } from '../types/link';
import { detectLinkInfo, validateUrlInput } from '../utils/linkDetector';
import { translations } from '../utils/translations';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBulkAdd: (links: Omit<LinkItem, 'id' | 'createdAt' | 'clickCount'>[]) => void;
  lang: Language;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  onBulkAdd,
  lang
}) => {
  const t = translations[lang];
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setError(lang === 'hi' ? 'कम से कम एक लिंक दर्ज करें' : 'Please enter at least one link');
      return;
    }

    const newItems: Omit<LinkItem, 'id' | 'createdAt' | 'clickCount'>[] = [];

    for (const raw of lines) {
      const validation = validateUrlInput(raw);
      if (validation.isValid) {
        const info = detectLinkInfo(validation.cleanUrl);
        newItems.push({
          url: validation.cleanUrl,
          title: info.inferredTitle,
          category: info.suggestedCategory,
          tags: [info.suggestedCategory, info.platformName].filter(Boolean),
          linkType: info.linkType,
          platformName: info.platformName,
          isFavorite: false
        });
      }
    }

    if (newItems.length === 0) {
      setError(lang === 'hi' ? 'कोई वैध लिंक नहीं मिला' : 'No valid URLs found in the text');
      return;
    }

    onBulkAdd(newItems);
    setText('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {t.bulkAdd}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'hi' ? 'एक साथ कई लिंक पेस्ट करें' : 'Paste multiple links at once'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            aria-label="Close bulk add modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.bulkInputLabel}
            </label>
            <textarea
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
              placeholder={t.bulkInputPlaceholder}
              autoFocus
              className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition resize-none"
            />
            {error && (
              <p className="text-xs text-rose-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{t.bulkAddSubmit}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
