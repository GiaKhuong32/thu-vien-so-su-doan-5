import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import './NewFolderModal.css';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
};

export default function NewFolderModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName('');
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    onCreate(name.trim() || 'Thư mục mới');
  };

  return (
    <div
      className="drive-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drive-modal-box">
        <div className="drive-modal-title">
          <span>Thư mục mới</span>
          <button type="button" className="drive-modal-close" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <label className="drive-modal-label" htmlFor="drive-new-folder-name">
          Tên thư mục
        </label>
        <input
          id="drive-new-folder-name"
          ref={inputRef}
          type="text"
          className="drive-modal-input"
          placeholder="Thư mục mới"
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') onClose();
          }}
        />

        <div className="drive-modal-actions">
          <button type="button" className="drive-modal-btn is-cancel" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="drive-modal-btn is-confirm" onClick={submit}>
            Tạo
          </button>
        </div>
      </div>
    </div>
  );
}