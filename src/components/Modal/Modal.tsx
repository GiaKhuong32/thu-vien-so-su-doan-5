import { useEffect } from 'react';
import type { ReactNode } from 'react';
import './Modal.css';

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

/**
 * Centred dialog, the React equivalent of the original's Bootstrap
 * `#alertComming` modal ("Dự án đang được triển khai").
 * Closes on backdrop click, the × button, or Escape.
 */
export default function Modal({ open, onClose, children }: Props) {
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

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" aria-label="Đóng" onClick={onClose}>
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
        <div className="modal-body">{children}</div>
      </div>
    </div>
      );
}