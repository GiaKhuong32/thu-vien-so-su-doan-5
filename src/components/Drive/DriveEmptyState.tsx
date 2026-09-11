import { Clock, Cloud, Heart, Trash2, Upload } from 'lucide-react';
import type { DriveSection } from '../../types/drive';
import './DriveEmptyState.css';

type Props = {
  section: DriveSection;
  onUploadClick?: () => void;
};

const CONTENT: Record<DriveSection, { icon: typeof Cloud; title: string; sub: string }> = {
  cloud: {
    icon: Cloud,
    title: 'Kéo và thả tệp tin vào đây',
    sub: 'Chưa có gì trong Đám Mây của bạn',
  },
  recent: {
    icon: Clock,
    title: 'Không có hoạt động gần đây',
    sub: 'Tệp và thư mục bạn mở hoặc thêm gần đây sẽ hiển thị ở đây',
  },
  favourite: {
    icon: Heart,
    title: 'Không có mục ưa thích',
    sub: 'Bấm vào biểu tượng trái tim trên một tệp để xem lại nhanh ở đây',
  },
  trash: {
    icon: Trash2,
    title: 'Thùng rác trống',
    sub: 'Các mục đã xóa sẽ được lưu tạm ở đây',
  },
};

export default function DriveEmptyState({ section, onUploadClick }: Props) {
  const { icon: Icon, title, sub } = CONTENT[section];
  return (
    <div className="drive-empty">
      <div className={`drive-empty__icon${section === 'trash' ? ' is-trash' : ''}`}>
        <Icon size={36} strokeWidth={1.6} />
      </div>
      <div className="drive-empty__title">{title}</div>
      <div className="drive-empty__sub">{sub}</div>
      {section === 'cloud' && onUploadClick && (
        <button type="button" className="btn btn-primary drive-empty__btn" onClick={onUploadClick}>
          <Upload size={15} strokeWidth={2.3} />
          Tải lên
        </button>
      )}
    </div>
  );
}
