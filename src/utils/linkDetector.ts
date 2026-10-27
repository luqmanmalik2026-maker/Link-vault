import { LinkCategory, LinkType } from '../types/link';

export interface LinkDetectionResult {
  cleanUrl: string;
  linkType: LinkType;
  platformName: string;
  inferredTitle: string;
  suggestedCategory: LinkCategory;
  domain: string;
  faviconUrl: string;
  isDeepLink: boolean;
}

const COMMON_SCHEMES = [
  'whatsapp:',
  'tg:',
  'telegram:',
  'spotify:',
  'intent:',
  'mailto:',
  'tel:',
  'sms:',
  'slack:',
  'zoommtg:',
  'market:',
  'fb:',
  'twitter:',
  'instagram:'
];

/**
 * Normalizes input text into a proper URL or app URI scheme
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Check if it starts with a recognized custom URI scheme
  for (const scheme of COMMON_SCHEMES) {
    if (trimmed.toLowerCase().startsWith(scheme)) {
      return trimmed;
    }
  }

  // If starts with generic scheme (e.g. customscheme://)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  // If already has http:// or https://
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Otherwise assume https://
  return `https://${trimmed}`;
}

/**
 * Extracts hostname or scheme name for display
 */
export function extractDomain(url: string): string {
  try {
    if (/^[a-zA-Z0-9+.-]+:\/\//.test(url) && !url.startsWith('http')) {
      const match = url.match(/^([a-zA-Z0-9+.-]+):/);
      return match ? `${match[1]}:// app` : 'App Scheme';
    }
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.split('/')[0] || url;
  }
}

/**
 * Returns a high-res favicon URL using Google's public favicon service or a fallback
 */
export function getFaviconUrl(url: string): string {
  try {
    if (/^[a-zA-Z0-9+.-]+:\/\//.test(url) && !url.startsWith('http')) {
      return '';
    }
    const domain = extractDomain(url);
    if (!domain || domain.includes('://')) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  } catch {
    return '';
  }
}

/**
 * Inspects URL to identify platform, type, title hint, and category
 */
export function detectLinkInfo(rawInput: string): LinkDetectionResult {
  const cleanUrl = normalizeUrl(rawInput);
  let domain = '';
  let isDeepLink = false;

  // Custom scheme detection
  for (const scheme of COMMON_SCHEMES) {
    if (cleanUrl.toLowerCase().startsWith(scheme)) {
      isDeepLink = true;
      const schemeName = scheme.replace(':', '');
      return {
        cleanUrl,
        linkType: 'deep_link',
        platformName: schemeName.toUpperCase(),
        inferredTitle: `${schemeName.toUpperCase()} App Link`,
        suggestedCategory: 'Apps & Mobile',
        domain: `${schemeName}://`,
        faviconUrl: '',
        isDeepLink: true
      };
    }
  }

  try {
    const urlObj = new URL(cleanUrl);
    domain = urlObj.hostname.replace(/^www\./, '').toLowerCase();

    // Google Play Store
    if (domain.includes('play.google.com')) {
      const appId = urlObj.searchParams.get('id') || '';
      const formattedAppId = appId ? appId.split('.').pop() || appId : 'Android App';
      const capitalized = formattedAppId.charAt(0).toUpperCase() + formattedAppId.slice(1);
      return {
        cleanUrl,
        linkType: 'android_app',
        platformName: 'Google Play Store',
        inferredTitle: `${capitalized} (Android App)`,
        suggestedCategory: 'Apps & Mobile',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=play.google.com&sz=128',
        isDeepLink: false
      };
    }

    // Apple App Store
    if (domain.includes('apps.apple.com')) {
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      const appNameIndex = pathParts.indexOf('app');
      let appName = 'iOS App';
      if (appNameIndex !== -1 && pathParts[appNameIndex + 1]) {
        appName = decodeURIComponent(pathParts[appNameIndex + 1])
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
      return {
        cleanUrl,
        linkType: 'ios_app',
        platformName: 'Apple App Store',
        inferredTitle: `${appName} (iOS App)`,
        suggestedCategory: 'Apps & Mobile',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
        isDeepLink: false
      };
    }

    // YouTube
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return {
        cleanUrl,
        linkType: 'media_stream',
        platformName: 'YouTube',
        inferredTitle: 'YouTube Video / Channel',
        suggestedCategory: 'Entertainment',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
        isDeepLink: false
      };
    }

    // GitHub
    if (domain.includes('github.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      let repoTitle = 'GitHub';
      if (parts.length >= 2) {
        repoTitle = `${parts[0]}/${parts[1]}`;
      } else if (parts.length === 1) {
        repoTitle = `${parts[0]} on GitHub`;
      }
      return {
        cleanUrl,
        linkType: 'website',
        platformName: 'GitHub',
        inferredTitle: repoTitle,
        suggestedCategory: 'Development',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
        isDeepLink: false
      };
    }

    // Twitter / X
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return {
        cleanUrl,
        linkType: 'social_media',
        platformName: 'X (Twitter)',
        inferredTitle: 'Post on X / Twitter',
        suggestedCategory: 'Social',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=x.com&sz=128',
        isDeepLink: false
      };
    }

    // Instagram
    if (domain.includes('instagram.com')) {
      return {
        cleanUrl,
        linkType: 'social_media',
        platformName: 'Instagram',
        inferredTitle: 'Instagram Profile or Post',
        suggestedCategory: 'Social',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128',
        isDeepLink: false
      };
    }

    // Reddit
    if (domain.includes('reddit.com')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      let rTitle = 'Reddit';
      if (parts.includes('r') && parts[parts.indexOf('r') + 1]) {
        rTitle = `r/${parts[parts.indexOf('r') + 1]}`;
      }
      return {
        cleanUrl,
        linkType: 'social_media',
        platformName: 'Reddit',
        inferredTitle: rTitle,
        suggestedCategory: 'Social',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=128',
        isDeepLink: false
      };
    }

    // LinkedIn
    if (domain.includes('linkedin.com')) {
      return {
        cleanUrl,
        linkType: 'social_media',
        platformName: 'LinkedIn',
        inferredTitle: 'LinkedIn Page',
        suggestedCategory: 'Social',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128',
        isDeepLink: false
      };
    }

    // WhatsApp Web
    if (domain.includes('whatsapp.com')) {
      return {
        cleanUrl,
        linkType: 'social_media',
        platformName: 'WhatsApp',
        inferredTitle: 'WhatsApp Link',
        suggestedCategory: 'Social',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=whatsapp.com&sz=128',
        isDeepLink: false
      };
    }

    // Spotify
    if (domain.includes('spotify.com')) {
      return {
        cleanUrl,
        linkType: 'media_stream',
        platformName: 'Spotify',
        inferredTitle: 'Spotify Music',
        suggestedCategory: 'Entertainment',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
        isDeepLink: false
      };
    }

    // Wikipedia
    if (domain.includes('wikipedia.org')) {
      const parts = urlObj.pathname.split('/').filter(Boolean);
      const articleName = parts[parts.length - 1]
        ? decodeURIComponent(parts[parts.length - 1]).replace(/_/g, ' ')
        : 'Wikipedia Article';
      return {
        cleanUrl,
        linkType: 'website',
        platformName: 'Wikipedia',
        inferredTitle: articleName,
        suggestedCategory: 'Learning',
        domain,
        faviconUrl: 'https://www.google.com/s2/favicons?domain=wikipedia.org&sz=128',
        isDeepLink: false
      };
    }

    // Fallback general website
    const domainName = domain.split('.')[0] || 'Website';
    const formattedTitle = domainName.charAt(0).toUpperCase() + domainName.slice(1);

    return {
      cleanUrl,
      linkType: 'website',
      platformName: domain,
      inferredTitle: formattedTitle,
      suggestedCategory: 'General',
      domain,
      faviconUrl: getFaviconUrl(cleanUrl),
      isDeepLink: false
    };
  } catch {
    return {
      cleanUrl,
      linkType: 'website',
      platformName: cleanUrl,
      inferredTitle: cleanUrl,
      suggestedCategory: 'General',
      domain: cleanUrl,
      faviconUrl: '',
      isDeepLink: false
    };
  }
}

/**
 * Validates whether string is non-empty and formatted appropriately
 */
export function validateUrlInput(input: string): { isValid: boolean; error?: string; cleanUrl: string } {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Please enter a URL (cannot be empty)', cleanUrl: '' };
  }

  const normalized = normalizeUrl(trimmed);

  // Check custom schemes
  for (const scheme of COMMON_SCHEMES) {
    if (normalized.toLowerCase().startsWith(scheme)) {
      return { isValid: true, cleanUrl: normalized };
    }
  }

  // Check URL constructor
  try {
    const parsed = new URL(normalized);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { isValid: true, cleanUrl: normalized };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.')) {
      return { isValid: false, error: 'Invalid domain (e.g. google.com or https://example.com)', cleanUrl: normalized };
    }
    return { isValid: true, cleanUrl: normalized };
  } catch {
    return { isValid: false, error: 'Invalid link format', cleanUrl: normalized };
  }
}
