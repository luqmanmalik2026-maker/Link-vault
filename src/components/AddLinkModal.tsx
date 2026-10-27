import React, { useState, useEffect } from 'react';
import { 
  X, 
  Globe, 
  Smartphone, 
  Apple, 
  Radio, 
  Sparkles, 
  Check, 
  ExternalLink,
  Tag,
  FileText
} from 'lucide-react';
import { Language, LinkCategory, LinkItem, LinkType } from '../types/link';
import { detectLinkInfo, validateUrlInput } from '../utils/linkDetector';
import { translations } from '../utils/translations';

interface AddLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLink: (link: Omit<LinkItem, 'id' | 'createdAt' | 'clickCount'> & { id?: string }) => void;
  editingLink?: LinkItem | null;
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

const PRESETS = [
  { label: 'Google', url: 'https://www.google.com', category: 'General' as LinkCategory },
  { label: 'WhatsApp (Play Store)', url: 'https://play.google.com/store/apps/details?id=com.whatsapp', category: 'Apps & Mobile' as LinkCategory },
  { label: 'YouTube', url: 'https://www.youtube.com', category: 'Entertainment' as LinkCategory },
  { label: 'GitHub', url: 'https://github.com', category: 'Development' as LinkCategory },
  { label: 'Wikipedia', url: 'https://www.wikipedia.org', category: 'Learning' as LinkCategory },
  { label: 'WhatsApp Deep Link', url: 'whatsapp://send?text=Namaste', category: 'Apps & Mobile' as LinkCategory }
];

export const AddLinkModal: React.FC<AddLinkModalProps> = ({
  isOpen,
  onClose,
  onSaveLink,
  editingLink,
  lang
}) => {
  const t = translations[lang];

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LinkCategory>('General');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [detectedType, setDetectedType] = useState<LinkType>('website');
  const [platformName, setPlatformName] = useState('');
  const [validationError, setValidationError] = useState('');

  // Sync state if editing
  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url);
      setTitle(editingLink.title);
      setDescription(editingLink.description || '');
      setCategory(editingLink.category);
      setTagsInput(editingLink.tags.join(', '));
      setNotes(editingLink.notes || '');
      setDetectedType(editingLink.linkType);
      setPlatformName(editingLink.platformName || '');
      setValidationError('');
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setCategory('General');
      setTagsInput('');
      setNotes('');
      setDetectedType('website');
      setPlatformName('');
      setValidationError('');
    }
  }, [editingLink, isOpen]);

  // Handle URL change with auto-detection
  const handleUrlChange = (value: string) => {
    setUrl(value);
    setValidationError('');

    if (value.trim().length > 3) {
      const info = detectLinkInfo(value);
      setDetectedType(info.linkType);
      setPlatformName(info.platformName);

      // Only auto-fill if user hasn't typed a custom title yet
      if (!title || title === detectLinkInfo(url).inferredTitle) {
        setTitle(info.inferredTitle);
      }
      if (category === 'General') {
        setCategory(info.suggestedCategory);
      }
    }
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setUrl(preset.url);
    const info = detectLinkInfo(preset.url);
    setTitle(preset.label);
    setCategory(preset.category);
    setDetectedType(info.linkType);
    setPlatformName(info.platformName);
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateUrlInput(url);
    if (!validation.isValid) {
      setValidationError(validation.error || 'अमान्य लिंक (Invalid URL)');
      return;
    }

    const finalTitle = title.trim() || detectLinkInfo(url).inferredTitle || 'Untitled Link';
    const splitTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveLink({
      ...(editingLink ? { id: editingLink.id } : {}),
      url: validation.cleanUrl,
      title: finalTitle,
      description: description.trim() || undefined,
      category,
      tags: splitTags.length > 0 ? splitTags : [category],
      linkType: detectedType,
      platformName: platformName || undefined,
      isFavorite: editingLink ? editingLink.isFavorite : false,
      notes: notes.trim() || undefined
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {editingLink ? t.editLink : t.addLink}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'hi' ? 'किसी भी वेबसाइट, ऐप या डीप-लिंक को जोड़ें' : 'Add any website, mobile app, or deep link'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick Presets */}
          {!editingLink && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                {t.quickFillTitle}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition flex items-center gap-1"
                  >
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.inputUrlLabel} <span className="text-pink-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={t.inputUrlPlaceholder}
                autoFocus
                className="w-full pl-3 pr-24 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              {/* Type Badge */}
              <div className="absolute right-2 top-2">
                <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  {detectedType === 'android_app' && <Smartphone className="w-3 h-3 text-emerald-400" />}
                  {detectedType === 'ios_app' && <Apple className="w-3 h-3 text-cyan-400" />}
                  {detectedType === 'deep_link' && <Radio className="w-3 h-3 text-pink-400" />}
                  {detectedType === 'website' && <Globe className="w-3 h-3 text-indigo-400" />}
                  <span>{platformName || detectedType}</span>
                </span>
              </div>
            </div>
            {validationError && (
              <p className="text-xs text-rose-400 mt-1 font-medium">{validationError}</p>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.inputTitleLabel} <span className="text-pink-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.inputTitlePlaceholder}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.inputCategoryLabel}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LinkCategory)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-white">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t.inputTagsLabel}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder={t.inputTagsPlaceholder}
                  className="w-full pl-8 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.inputNotesLabel}
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.inputNotesPlaceholder}
                className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
              />
              <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{editingLink ? t.saveChanges : t.submitAdd}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
