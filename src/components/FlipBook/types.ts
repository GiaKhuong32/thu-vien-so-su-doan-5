export type FlipBookSource = {
  src?: string;
  pages?: string[];
};

export type BookMeta = {
  title?: string;
  author?: string;
  category?: string;
  downloadUrl?: string;
  shareUrl?: string;
  backUrl?: string;
};


export type OutlineItem = {
  title: string;
  page: number | null;
  level: number;
};


export type SearchHit = {
  page: number;
  
  excerpt: string;
  
  start: number;
  length: number;
};

export type RenderedPage = {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
};

export type PanelTab = 'thumbnails' | 'index' | 'bookmarks';

export type FlipDirection = 'next' | 'prev';

export type ViewMode = 'spread' | 'single';