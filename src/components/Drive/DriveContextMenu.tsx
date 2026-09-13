import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Copy, FolderPlus, Heart, Info, Pencil, RotateCcw, Scissors, Trash2, ClipboardPaste } from 'lucide-react';
import type { DriveNode } from '../../types/drive';
import './DriveContextMenu.css';

type Props = {
  x: number;
  y: number;
  node: DriveNode | null;
  canPaste: boolean;
  onClose: () => void;
  onRename: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onToggleFavourite: () => void;
  onShowInfo: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
  onNewFolder: () => void;
};

export default function DriveContextMenu({
  x,
  y,
  node,
  canPaste,
  onClose,
  onRename,
  onCopy,
  onCut,
  onPaste,
  onToggleFavourite,
  onShowInfo,
  onTrash,
  onRestore,
  onDeleteForever,
  onNewFolder,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: x, top: y });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.min(x, window.innerWidth - rect.width - 10);
    const top = Math.min(y, window.innerHeight - rect.height - 10);
    setPos({ left: Math.max(8, left), top: Math.max(8, top) });
  }, [x, y]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const item = (label: string, Icon: typeof Copy, onClick: () => void, opts?: { danger?: boolean; disabled?: boolean }) => (
    <div
      className={`drive-ctx-item${opts?.danger ? ' is-danger' : ''}${opts?.disabled ? ' is-disabled' : ''}`}
      onClick={() => {
        if (opts?.disabled) return;
        onClose();
        onClick();
      }}
    >
      <Icon size={15} strokeWidth={2} />
      <span>{label}</span>
    </div>
  );

  return (
    <div ref={ref} className="drive-ctx-menu" style={{ left: pos.left, top: pos.top }}>
      {node === null &&
        item('Thư mục mới', FolderPlus, onNewFolder)}
      {node === null &&
        item('Dán', ClipboardPaste, onPaste, { disabled: !canPaste })}

      {node && node.trashed && (
        <>
          {item('Khôi phục', RotateCcw, onRestore)}
          {item('Thông tin', Info, onShowInfo)}
          <div className="drive-ctx-sep" />
          {item('Xóa vĩnh viễn', Trash2, onDeleteForever, { danger: true })}
        </>
      )}

      {node && !node.trashed && (
        <>
          {item('Đổi tên', Pencil, onRename)}
          {item('Sao chép', Copy, onCopy)}
          {item('Cắt', Scissors, onCut)}
          {item('Dán vào đây', ClipboardPaste, onPaste, { disabled: !canPaste })}
          {item(node.favourite ? 'Bỏ ưa thích' : 'Thêm vào ưa thích', Heart, onToggleFavourite)}
          {item('Thông tin', Info, onShowInfo)}
          <div className="drive-ctx-sep" />
          {item('Chuyển vào thùng rác', Trash2, onTrash, { danger: true })}
        </>
      )}
    </div>
  );
}