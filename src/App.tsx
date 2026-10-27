/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Sparkles, 
  Link as LinkIcon, 
  Smartphone, 
  QrCode, 
  ExternalLink, 
  Layers, 
  Check, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Language, LinkItem, SortOption, ViewMode } from './types/link';
import { loadLinksFromStorage, saveLinksToStorage } from './utils/storage';
import { detectLinkInfo, validateUrlInput } from './utils/linkDetector';
import { translations } from './utils/translations';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { LinkCard } from './components/LinkCard';
import { AddLinkModal } from './components/AddLinkModal';
import { QrModal } from './components/QrModal';
import { PreviewModal } from './components/PreviewModal';
import { BulkAddModal } from './components/BulkAddModal';

export default function App() {
  const [links, setLinks] = useState<LinkItem[]>(() => loadLinksFromStorage());
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('linkvault_lang');
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });
  const t = translations[lang];

  const handleToggleLang = () => {
    setLang((prev) => {
      const next = prev === 'en' ? 'hi' : 'en';
      try {
        localStorage.setItem('linkvault_lang', next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'favorites' | 'apps' | 'websites' | 'social' | 'media'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Quick Direct Input Bar state
  const [quickUrl, setQuickUrl] = useState('');
  const [quickError, setQuickError] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [qrModalLink, setQrModalLink] = useState<LinkItem | null>(null);
  const [previewModalLink, setPreviewModalLink] = useState<LinkItem | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync links to localStorage
  useEffect(() => {
    saveLinksToStorage(links);
  }, [links]);

  // Handle Quick Link Submit
  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUrlInput(quickUrl);
    if (!validation.isValid) {
      setQuickError(validation.error || 'अमान्य लिंक (Invalid URL)');
      return;
    }

    const info = detectLinkInfo(validation.cleanUrl);
    const newLink: LinkItem = {
      id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      url: validation.cleanUrl,
      title: info.inferredTitle,
      category: info.suggestedCategory,
      tags: [info.suggestedCategory, info.platformName].filter(Boolean),
      linkType: info.linkType,
      platformName: info.platformName,
      isFavorite: false,
      clickCount: 0,
      createdAt: Date.now()
    };

    setLinks((prev) => [newLink, ...prev]);
    setQuickUrl('');
    setQuickError('');
    showToast(lang === 'hi' ? 'लिंक सफलतापूर्वक जोड़ा गया!' : 'Link successfully added!');
  };

  // Save Link from Modal (Add or Edit)
  const handleSaveModalLink = (data: Omit<LinkItem, 'id' | 'createdAt' | 'clickCount'> & { id?: string }) => {
    if (data.id) {
      // Edit existing
      setLinks((prev) =>
        prev.map((item) =>
          item.id === data.id
            ? {
                ...item,
                url: data.url,
                title: data.title,
                description: data.description,
                category: data.category,
                tags: data.tags,
                linkType: data.linkType,
                platformName: data.platformName,
                notes: data.notes
              }
            : item
        )
      );
      showToast(lang === 'hi' ? 'लिंक अपडेट हो गया!' : 'Link updated successfully!');
    } else {
      // Add new
      const newLink: LinkItem = {
        ...data,
        id: `link-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: Date.now(),
        clickCount: 0
      };
      setLinks((prev) => [newLink, ...prev]);
      showToast(lang === 'hi' ? 'नया लिंक सेव हो गया!' : 'New link saved!');
    }
    setEditingLink(null);
  };

  // Bulk Add Handler
  const handleBulkAdd = (newItems: Omit<LinkItem, 'id' | 'createdAt' | 'clickCount'>[]) => {
    const formatted: LinkItem[] = newItems.map((item, index) => ({
      ...item,
      id: `bulk-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now() - index * 1000,
      clickCount: 0
    }));

    setLinks((prev) => [...formatted, ...prev]);
    showToast(
      lang === 'hi'
        ? `${formatted.length} नए लिंक जोड़े गए!`
        : `${formatted.length} links added successfully!`
    );
  };

  // Import JSON Links
  const handleImportLinks = (imported: LinkItem[]) => {
    const existingUrls = new Set(links.map((l) => l.url.toLowerCase()));
    const validImports = imported.filter((item) => item.url && !existingUrls.has(item.url.toLowerCase()));

    if (validImports.length === 0) {
      showToast(lang === 'hi' ? 'कोई नया लिंक नहीं मिला (पहले से मौजूद हैं)' : 'No new links found (all already exist)');
      return;
    }

    const normalized = validImports.map((item) => ({
      ...item,
      id: item.id || `imp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: item.createdAt || Date.now(),
      clickCount: item.clickCount || 0
    }));

    setLinks((prev) => [...normalized, ...prev]);
    showToast(
      lang === 'hi'
        ? `${normalized.length} लिंक्स सफलतापूर्वक आयात किए गए!`
        : `${normalized.length} links successfully imported!`
    );
  };

  // Launch / Open Link Handler
  const handleLaunchLink = (link: LinkItem) => {
    // Increment click counter and update lastVisitedAt
    setLinks((prev) =>
      prev.map((item) =>
        item.id === link.id
          ? {
              ...item,
              clickCount: (item.clickCount || 0) + 1,
              lastVisitedAt: Date.now()
            }
          : item
      )
    );

    // Open link
    if (link.linkType === 'deep_link' || !link.url.startsWith('http')) {
      window.location.href = link.url;
    } else {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (id: string) => {
    setLinks((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  // Delete Link
  const handleDeleteLink = (id: string) => {
    const target = links.find((l) => l.id === id);
    const confirmText = lang === 'hi' 
      ? `क्या आप "${target?.title || 'यह लिंक'}" हटाना चाहते हैं?`
      : `Delete "${target?.title || 'this link'}"?`;

    if (window.confirm(confirmText)) {
      setLinks((prev) => prev.filter((item) => item.id !== id));
      showToast(lang === 'hi' ? 'लिंक हटा दिया गया' : 'Link deleted');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (link: LinkItem) => {
    setEditingLink(link);
    setIsAddModalOpen(true);
  };

  // Filter & Sort Logic
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          (l.description && l.description.toLowerCase().includes(q)) ||
          (l.notes && l.notes.toLowerCase().includes(q)) ||
          (l.platformName && l.platformName.toLowerCase().includes(q)) ||
          l.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Active quick filter
    if (activeFilter === 'favorites') {
      result = result.filter((l) => l.isFavorite);
    } else if (activeFilter === 'apps') {
      result = result.filter((l) => ['android_app', 'ios_app', 'deep_link'].includes(l.linkType));
    } else if (activeFilter === 'websites') {
      result = result.filter((l) => l.linkType === 'website');
    } else if (activeFilter === 'social') {
      result = result.filter((l) => l.linkType === 'social_media');
    } else if (activeFilter === 'media') {
      result = result.filter((l) => l.linkType === 'media_stream');
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((l) => l.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return b.createdAt - a.createdAt;
        case 'oldest':
          return a.createdAt - b.createdAt;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'most_clicked':
          return (b.clickCount || 0) - (a.clickCount || 0);
        case 'recently_visited':
          return (b.lastVisitedAt || 0) - (a.lastVisitedAt || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [links, searchQuery, activeFilter, selectedCategory, sortOption]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans','Noto_Sans_Devanagari',sans-serif]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white text-xs sm:text-sm font-semibold px-4 py-3 rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenAddModal={() => {
          setEditingLink(null);
          setIsAddModalOpen(true);
        }}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        links={links}
        onImportLinks={handleImportLinks}
      />

      {/* Hero Quick Add Input Section */}
      <section className="relative overflow-hidden border-b border-slate-800/60 bg-gradient-to-b from-slate-900/60 via-slate-950 to-slate-950 py-8 sm:py-10">
        
        {/* Glow ambient circle */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'हानन मलिक लिंक हब' : "Hanan Malik's Link Hub"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            {lang === 'hi' 
              ? 'किसी भी वेबसाइट या ऐप का लिंक यहां डालें' 
              : 'Add any Website or App Link here'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-6">
            {t.subTagline}
          </p>

          {/* Quick Direct Link Input Bar */}
          <form onSubmit={handleQuickAdd} className="max-w-2xl mx-auto">
            <div className="p-1.5 sm:p-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 focus-within:border-indigo-500 transition">
              <div className="flex items-center gap-2.5 px-3 w-full flex-1">
                <LinkIcon className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={quickUrl}
                  onChange={(e) => {
                    setQuickUrl(e.target.value);
                    setQuickError('');
                  }}
                  placeholder={t.inputUrlPlaceholder}
                  className="w-full bg-transparent text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none"
                  aria-label="Enter website or app link"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end px-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(null);
                    setIsAddModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition"
                  title="More options (Category, Tags, Notes)"
                >
                  {lang === 'hi' ? 'विस्तार से' : 'Options'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-600 to-indigo-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.submitAdd}</span>
                </button>
              </div>
            </div>

            {quickError && (
              <p className="text-xs text-rose-400 mt-2 flex items-center justify-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{quickError}</span>
              </p>
            )}
          </form>

          {/* Supported Types Badges */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 mt-6 text-[11px] text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              {lang === 'hi' ? 'वेबसाइट (Websites)' : 'Websites'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {lang === 'hi' ? 'गूगल प्ले स्टोर ऐप्स' : 'Google Play Apps'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              {lang === 'hi' ? 'एप्पल ऐप स्टोर ऐप्स' : 'Apple App Store'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-400" />
              {lang === 'hi' ? 'ऐप डीप-लिंक (whatsapp://)' : 'Deep Links'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {lang === 'hi' ? 'मोबाइल QR कोड' : 'Instant QR Code'}
            </span>
          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Filter & Search Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          sortOption={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          links={links}
          lang={lang}
        />

        {/* Links Grid or List */}
        {filteredLinks.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5'
                : 'space-y-2.5'
            }
          >
            {filteredLinks.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                viewMode={viewMode}
                lang={lang}
                onLaunch={handleLaunchLink}
                onPreview={(l) => setPreviewModalLink(l)}
                onShowQr={(l) => setQrModalLink(l)}
                onToggleFavorite={handleToggleFavorite}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteLink}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-16 text-center border border-dashed border-slate-800 rounded-3xl bg-slate-900/40 p-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <LinkIcon className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {t.emptyTitle}
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {t.emptySubtitle}
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingLink(null);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addLink}</span>
            </button>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Hanan Malik</span>
            <span>•</span>
            <span>{lang === 'hi' ? 'वेबसाइट व मोबाइल ऐप लिंक संग्रह' : 'Universal Web & App Hub'}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>{links.length} {lang === 'hi' ? 'लिंक्स सहेजे गए' : 'Links saved'}</span>
            <span>•</span>
            <span>{lang === 'hi' ? 'स्थानीय संग्रहण (LocalStorage)' : 'Offline LocalStorage'}</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddLinkModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLink(null);
        }}
        onSaveLink={handleSaveModalLink}
        editingLink={editingLink}
        lang={lang}
      />

      <QrModal
        isOpen={!!qrModalLink}
        link={qrModalLink}
        onClose={() => setQrModalLink(null)}
        lang={lang}
      />

      <PreviewModal
        isOpen={!!previewModalLink}
        link={previewModalLink}
        onClose={() => setPreviewModalLink(null)}
        lang={lang}
        onLaunch={handleLaunchLink}
      />

      <BulkAddModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onBulkAdd={handleBulkAdd}
        lang={lang}
      />

    </div>
  );
}
