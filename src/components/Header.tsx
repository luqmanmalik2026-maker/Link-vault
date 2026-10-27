import React, { useRef } from 'react';
import { 
  Compass, 
  Plus, 
  Download, 
  Upload, 
  BookmarkCheck, 
  Layers, 
  Languages,
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Language, LinkItem } from '../types/link';
import { translations } from '../utils/translations';
import { exportLinksToJson, exportLinksToHtmlBookmarks } from '../utils/storage';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  links: LinkItem[];
  onImportLinks: (imported: LinkItem[]) => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenAddModal,
  onOpenBulkModal,
  links,
  onImportLinks
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalLinks = links.length;
  const favoriteCount = links.filter((l) => l.isFavorite).length;
  const totalClicks = links.reduce((acc, curr) => acc + (curr.clickCount || 0), 0);
  const appLinksCount = links.filter((l) => ['android_app', 'ios_app', 'deep_link'].includes(l.linkType)).length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportLinks(parsed);
        } else {
          alert('अमान्य JSON फ़ाइल (Invalid JSON backup file)');
        }
      } catch (err) {
        alert('फ़ाइल पढ़ने में त्रुटि (Failed to read JSON backup file)');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
                <Compass className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                    {t.appTitle}
                  </h1>
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                    Universal Link Hub
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Language toggle for mobile */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={onToggleLang}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                aria-label="Toggle language"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">{t.totalLinks}:</span>
              <span className="font-bold text-white">{totalLinks}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400">{t.filterApps}:</span>
              <span className="font-bold text-white">{appLinksCount}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-slate-400">{t.favoritesCount}:</span>
              <span className="font-bold text-white">{favoriteCount}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <span className="text-slate-400">{t.totalClicks}:</span>
              <span className="font-bold text-white">{totalClicks}</span>
            </div>
          </div>

          {/* Actions: Add Link, Bulk Add, Export/Import, Language */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={onToggleLang}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
              aria-label="Toggle interface language"
            >
              <Languages className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
            </button>

            {/* Export / Import Menu */}
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition"
                aria-label="Backup and export options"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{t.exportData}</span>
              </button>

              <div className="absolute right-0 mt-1 w-56 py-2 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl invisible group-hover:visible group-focus-within:visible opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-all z-50">
                <button
                  type="button"
                  onClick={() => exportLinksToJson(links)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>{t.exportJson}</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportLinksToHtmlBookmarks(links)}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5"
                >
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.exportBookmarks}</span>
                </button>
                <div className="h-px bg-slate-800 my-1" />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2.5"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{t.importJson}</span>
                </button>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Bulk Add Button */}
            <button
              type="button"
              onClick={onOpenBulkModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">{t.bulkAdd}</span>
              <span className="sm:hidden">Bulk</span>
            </button>

            {/* Add Link Primary Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addLink}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
