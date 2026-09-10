import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import {
  Check,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Folder,
  Image as ImageIcon,
  Minus,
  Music,
  Presentation,
  Video,
} from 'lucide-react';
import type { DriveFileKind, DriveNode } from '../../types/drive';
import { getFileKind } from './driveUtils';

/* -------------------------------------------------------------------------- */
/* Biểu tượng theo loại tệp tin                                               */
/* -------------------------------------------------------------------------- */

const KIND_ICON: Record<DriveFileKind, typeof File> = {
  folder: Folder,
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slide: Presentation,
  image: ImageIcon,
  audio: Music,
  video: Video,
  archive: FileArchive,
  text: FileText,
  other: File,
};

export function FileTypeIcon({ node }: { node: DriveNode }) {
  const kind = getFileKind(node);
  const Icon = KIND_ICON[kind];

  return (
    <span className={`mgd-ftype mgd-ftype--${kind}`} aria-hidden="true">
      <Icon className="mgd-icon" />
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Ô chọn                                                                     */
/* -------------------------------------------------------------------------- */

type CheckboxProps = {
  checked: boolean;
  partial?: boolean;
  label: string;
  onChange: (event: React.MouseEvent) => void;
};

export function DriveCheckbox({ checked, partial, label, onChange }: CheckboxProps) {
  const state = partial ? 'is-partial' : checked ? 'is-on' : '';

  return (
    <button
      type="button"
      className={`mgd-check ${state}`}
      role="checkbox"
      aria-checked={partial ? 'mixed' : checked}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onChange(e);
      }}
    >
      {partial ? (
        <Minus className="mgd-icon mgd-icon--sm" />
      ) : (
        <Check className="mgd-icon mgd-icon--sm" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Menu (dùng cho cả menu chuột phải và menu thả xuống)                        */
/* -------------------------------------------------------------------------- */

export type MenuPosition = { x: number; y: number };

type MenuProps = {
  position: MenuPosition;
  onClose: () => void;
  children: ReactNode;
  /** Chiều rộng dự kiến để menu không bị tràn ra khỏi cửa sổ. */
  width?: number;
};

export function DriveMenu({ position, onClose, children, width = 224 }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onClose);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  // Giữ menu nằm trong khung nhìn.
  const left = Math.min(position.x, window.innerWidth - width - 12);
  const top = Math.min(position.y, window.innerHeight - 240);

  return (
    <div
      ref={ref}
      className="mgd-menu"
      role="menu"
      style={{ left: Math.max(8, left), top: Math.max(8, top), minWidth: width }}
    >
      {children}
    </div>
  );
}

type MenuItemProps = {
  icon?: ReactNode;
  label: string;
  hint?: string;
  danger?: boolean;
  disabled?: boolean;
  checked?: boolean;
  onSelect: () => void;
};

export function DriveMenuItem({
  icon,
  label,
  hint,
  danger,
  disabled,
  checked,
  onSelect,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`mgd-menu__item${danger ? ' is-danger' : ''}`}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        onSelect();
      }}
    >
      {icon}
      <span>{label}</span>
      {hint && <span className="mgd-menu__hint">{hint}</span>}
      {checked && <Check className="mgd-icon mgd-icon--sm mgd-menu__check" />}
    </button>
  );
}

export function DriveMenuSeparator() {
  return <div className="mgd-menu__sep" role="separator" />;
}

export function DriveMenuLabel({ children }: { children: ReactNode }) {
  return <div className="mgd-menu__label">{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Hộp thoại                                                                  */
/* -------------------------------------------------------------------------- */

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Có ô nhập tên (dùng cho Thư mục mới / Đổi tên). */
  withInput?: boolean;
  inputLabel?: string;
  defaultValue?: string;
  onConfirm: (value: string) => void;
  onClose: () => void;
};

export function DriveDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Huỷ',
  danger,
  withInput,
  inputLabel,
  defaultValue = '',
  onConfirm,
  onClose,
}: DialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Chọn sẵn phần tên (không gồm phần mở rộng) cho tiện sửa.
    const timer = setTimeout(() => {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      const dot = defaultValue.lastIndexOf('.');
      if (dot > 0) input.setSelectionRange(0, dot);
      else input.select();
    }, 30);

    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, [open, onClose, defaultValue]);

  if (!open) return null;

  const submit = () => {
    const value = withInput ? (inputRef.current?.value ?? '').trim() : '';
    if (withInput && !value) return;
    onConfirm(value);
  };

  return (
    <div className="mgd-dialog__backdrop" role="presentation" onClick={onClose}>
      <div
        className="mgd-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mgd-dialog__title">{title}</h3>
        {description && <p className="mgd-dialog__text">{description}</p>}

        {withInput && (
          <>
            {inputLabel && (
              <label className="mgd-sr" htmlFor="mgd-dialog-input">
                {inputLabel}
              </label>
            )}
            <input
              id="mgd-dialog-input"
              ref={inputRef}
              className="mgd-dialog__input"
              defaultValue={defaultValue}
              placeholder={inputLabel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
            />
          </>
        )}

        <div className="mgd-dialog__actions">
          <button type="button" className="mgd-btn mgd-btn--ghost" onClick={onClose}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`mgd-btn ${danger ? 'mgd-btn--danger' : 'mgd-btn--primary'}`}
            onClick={submit}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
