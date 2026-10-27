import React, { useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Star, 
  Smartphone, 
  Globe, 
  Share2, 
  Film, 
  ArrowUpDown, 
  LayoutGrid, 
  List,
  Filter
} from 'lucide-react';
import { Language, LinkCategory, LinkItem, SortOption, ViewMode } from '../types/link';
import { translations } from '../utils/translations';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  activeFilter: 'all' | 'favorites' | 'apps' | 'websites' | 'social' | 'media';
  onFilterChange: (f: 'all' | 'favorites' | 'apps' | 'websites' | 'social' | 'media') => void;
  sortOption: SortOption;
  onSortChange: (s: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  links: LinkItem[];
  lang: Language;
}

const CATEGORIES: LinkCategory[] = [
  'General',
  'Apps & Mobile',
  'Social',
  'Productivity',
  'Development',
  'Entertainment',
  'Shopping',
  'Tools',
  'Learning',
  'Custom'
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  activeFilter,
  onFilterChange,
  sortOption,
  onSortChange,
  viewMode,
  onViewModeChange,
  links,
  lang
}) => {
  const t = translations[lang];
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const countForFilter = {
    all: links.length,
    favorites: links.filter((l) => l.isFavorite).length,
    apps: links.filter((l) => ['android_app', 'ios_app', 'deep_link'].includes(l.linkType)).length,
    websites: links.filter((l) => l.linkType === 'website').length,
    social: links.filter((l) => l.linkType === 'social_media').length,
    media: links.filter((l) => l.linkType === 'media_stream').length
  };

  return (
    <div className="space-y-4 mb-6">
      
      {/* Search & Top Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        
        {/* Search Field */}
        <div className="relative flex-1 max-w-xl">
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-white rounded-lg"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & View Mode Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          
          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="appearance-none pl-8 pr-8 py-2.5 bg-slate-900 border border-slate-700/80 rounded-2xl text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm transition"
            >
              <option value="newest">{t.sortNewest}</option>
              <option value="oldest">{t.sortOldest}</option>
              <option value="alphabetical">{t.sortAlphabetical}</option>
              <option value="most_clicked">{t.sortMostClicked}</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3.5 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl p-1 shadow-sm">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
              aria-label="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('compact')}
              className={`p-1.5 rounded-xl transition ${
                viewMode === 'compact' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Compact View"
              aria-label="Compact View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Quick Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <span>{t.filterAll}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('favorites')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'favorites'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
          <span>{t.filterFavorites}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.favorites}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('apps')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'apps'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.filterApps}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.apps}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('websites')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'websites'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>{t.filterWebsites}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.websites}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('social')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'social'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-pink-400" />
          <span>{t.filterSocial}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.social}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('media')}
          className={`px-3 py-1.5 rounded-xl font-medium transition shrink-0 flex items-center gap-1.5 ${
            activeFilter === 'media'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-rose-400" />
          <span>{t.filterMedia}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {countForFilter.media}
          </span>
        </button>

      </div>

      {/* Category Pills Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        <span className="text-slate-500 font-medium flex items-center gap-1 mr-1 shrink-0">
          <Filter className="w-3 h-3" />
          {t.inputCategoryLabel}:
        </span>

        <button
          type="button"
          onClick={() => onCategoryChange('all')}
          className={`px-2.5 py-1 rounded-lg transition shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-slate-200 text-slate-950 font-bold'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          {t.categoryAll}
        </button>

        {CATEGORIES.map((cat) => {
          const count = links.filter((l) => l.category === cat).length;
          if (count === 0 && selectedCategory !== cat) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-lg transition shrink-0 flex items-center gap-1 ${
                selectedCategory === cat
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{cat}</span>
              <span className="text-[9px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
