import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  Monitor, 
  Tablet, 
  Smartphone, 
  AlertCircle, 
  ShieldCheck, 
  RotateCw 
} from 'lucide-react';
import { Language, LinkItem } from '../types/link';
import { translations } from '../utils/translations';

interface PreviewModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLaunch: (link: LinkItem) => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export const PreviewModal: React.FC<PreviewModalProps> = ({
  link,
  isOpen,
  onClose,
  lang,
  onLaunch
}) => {
  const t = translations[lang];
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  if (!isOpen || !link) return null;

  const isDeepLink = link.linkType === 'deep_link' || !link.url.startsWith('http');

  const widthClasses: Record<DeviceMode, string> = {
    desktop: 'w-full max-w-5xl h-[80vh]',
    tablet: 'w-[768px] h-[80vh] mx-auto',
    mobile: 'w-[390px] h-[780px] mx-auto'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className={`relative bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden ${widthClasses[device]}`}>
        
        {/* Preview Top Bar */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          
          {/* Link Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs">
              {link.title}
            </h3>
            <span className="text-[11px] text-slate-400 truncate hidden md:inline max-w-sm">
              ({link.url})
            </span>
          </div>

          {/* Device View Toggles */}
          {!isDeepLink && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  device === 'desktop' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  device === 'tablet' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1 ${
                  device === 'mobile' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isDeepLink && (
              <button
                type="button"
                onClick={() => setIframeKey((k) => k + 1)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Refresh preview"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => onLaunch(link)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
            >
              <span>{t.openDirectly}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Security & Frame Notice Banner */}
        {!isDeepLink && (
          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">
                {t.previewNotSupported}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onLaunch(link)}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline shrink-0"
            >
              {t.openDirectly}
            </button>
          </div>
        )}

        {/* Main Content Preview */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
          {isDeepLink ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center">
                <Smartphone className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">App URI / Deep Link</h4>
              <p className="text-xs text-slate-400">
                {t.deepLinkNotice}
              </p>
              <code className="text-xs bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-pink-300 break-all">
                {link.url}
              </code>
              <button
                type="button"
                onClick={() => onLaunch(link)}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-500/20 transition flex items-center gap-2"
              >
                <span>{t.openLink}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <iframe
              key={iframeKey}
              src={link.url}
              title={link.title}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="w-full h-full border-0 bg-white"
            />
          )}
        </div>

      </div>
    </div>
  );
};
