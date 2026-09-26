import { useEffect, useRef } from 'react';
import './VideoModal.css';

type Props = {
  open: boolean;
  src: string | null;
  title?: string;
  onClose: () => void;
};

export default function VideoModal({ open, src, title, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKey);
    document.body.classList.add('modal-open');

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open && videoRef.current) {
      videoRef.current.pause();
    }
  }, [open]);

  if (!open || !src) return null;

  return (
    <div className="video-modal" role="dialog" aria-modal="true" aria-label={title || 'Xem phim'}>
      <div className="video-modal__backdrop" onClick={onClose} />

      <div className="video-modal__panel">
        <button
          type="button"
          className="video-modal__close"
          aria-label="Đóng"
          onClick={onClose}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="m6 6 12 12M18 6 6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {title && <div className="video-modal__title">{title}</div>}

        <div className="video-modal__frame">
          <video
            ref={videoRef}
            className="video-modal__video"
            src={src}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
          >
            <source src={src} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        </div>
      </div>
    </div>
  );
}
