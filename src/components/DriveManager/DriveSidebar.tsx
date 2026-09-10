import {
  ChevronsLeft,
  Clock3,
  Cloud,
  Heart,
  Rocket,
  Trash2,
} from 'lucide-react';
import type { DriveSection, DriveStorage } from '../../types/drive';
import { formatSize } from './driveUtils';

type NavEntry = {
  key: DriveSection;
  label: string;
  Icon: typeof Cloud;
};

/** Chỉ giữ 4 mục theo yêu cầu: Ổ Mây, Gần Đây, Ưa Thích, Thùng rác. */
const NAV_ENTRIES: NavEntry[] = [
  { key: 'cloud', label: 'Ổ Mây', Icon: Cloud },
  { key: 'recent', label: 'Gần Đây', Icon: Clock3 },
  { key: 'favourite', label: 'Ưa Thích', Icon: Heart },
  { key: 'trash', label: 'Thùng rác', Icon: Trash2 },
];

type Props = {
  section: DriveSection;
  counts: Record<DriveSection, number>;
  storage: DriveStorage;
  collapsed: boolean;
  /** Mục đang được kéo tệp/thư mục tới (để tô sáng). */
  dropTarget: DriveSection | null;
  onToggleCollapse: () => void;
  onSelectSection: (section: DriveSection) => void;
  onDropOnSection: (section: DriveSection, event: React.DragEvent) => void;
  onDragOverSection: (section: DriveSection | null, event: React.DragEvent) => void;
};

export default function DriveSidebar({
  section,
  counts,
  storage,
  collapsed,
  dropTarget,
  onToggleCollapse,
  onSelectSection,
  onDropOnSection,
  onDragOverSection,
}: Props) {
  const percent = storage.total
    ? Math.min(100, (storage.used / storage.total) * 100)
    : 0;

  const fillClass =
    percent >= 90 ? ' is-danger' : percent >= 70 ? ' is-warn' : '';

  return (
    <aside className="mgd-side">
      <div className="mgd-side__head">
        <div className="mgd-brand">
          <span className="mgd-brand__mark" aria-hidden="true">
            M
          </span>
          <span className="mgd-brand__text">Đĩa</span>
        </div>
        <button
          type="button"
          className="mgd-side__toggle"
          aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          title={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          onClick={onToggleCollapse}
        >
          <ChevronsLeft className="mgd-icon" />
        </button>
      </div>

      <nav className="mgd-nav" aria-label="Khu vực lưu trữ">
        {NAV_ENTRIES.map(({ key, label, Icon }) => {
          const isActive = section === key;
          const count = counts[key];

          return (
            <button
              key={key}
              type="button"
              className={`mgd-nav__item${isActive ? ' is-active' : ''}${
                dropTarget === key ? ' is-drop-target' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
              title={collapsed ? label : undefined}
              onClick={() => onSelectSection(key)}
              onDragOver={(e) => {
                // Chỉ cho thả vào Ổ Mây (về gốc) và Thùng rác (xoá nhanh).
                if (key !== 'cloud' && key !== 'trash') return;
                e.preventDefault();
                onDragOverSection(key, e);
              }}
              onDragLeave={(e) => onDragOverSection(null, e)}
              onDrop={(e) => {
                if (key !== 'cloud' && key !== 'trash') return;
                e.preventDefault();
                onDropOnSection(key, e);
              }}
            >
              <Icon className="mgd-icon mgd-nav__icon" />
              <span className="mgd-nav__label">{label}</span>
              {count > 0 && <span className="mgd-nav__count">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mgd-quota">
        <div className="mgd-quota__row">
          <span className="mgd-quota__plan">{storage.planName}</span>
          <span className="mgd-quota__usage">
            đã dùng {formatSize(storage.used)} trong tổng {formatSize(storage.total)}
          </span>
        </div>
        <div
          className="mgd-quota__bar"
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Dung lượng đã dùng"
          title={`${percent.toFixed(1)}% dung lượng đã dùng`}
        >
          <div
            className={`mgd-quota__fill${fillClass}`}
            style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }}
          />
        </div>

        <button type="button" className="mgd-side__cta">
          Nâng cấp
        </button>

        <button type="button" className="mgd-side__bonus">
          <Rocket className="mgd-icon" />
          <span>Mở thưởng nhận thêm lưu…</span>
        </button>
      </div>
    </aside>
  );
}