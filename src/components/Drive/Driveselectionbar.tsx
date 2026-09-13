import { CheckSquare, RotateCcw, Scissors, Trash2, X } from 'lucide-react';
import type { DriveSection } from '../../types/drive';
import './DriveSelectionBar.css';

type Props = {
  count: number;
  totalCount: number;
  section: DriveSection;
  onClear: () => void;
  onSelectAll: () => void;
  onCut: () => void;
  onTrash: () => void;
  onRestore: () => void;
  onDeleteForever: () => void;
};

export default function DriveSelectionBar({ count, totalCount, section, onClear, onSelectAll, onCut, onTrash, onRestore, onDeleteForever }: Props) {
  if (count === 0) return null;

  const isAllSelected = count === totalCount && totalCount > 0;

  return (
    <div className="drive-selection-bar">
      <div className="drive-selection-bar__left">
        <button type="button" className="drive-selection-bar__clear" title="Bỏ chọn" onClick={onClear}>
          <X size={15} strokeWidth={2.2} />
        </button>
        <span>Đã chọn {count} mục</span>
      </div>

      <div className="drive-selection-bar__actions">
        <button type="button" className="drive-selection-btn" onClick={onSelectAll} title={isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}>
          <CheckSquare size={14} strokeWidth={2} />
          {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
        </button>

        {section === 'trash' ? (
          <>
            <button type="button" className="drive-selection-btn" onClick={onRestore}>
              <RotateCcw size={14} strokeWidth={2} />
              Khôi phục
            </button>
            <button type="button" className="drive-selection-btn is-danger" onClick={onDeleteForever}>
              <Trash2 size={14} strokeWidth={2} />
              Xóa vĩnh viễn
            </button>
          </>
        ) : (
          <>
            <button type="button" className="drive-selection-btn" onClick={onCut}>
              <Scissors size={14} strokeWidth={2} />
              Cắt / Chuyển đi
            </button>
            <button type="button" className="drive-selection-btn is-danger" onClick={onTrash}>
              <Trash2 size={14} strokeWidth={2} />
              Chuyển vào thùng rác
            </button>
          </>
        )}
      </div>
    </div>
  );
}