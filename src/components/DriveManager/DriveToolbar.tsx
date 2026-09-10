import { useRef, useState } from 'react';
import {
  ArrowUpDown,
  Bell,
  ChevronRight,
  ChevronsUp,
  ClipboardPaste,
  Cloud,
  Copy,
  FileUp,
  FolderPlus,
  FolderUp,
  Grid3x3,
  Info,
  LayoutGrid,
  List,
  MessageCircle,
  Scissors,
  Search,
  Trash2,
  Undo2,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import type {
  DriveBreadcrumb,
  DriveClipboard,
  DriveSection,
  DriveSort,
  DriveSortKey,
  DriveViewMode,
} from '../../types/drive';
import {
  DriveMenu,
  DriveMenuItem,
  DriveMenuLabel,
  DriveMenuSeparator,
  type MenuPosition,
} from './DrivePrimitives';
import { SORT_LABELS } from './driveUtils';

/* -------------------------------------------------------------------------- */
/* Thanh trên: tìm kiếm + nhóm biểu tượng                                     */
/* -------------------------------------------------------------------------- */

type TopBarProps = {
  query: string;
  section: DriveSection;
  onQueryChange: (value: string) => void;
};

const SCOPE_LABEL: Record<DriveSection, string> = {
  cloud: 'Tìm Ổ Mây',
  recent: 'Tìm trong Gần Đây',
  favourite: 'Tìm trong Ưa Thích',
  trash: 'Tìm trong Thùng rác',
};

export function DriveTopBar({ query, section, onQueryChange }: TopBarProps) {
  return (
    <div className="mgd-top">
      <div className="mgd-search">
        <Search className="mgd-icon mgd-search__icon" />
        <span className="mgd-search__scope">
          <Cloud className="mgd-icon mgd-icon--sm" />
          <button
            type="button"
            aria-label="Bỏ giới hạn phạm vi tìm kiếm"
            title="Bỏ giới hạn phạm vi tìm kiếm"
            onClick={() => onQueryChange('')}
          >
            <X className="mgd-icon mgd-icon--sm" />
          </button>
        </span>
        <input
          className="mgd-search__input"
          type="search"
          value={query}
          placeholder={SCOPE_LABEL[section]}
          aria-label={SCOPE_LABEL[section]}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      <div className="mgd-top__tools">
        <button type="button" className="mgd-iconbtn" aria-label="Ứng dụng" title="Ứng dụng">
          <Grid3x3 className="mgd-icon" />
        </button>
        <button type="button" className="mgd-iconbtn" aria-label="Trò chuyện" title="Trò chuyện">
          <MessageCircle className="mgd-icon" />
        </button>
        <button type="button" className="mgd-iconbtn" aria-label="Liên hệ" title="Liên hệ">
          <UserRound className="mgd-icon" />
        </button>
        <button type="button" className="mgd-iconbtn" aria-label="Thông báo" title="Thông báo">
          <Bell className="mgd-icon" />
        </button>
        <span className="mgd-avatar" aria-hidden="true">
          K
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Thanh công cụ chính                                                        */
/* -------------------------------------------------------------------------- */

type ToolbarProps = {
  section: DriveSection;
  clipboard: DriveClipboard;
  trashCount: number;
  onUploadFiles: (files: File[]) => void;
  onNewFolder: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onEmptyTrash: () => void;
  onRestoreAll: () => void;
  hasSelection: boolean;
};

export function DriveToolbar({
  section,
  clipboard,
  trashCount,
  onUploadFiles,
  onNewFolder,
  onCopy,
  onCut,
  onPaste,
  onEmptyTrash,
  onRestoreAll,
  hasSelection,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [uploadMenu, setUploadMenu] = useState<MenuPosition | null>(null);

  const isTrash = section === 'trash';
  const canWrite = section === 'cloud';

  const pickFiles = (files: FileList | null) => {
    if (!files?.length) return;
    onUploadFiles(Array.from(files));
  };

  return (
    <div className="mgd-toolbar">
      {/* input ẩn để mở hộp thoại chọn tệp tin / thư mục của hệ điều hành */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        hidden
        // @ts-expect-error thuộc tính riêng của trình duyệt để chọn cả thư mục
        webkitdirectory=""
        directory=""
        onChange={(e) => {
          pickFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {isTrash ? (
        <>
          <button
            type="button"
            className="mgd-btn mgd-btn--ghost"
            disabled={!hasSelection}
            onClick={onRestoreAll}
          >
            <Undo2 className="mgd-icon" />
            Khôi phục
          </button>
          <button
            type="button"
            className="mgd-btn mgd-btn--danger"
            disabled={trashCount === 0}
            onClick={onEmptyTrash}
          >
            <Trash2 className="mgd-icon" />
            Dọn sạch Thùng rác
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            className="mgd-btn mgd-btn--primary"
            disabled={!canWrite}
            title={canWrite ? undefined : 'Chuyển về Ổ Mây để tải lên'}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setUploadMenu({ x: rect.left, y: rect.bottom + 6 });
            }}
          >
            <Upload className="mgd-icon" />
            Tải lên
          </button>

          <button
            type="button"
            className="mgd-btn mgd-btn--ghost"
            disabled={!canWrite}
            onClick={onNewFolder}
          >
            <FolderPlus className="mgd-icon" />
            Thư mục mới
          </button>

          <span className="mgd-toolbar__sep" aria-hidden="true" />

          <div className="mgd-toolbar__group">
            <button
              type="button"
              className="mgd-iconbtn"
              aria-label="Chép"
              title="Chép (Ctrl+C)"
              disabled={!hasSelection}
              onClick={onCopy}
            >
              <Copy className="mgd-icon" />
            </button>
            <button
              type="button"
              className="mgd-iconbtn"
              aria-label="Cắt"
              title="Cắt (Ctrl+X)"
              disabled={!hasSelection}
              onClick={onCut}
            >
              <Scissors className="mgd-icon" />
            </button>
            <button
              type="button"
              className="mgd-iconbtn"
              aria-label="Dán"
              title="Dán (Ctrl+V)"
              disabled={!clipboard?.ids.length || !canWrite}
              onClick={onPaste}
            >
              <ClipboardPaste className="mgd-icon" />
            </button>
          </div>
        </>
      )}

      {uploadMenu && (
        <DriveMenu position={uploadMenu} onClose={() => setUploadMenu(null)} width={228}>
          <DriveMenuItem
            icon={<FileUp className="mgd-icon mgd-icon--sm" />}
            label="Tải lên tệp tin"
            onSelect={() => {
              setUploadMenu(null);
              fileInputRef.current?.click();
            }}
          />
          <DriveMenuItem
            icon={<FolderUp className="mgd-icon mgd-icon--sm" />}
            label="Tải lên thư mục"
            onSelect={() => {
              setUploadMenu(null);
              folderInputRef.current?.click();
            }}
          />
        </DriveMenu>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Đường dẫn thư mục                                                          */
/* -------------------------------------------------------------------------- */

type CrumbsProps = {
  items: DriveBreadcrumb[];
  dropTargetId: string | null | undefined;
  onNavigate: (id: string | null) => void;
  onDragOverCrumb: (id: string | null | undefined, event: React.DragEvent) => void;
  onDropOnCrumb: (id: string | null, event: React.DragEvent) => void;
  canDrop: boolean;
};

export function DriveBreadcrumbs({
  items,
  dropTargetId,
  onNavigate,
  onDragOverCrumb,
  onDropOnCrumb,
  canDrop,
}: CrumbsProps) {
  return (
    <nav className="mgd-crumbs" aria-label="Đường dẫn">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.id ?? 'root'}-${index}`} style={{ display: 'inline-flex' }}>
            <button
              type="button"
              className={`mgd-crumbs__item${isLast ? ' is-current' : ''}${
                dropTargetId === item.id && !isLast ? ' is-drop-target' : ''
              }`}
              aria-current={isLast ? 'page' : undefined}
              onClick={() => !isLast && onNavigate(item.id)}
              onDragOver={(e) => {
                if (!canDrop || isLast) return;
                e.preventDefault();
                onDragOverCrumb(item.id, e);
              }}
              onDragLeave={(e) => onDragOverCrumb(undefined, e)}
              onDrop={(e) => {
                if (!canDrop || isLast) return;
                e.preventDefault();
                onDropOnCrumb(item.id, e);
              }}
            >
              {item.name}
            </button>
            {!isLast && (
              <ChevronRight className="mgd-icon mgd-icon--sm mgd-crumbs__sep" aria-hidden="true" />
            )}
          </span>
        );
      })}
    </nav>
  );
}

/* -------------------------------------------------------------------------- */
/* Hàng tuỳ chọn hiển thị: sắp xếp / bố cục / thông tin                        */
/* -------------------------------------------------------------------------- */

type ViewBarProps = {
  total: number;
  sort: DriveSort;
  view: DriveViewMode;
  infoOpen: boolean;
  sortDisabled: boolean;
  onSortChange: (sort: DriveSort) => void;
  onViewChange: (view: DriveViewMode) => void;
  onToggleInfo: () => void;
  onScrollTop: () => void;
};

export function DriveViewBar({
  total,
  sort,
  view,
  infoOpen,
  sortDisabled,
  onSortChange,
  onViewChange,
  onToggleInfo,
  onScrollTop,
}: ViewBarProps) {
  const [sortMenu, setSortMenu] = useState<MenuPosition | null>(null);
  const [viewMenu, setViewMenu] = useState<MenuPosition | null>(null);

  const openMenu =
    (setter: (p: MenuPosition | null) => void) => (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setter({ x: rect.right - 224, y: rect.bottom + 6 });
    };

  const sortKeys: DriveSortKey[] = ['name', 'size', 'type', 'updatedAt'];

  return (
    <div className="mgd-viewbar">
      <span className="mgd-viewbar__count">
        {total > 0 ? `${total} mục` : 'Trống'}
      </span>

      <button
        type="button"
        className="mgd-iconbtn"
        aria-label="Sắp xếp"
        title="Sắp xếp"
        disabled={sortDisabled}
        onClick={openMenu(setSortMenu)}
      >
        <ArrowUpDown className="mgd-icon" />
      </button>

      <button
        type="button"
        className="mgd-iconbtn"
        aria-label="Bố cục"
        title="Bố cục"
        onClick={openMenu(setViewMenu)}
      >
        {view === 'list' ? <List className="mgd-icon" /> : <LayoutGrid className="mgd-icon" />}
      </button>

      <button
        type="button"
        className={`mgd-iconbtn${infoOpen ? ' is-on' : ''}`}
        aria-label="Thông tin"
        aria-pressed={infoOpen}
        title="Thông tin"
        onClick={onToggleInfo}
      >
        <Info className="mgd-icon" />
      </button>

      <button
        type="button"
        className="mgd-iconbtn"
        aria-label="Lên đầu trang"
        title="Lên đầu trang"
        onClick={onScrollTop}
      >
        <ChevronsUp className="mgd-icon" />
      </button>

      {sortMenu && (
        <DriveMenu position={sortMenu} onClose={() => setSortMenu(null)}>
          <DriveMenuLabel>Sắp xếp theo</DriveMenuLabel>
          {sortKeys.map((key) => (
            <DriveMenuItem
              key={key}
              label={SORT_LABELS[key]}
              checked={sort.key === key}
              onSelect={() => {
                onSortChange({ key, order: sort.order });
                setSortMenu(null);
              }}
            />
          ))}
          <DriveMenuSeparator />
          <DriveMenuLabel>Thứ tự</DriveMenuLabel>
          <DriveMenuItem
            label="Tăng dần"
            checked={sort.order === 'asc'}
            onSelect={() => {
              onSortChange({ key: sort.key, order: 'asc' });
              setSortMenu(null);
            }}
          />
          <DriveMenuItem
            label="Giảm dần"
            checked={sort.order === 'desc'}
            onSelect={() => {
              onSortChange({ key: sort.key, order: 'desc' });
              setSortMenu(null);
            }}
          />
        </DriveMenu>
      )}

      {viewMenu && (
        <DriveMenu position={viewMenu} onClose={() => setViewMenu(null)}>
          <DriveMenuLabel>Bố cục</DriveMenuLabel>
          <DriveMenuItem
            icon={<List className="mgd-icon mgd-icon--sm" />}
            label="Dạng danh sách"
            checked={view === 'list'}
            onSelect={() => {
              onViewChange('list');
              setViewMenu(null);
            }}
          />
          <DriveMenuItem
            icon={<LayoutGrid className="mgd-icon mgd-icon--sm" />}
            label="Dạng lưới"
            checked={view === 'grid'}
            onSelect={() => {
              onViewChange('grid');
              setViewMenu(null);
            }}
          />
        </DriveMenu>
      )}
    </div>
  );
}
