import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Info, LayoutGrid, List } from 'lucide-react';
import type { DriveBreadcrumb, DriveSection, DriveSort, DriveViewMode } from '../../types/drive';
import './DriveToolbar.css';

type Props = {
  section: DriveSection;
  breadcrumbs: DriveBreadcrumb[];
  onNavigate: (folderId: string | null) => void;
  sort: DriveSort;
  onSortChange: (sort: DriveSort) => void;
  viewMode: DriveViewMode;
  onViewModeChange: (mode: DriveViewMode) => void;
  infoOpen: boolean;
  onToggleInfo: () => void;
};

const SECTION_TITLE: Record<DriveSection, string> = {
  cloud: 'Ổ Mây',
  recent: 'Gần Đây',
  favourite: 'Ưa Thích',
  trash: 'Thùng rác',
};

const SORT_OPTIONS: { value: string; label: string; sort: DriveSort }[] = [
  { value: 'name-asc', label: 'Tên A–Z', sort: { key: 'name', order: 'asc' } },
  { value: 'name-desc', label: 'Tên Z–A', sort: { key: 'name', order: 'desc' } },
  { value: 'updatedAt-desc', label: 'Mới nhất', sort: { key: 'updatedAt', order: 'desc' } },
  { value: 'updatedAt-asc', label: 'Cũ nhất', sort: { key: 'updatedAt', order: 'asc' } },
  { value: 'size-desc', label: 'Dung lượng lớn nhất', sort: { key: 'size', order: 'desc' } },
  { value: 'size-asc', label: 'Dung lượng nhỏ nhất', sort: { key: 'size', order: 'asc' } },
];

function SortDropdown({ sort, onChange }: { sort: DriveSort; onChange: (sort: DriveSort) => void }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.sort.key === sort.key && o.sort.order === sort.order) ?? SORT_OPTIONS[0];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div className="drive-sort" ref={wrapRef}>
      <button type="button" className={`drive-sort__trigger${open ? ' is-open' : ''}`} onClick={() => setOpen((v) => !v)}>
        <span>{current.label}</span>
        <ChevronDown size={14} strokeWidth={2.2} />
      </button>
      {open && (
        <div className="drive-sort__menu">
          {SORT_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`drive-sort__option${opt.value === current.value ? ' is-active' : ''}`}
              onClick={() => {
                onChange(opt.sort);
                setOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DriveToolbar({
  section,
  breadcrumbs,
  onNavigate,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  infoOpen,
  onToggleInfo,
}: Props) {
  return (
    <div className="drive-toolbar">
      <div className="drive-crumbs">
        {section === 'cloud' ? (
          <>
            <span
              className={`drive-crumb${breadcrumbs.length === 0 ? ' is-current' : ''}`}
              onClick={() => onNavigate(null)}
            >
              Ổ Mây
            </span>
            {breadcrumbs.map((crumb, idx) => (
              <span key={crumb.id ?? 'root'}>
                <span className="drive-crumb-sep">/</span>
                <span
                  className={`drive-crumb${idx === breadcrumbs.length - 1 ? ' is-current' : ''}`}
                  onClick={() => onNavigate(crumb.id)}
                >
                  {crumb.name}
                </span>
              </span>
            ))}
          </>
        ) : (
          <span className="drive-crumb is-current">{SECTION_TITLE[section]}</span>
        )}
      </div>

      <div className="drive-tools-right">
        <SortDropdown sort={sort} onChange={onSortChange} />

        <button
          type="button"
          className="drive-icon-btn"
          title="Đổi bố cục"
          onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
        >
          {viewMode === 'grid' ? <List size={15} /> : <LayoutGrid size={15} />}
        </button>

        <button
          type="button"
          className={`drive-icon-btn${infoOpen ? ' is-active' : ''}`}
          title="Thông tin"
          onClick={onToggleInfo}
        >
          <Info size={15} />
        </button>
      </div>
    </div>
  );
}