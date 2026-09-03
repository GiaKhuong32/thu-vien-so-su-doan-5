
type IconProps = { className?: string };

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: 'false' as const,
};

export const IcFirst = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="16 5 9 12 16 19" />
    <line x1="7" y1="5" x2="7" y2="19" />
  </svg>
);

export const IcPrev = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="14 5 7 12 14 19" />
  </svg>
);

export const IcNext = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="10 5 17 12 10 19" />
  </svg>
);

export const IcLast = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="8 5 15 12 8 19" />
    <line x1="17" y1="5" x2="17" y2="19" />
  </svg>
);

export const IcZoomIn = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const IcZoomOut = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const IcFullscreen = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="4 9 4 4 9 4" />
    <polyline points="15 4 20 4 20 9" />
    <polyline points="20 15 20 20 15 20" />
    <polyline points="9 20 4 20 4 15" />
  </svg>
);

export const IcFullscreenExit = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="9 4 9 9 4 9" />
    <polyline points="20 9 15 9 15 4" />
    <polyline points="15 20 15 15 20 15" />
    <polyline points="4 15 9 15 9 20" />
  </svg>
);

export const IcSearch = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="11" cy="11" r="7" />
    <line x1="16.5" y1="16.5" x2="21" y2="21" />
  </svg>
);

export const IcNav = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

export const IcShare = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.6" y1="10.5" x2="15.4" y2="6.5" />
    <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
  </svg>
);

export const IcDownload = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

export const IcPrint = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polyline points="6 9 6 3 18 3 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

export const IcSoundOn = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7" />
    <path d="M18.5 5.5a9 9 0 0 1 0 13" />
  </svg>
);

export const IcSoundOff = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5" />
    <line x1="16" y1="9" x2="22" y2="15" />
    <line x1="22" y1="9" x2="16" y2="15" />
  </svg>
);

export const IcClose = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const IcBookmark = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IcBookmarkFill = ({ className }: IconProps) => (
  <svg {...base} className={className} fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

export const IcSpread = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="3" y="5" width="8" height="14" rx="1" />
    <rect x="13" y="5" width="8" height="14" rx="1" />
  </svg>
);

export const IcSingle = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="7" y="4" width="10" height="16" rx="1" />
  </svg>
);

export const IcBack = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <line x1="20" y1="12" x2="4" y2="12" />
    <polyline points="10 6 4 12 10 18" />
  </svg>
);

export const IcCopy = ({ className }: IconProps) => (
  <svg {...base} className={className}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);
