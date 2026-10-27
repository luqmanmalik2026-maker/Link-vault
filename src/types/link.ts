export type LinkCategory = 
  | 'General'
  | 'Social'
  | 'Apps & Mobile'
  | 'Productivity'
  | 'Development'
  | 'Entertainment'
  | 'Shopping'
  | 'Tools'
  | 'Learning'
  | 'Custom';

export type LinkType = 
  | 'website'
  | 'android_app'
  | 'ios_app'
  | 'deep_link'
  | 'social_media'
  | 'media_stream';

export interface LinkItem {
  id: string;
  url: string;
  title: string;
  description?: string;
  category: LinkCategory;
  tags: string[];
  linkType: LinkType;
  platformName?: string;
  isFavorite: boolean;
  clickCount: number;
  createdAt: number;
  lastVisitedAt?: number;
  notes?: string;
  customIcon?: string;
}

export type SortOption = 'newest' | 'oldest' | 'alphabetical' | 'most_clicked' | 'recently_visited';

export type ViewMode = 'grid' | 'compact' | 'cards';

export type Language = 'hi' | 'en';
