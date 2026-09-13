import { useRef } from 'react';
import { FolderPlus, Search, Upload } from 'lucide-react';
import './DriveTopbar.css';

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUpload: (files: File[]) => void;
  onNewFolder: () => void;
  isRootLevel: boolean;
};

export default function DriveTopbar({ searchTerm, onSearchChange, onUpload, onNewFolder, isRootLevel }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="drive-topbar">
      {!isRootLevel && (
        <button type="button" className="btn btn-primary drive-btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} strokeWidth={2.3} />
          Tải lên
        </button>
      )}

      {!isRootLevel && (
        <button type="button" className="btn btn-outline-primary drive-btn" onClick={onNewFolder}>
          <FolderPlus size={15} strokeWidth={2} />
          Thư mục mới
        </button>
      )}

      <div className="drive-search">
        <Search size={15} strokeWidth={2} />
        <input
          type="text"
          placeholder="Tìm trong kho lưu trữ"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            onUpload(files);
          }
          e.target.value = '';
        }}
      />
    </div>
  );
}