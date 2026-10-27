import { LinkItem } from '../types/link';

export const STORAGE_KEY = 'linkvault_items_v2';
export const SETTINGS_KEY = 'linkvault_settings_v2';

export const INITIAL_SEED_LINKS: LinkItem[] = [
  {
    id: 'seed-1',
    url: 'https://play.google.com/store/apps/details?id=com.whatsapp',
    title: 'WhatsApp Messenger (Android)',
    description: 'Direct Google Play Store link for WhatsApp messaging & calling app.',
    category: 'Apps & Mobile',
    tags: ['Android App', 'Chat', 'Messaging'],
    linkType: 'android_app',
    platformName: 'Google Play Store',
    isFavorite: true,
    clickCount: 14,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    lastVisitedAt: Date.now() - 1000 * 60 * 60 * 2,
    notes: 'Official Android app link'
  },
  {
    id: 'seed-2',
    url: 'https://www.youtube.com',
    title: 'YouTube - Videos & Music',
    description: 'Watch video tutorials, music, podcasts, and global live streams.',
    category: 'Entertainment',
    tags: ['Video', 'Streaming', 'Media'],
    linkType: 'media_stream',
    platformName: 'YouTube',
    isFavorite: true,
    clickCount: 29,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    lastVisitedAt: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'seed-3',
    url: 'https://github.com',
    title: 'GitHub - Where the world builds software',
    description: 'Code repositories, open source collaboration, and developer tools.',
    category: 'Development',
    tags: ['Code', 'OpenSource', 'Dev'],
    linkType: 'website',
    platformName: 'GitHub',
    isFavorite: false,
    clickCount: 8,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    lastVisitedAt: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    id: 'seed-4',
    url: 'https://www.wikipedia.org',
    title: 'Wikipedia - The Free Encyclopedia',
    description: 'Free online encyclopedia created and maintained by a world community of volunteers.',
    category: 'Learning',
    tags: ['Education', 'Knowledge', 'Reference'],
    linkType: 'website',
    platformName: 'Wikipedia',
    isFavorite: true,
    clickCount: 11,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'seed-5',
    url: 'https://apps.apple.com/app/duolingo-language-lessons/id570060128',
    title: 'Duolingo: Language Lessons (iOS)',
    description: 'Apple App Store link to learn languages quickly with fun gameified lessons.',
    category: 'Apps & Mobile',
    tags: ['iOS App', 'Learning', 'AppStore'],
    linkType: 'ios_app',
    platformName: 'Apple App Store',
    isFavorite: false,
    clickCount: 5,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4
  },
  {
    id: 'seed-6',
    url: 'whatsapp://send?text=Namaste',
    title: 'WhatsApp Direct Share (Deep Link)',
    description: 'App intent / protocol URI that opens WhatsApp directly on your device.',
    category: 'Apps & Mobile',
    tags: ['DeepLink', 'AppProtocol'],
    linkType: 'deep_link',
    platformName: 'WHATSAPP',
    isFavorite: false,
    clickCount: 3,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1
  }
];

export function loadLinksFromStorage(): LinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_LINKS));
      return INITIAL_SEED_LINKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_SEED_LINKS;
  } catch (err) {
    console.error('Failed to load links from localStorage:', err);
    return INITIAL_SEED_LINKS;
  }
}

export function saveLinksToStorage(links: LinkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (err) {
    console.error('Failed to save links to localStorage:', err);
  }
}

export function exportLinksToJson(links: LinkItem[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(links, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `hanan-malik-links-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportLinksToHtmlBookmarks(links: LinkItem[]): void {
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file. It will be read and overwritten. DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Hanan Malik Bookmarks</TITLE>
<H1>Hanan Malik Bookmarks</H1>
<DL><p>
`;

  links.forEach((item) => {
    const addDate = Math.floor(item.createdAt / 1000);
    const tags = item.tags.join(',');
    html += `    <DT><A HREF="${item.url}" ADD_DATE="${addDate}" TAGS="${tags}">${item.title}</A>\n`;
    if (item.description) {
      html += `    <DD>${item.description}\n`;
    }
  });

  html += '</DL><p>\n';

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `linkvault-bookmarks-${new Date().toISOString().slice(0, 10)}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
