import { Info, LayoutGrid, List } from 'lucide-react';
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
  cloud: 'Đám Mây',
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
  const sortValue = `${sort.key}-${sort.order}`;

  return (
    <div className="drive-toolbar">
      <div className="drive-crumbs">
        {section === 'cloud' ? (
          <>
            <span
              className={`drive-crumb${breadcrumbs.length === 0 ? ' is-current' : ''}`}
              onClick={() => onNavigate(null)}
            >
              Đám Mây
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
        <div className="drive-select-wrap">
          <select
            value={sortValue}
            onChange={(e) => {
              const opt = SORT_OPTIONS.find((o) => o.value === e.target.value);
              if (opt) onSortChange(opt.sort);
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

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
