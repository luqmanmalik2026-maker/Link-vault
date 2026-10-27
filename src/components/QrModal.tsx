import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { X, Download, Copy, Check, QrCode as QrIcon, Smartphone } from 'lucide-react';
import { Language, LinkItem } from '../types/link';
import { translations } from '../utils/translations';

interface QrModalProps {
  link: LinkItem | null;
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const QrModal: React.FC<QrModalProps> = ({ link, isOpen, onClose, lang }) => {
  const t = translations[lang];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && link && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        link.url,
        {
          width: 256,
          margin: 2,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isOpen, link]);

  const handleDownload = () => {
    if (!canvasRef.current || !link) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${link.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen || !link) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 text-center">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
          aria-label="Close QR Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto mb-3">
          <QrIcon className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-white mb-1">
          {link.title}
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto truncate mb-4">
          {link.url}
        </p>

        {/* QR Code Canvas Card */}
        <div className="p-3 bg-white rounded-2xl inline-block shadow-inner mx-auto mb-4">
          <canvas ref={canvasRef} className="rounded-xl w-[220px] h-[220px]" />
        </div>

        {/* Phone Scan Hint */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-5 bg-slate-800/60 py-2 px-3 rounded-xl border border-slate-700/50">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] leading-tight text-left">
            {t.qrScanHint}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copied : t.copyLink}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>

      </div>
    </div>
  );
};
