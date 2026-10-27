import React, { useState } from 'react';
import { 
  ExternalLink, 
  Eye, 
  QrCode, 
  Copy, 
  Check, 
  Star, 
  Trash2, 
  Edit3, 
  Smartphone, 
  Globe, 
  Share2, 
  Film, 
  Apple, 
  Radio, 
  Tag as TagIcon,
  Flame
} from 'lucide-react';
import { Language, LinkItem, ViewMode } from '../types/link';
import { extractDomain, getFaviconUrl } from '../utils/linkDetector';
import { translations } from '../utils/translations';

interface LinkCardProps {
  link: LinkItem;
  viewMode: ViewMode;
  lang: Language;
  onLaunch: (link: LinkItem) => void;
  onPreview: (link: LinkItem) => void;
  onShowQr: (link: LinkItem) => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  viewMode,
  lang,
  onLaunch,
  onPreview,
  onShowQr,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  const t = translations[lang];
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const domain = extractDomain(link.url);
  const favicon = getFaviconUrl(link.url);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getPlatformIcon = () => {
    switch (link.linkType) {
      case 'android_app':
        return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'ios_app':
        return <Apple className="w-4 h-4 text-sky-400" />;
      case 'deep_link':
        return <Radio className="w-4 h-4 text-pink-400" />;
      case 'media_stream':
        return <Film className="w-4 h-4 text-rose-400" />;
      case 'social_media':
        return <Share2 className="w-4 h-4 text-violet-400" />;
      default:
        return <Globe className="w-4 h-4 text-indigo-400" />;
    }
  };

  // Compact Row View
  if (viewMode === 'compact') {
    return (
      <div className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-3 transition group">
        
        {/* Left: Favicon & Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggleFavorite(link.id)}
            className="text-slate-500 hover:text-amber-400 transition"
            aria-label={link.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700/60 overflow-hidden">
            {favicon && !imgError ? (
              <img
                src={favicon}
                alt=""
                onError={() => setImgError(true)}
                className="w-5 h-5 object-contain"
                loading="lazy"
              />
            ) : (
              getPlatformIcon()
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 
                onClick={() => onLaunch(link)}
                className="text-xs sm:text-sm font-bold text-white hover:text-indigo-400 transition truncate cursor-pointer"
              >
                {link.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden sm:inline-block">
                {link.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-md">
              {domain} • {link.url}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={copied ? t.copied : t.copyLink}
            aria-label="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => onShowQr(link)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={t.showQrCode}
            aria-label="Show QR Code"
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {link.url.startsWith('http') && (
            <button
              type="button"
              onClick={() => onPreview(link)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={t.previewSandbox}
              aria-label="Preview link"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onEdit(link)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={t.editLink}
            aria-label="Edit link"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(link.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title={t.deleteLink}
            aria-label="Delete link"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onLaunch(link)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition ml-1"
          >
            <span>{t.openLink}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

      </div>
    );
  }

  // Grid Card View (Default)
  return (
    <div className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          
          {/* Favicon & Category */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-slate-800/90 flex items-center justify-center shrink-0 border border-slate-700/80 overflow-hidden shadow-sm group-hover:border-indigo-500/40 transition">
              {favicon && !imgError ? (
                <img
                  src={favicon}
                  alt=""
                  onError={() => setImgError(true)}
                  className="w-6 h-6 object-contain"
                  loading="lazy"
                />
              ) : (
                getPlatformIcon()
              )}
            </div>

            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 inline-block mb-0.5">
                {link.category}
              </span>
              <p className="text-[11px] text-slate-400 font-medium truncate block">
                {link.platformName || domain}
              </p>
            </div>
          </div>

          {/* Favorite & Delete Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleFavorite(link.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 transition"
              aria-label={link.isFavorite ? `Remove ${link.title} from favorites` : `Add ${link.title} to favorites`}
            >
              <Star className={`w-4 h-4 ${link.isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => onEdit(link)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
              aria-label={`Edit ${link.title}`}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition"
              aria-label={`Delete ${link.title}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Title */}
        <h3 
          onClick={() => onLaunch(link)}
          className="text-sm font-bold text-white group-hover:text-indigo-300 transition line-clamp-1 cursor-pointer mb-1"
          title={link.title}
        >
          {link.title}
        </h3>

        {/* Description or Notes */}
        {link.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-2 leading-relaxed">
            {link.description}
          </p>
        )}
        {link.notes && !link.description && (
          <p className="text-xs text-slate-400 italic line-clamp-2 mb-2">
            "{link.notes}"
          </p>
        )}

        {/* URL Pill */}
        <div className="bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 truncate mb-3 flex items-center justify-between gap-2">
          <span className="truncate">{link.url}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white shrink-0 p-0.5 rounded transition"
            title={copied ? t.copied : t.copyLink}
            aria-label={`Copy URL for ${link.title}`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Tags */}
        {link.tags && link.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {link.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-800 flex items-center gap-1"
              >
                <TagIcon className="w-2.5 h-2.5 text-indigo-400" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-2">
        
        {/* Launch counter */}
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{link.clickCount || 0} {t.clicks}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onShowQr(link)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
            title={t.showQrCode}
            aria-label={`Generate QR code for ${link.title}`}
          >
            <QrCode className="w-3.5 h-3.5" />
          </button>

          {link.url.startsWith('http') && (
            <button
              type="button"
              onClick={() => onPreview(link)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title={t.previewSandbox}
              aria-label={`Preview ${link.title}`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => onLaunch(link)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition active:scale-95"
            aria-label={`Launch ${link.title}`}
          >
            <span>{t.openLink}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
