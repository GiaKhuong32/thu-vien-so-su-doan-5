import { Cloud, Clock, Heart, Trash2 } from 'lucide-react';
import type { DriveSection, DriveStorage } from '../../types/drive';
import { formatBytes } from './driveFormat';
import './DriveSidebar.css';

type Props = {
  section: DriveSection;
  onSectionChange: (section: DriveSection) => void;
  counts: { cloud: number; favourite: number; trash: number };
  storage: DriveStorage;
  onDropFilesToSection?: (section: DriveSection, files: FileList) => void;
};

const NAV_ITEMS: { key: DriveSection; label: string; icon: typeof Cloud }[] = [
  { key: 'cloud', label: 'Đám Mây', icon: Cloud },
  { key: 'recent', label: 'Gần Đây', icon: Clock },
  { key: 'favourite', label: 'Ưa Thích', icon: Heart },
  { key: 'trash', label: 'Thùng rác', icon: Trash2 },
];

export default function DriveSidebar({ section, onSectionChange, counts, storage }: Props) {
  const pct = storage.total > 0 ? Math.min(100, (storage.used / storage.total) * 100) : 0;
  const pctLabel = pct > 0 && pct < 1 ? '<1' : String(Math.round(pct));

  return (
    <aside className="drive-sidebar">
      <div className="drive-brand">
        <div className="drive-brand__mark">
          <Cloud size={16} color="#fff" strokeWidth={2.4} />
        </div>
        <span className="drive-brand__name">Kho Lưu Trữ</span>
      </div>

      <ul className="drive-nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const count = key === 'cloud' ? counts.cloud : key === 'favourite' ? counts.favourite : key === 'trash' ? counts.trash : undefined;
          return (
            <li
              key={key}
              className={`drive-nav__item${section === key ? ' is-active' : ''}`}
              onClick={() => onSectionChange(key)}
            >
              <Icon size={17} strokeWidth={2} />
              <span>{label}</span>
              {!!count && <span className="drive-nav__count">{count}</span>}
            </li>
          );
        })}
      </ul>

      <div className="drive-storage">
        <div className="drive-storage__label">
          <span>{storage.planName}</span>
          <span>{pctLabel}%</span>
        </div>
        <div className="drive-storage__track">
          <div className="drive-storage__fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="drive-storage__sub">
          đã dùng {formatBytes(storage.used)} trong tổng {formatBytes(storage.total)}
        </div>
      </div>
    </aside>
  );
}
