import './PlaceholderMedia.css';

type Props = {
  label: string;
  ratio?: string;
  variant?: 'image' | 'video';
  className?: string;
};

export default function PlaceholderMedia({ label, ratio = '16 / 9', variant = 'image', className = '' }: Props) {
  return (
    <div className={`placeholder-media placeholder-media--${variant} ${className}`} style={{ aspectRatio: ratio }}>
      <span className="placeholder-media__icon" aria-hidden="true">
        {variant === 'video' ? <PlayIcon /> : <ImageIcon />}
      </span>
      <span className="placeholder-media__label">{label}</span>
    </div>
  );
}

function ImageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.6" />
      <path d="m4 17 5-5 4 4 3-3 4 4" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor">
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8.5v7l6-3.5-6-3.5Z" />
    </svg>
  );
}