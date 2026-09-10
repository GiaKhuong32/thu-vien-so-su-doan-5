import { Download, Heart, Pencil, Trash2, X } from 'lucide-react';
import type { DriveNode, DriveSection } from '../../types/drive';
import { FileTypeIcon } from './DrivePrimitives';
import {
  countFolderChildren,
  describeSelection,
  formatDateTime,
  formatSize,
  getKindLabel,
} from './driveUtils';

type Props = {
  nodes: DriveNode[];
  allNodes: DriveNode[];
  section: DriveSection;
  onClose: () => void;
  onRename: (node: DriveNode) => void;
  onToggleFavourite: (ids: string[]) => void;
  onTrash: (ids: string[]) => void;
  onDownload: (nodes: DriveNode[]) => void;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mgd-info__row">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

export default function DriveInfoPanel({
  nodes,
  allNodes,
  section,
  onClose,
  onRename,
  onToggleFavourite,
  onTrash,
  onDownload,
}: Props) {
  const single = nodes.length === 1 ? nodes[0] : null;
  const totalSize = nodes.reduce((sum, n) => sum + n.size, 0);
  const isTrash = section === 'trash';

  return (
    <aside className="mgd-info" aria-label="Bảng thông tin">
      <div className="mgd-info__head">
        <span className="mgd-info__title">Thông tin</span>
        <button
          type="button"
          className="mgd-iconbtn"
          aria-label="Đóng bảng thông tin"
          onClick={onClose}
        >
          <X className="mgd-icon" />
        </button>
      </div>

      {nodes.length === 0 && (
        <p className="mgd-info__empty">
          Chọn một tệp tin hoặc thư mục để xem thông tin chi tiết.
        </p>
      )}

      {single && (
        <>
          <div className="mgd-info__preview">
            {single.previewUrl ? (
              <img src={single.previewUrl} alt={single.name} />
            ) : (
              <FileTypeIcon node={single} />
            )}
          </div>

          <div className="mgd-info__name" title={single.name}>
            {single.name}
          </div>

          <dl className="mgd-info__list">
            <InfoRow label="Loại" value={getKindLabel(single)} />
            <InfoRow
              label="Dung lượng"
              value={
                single.type === 'folder' && single.size === 0
                  ? 'Trống'
                  : formatSize(single.size)
              }
            />
            {single.type === 'folder' && (
              <InfoRow
                label="Bên trong"
                value={(() => {
                  const { folders, files } = countFolderChildren(allNodes, single.id);
                  if (!folders && !files) return 'Trống';
                  return `${folders} thư mục, ${files} tệp tin`;
                })()}
              />
            )}
            <InfoRow label="Ngày tạo" value={formatDateTime(single.createdAt)} />
            <InfoRow label="Sửa đổi lần cuối" value={formatDateTime(single.updatedAt)} />
            {single.openedAt && (
              <InfoRow label="Mở gần nhất" value={formatDateTime(single.openedAt)} />
            )}
            {isTrash && single.trashedAt && (
              <InfoRow label="Ngày xoá" value={formatDateTime(single.trashedAt)} />
            )}
            <InfoRow label="Ưa thích" value={single.favourite ? 'Có' : 'Không'} />
          </dl>
        </>
      )}

      {nodes.length > 1 && (
        <dl className="mgd-info__list" style={{ paddingTop: 16 }}>
          <InfoRow label="Đã chọn" value={`${nodes.length} mục`} />
          <InfoRow label="Chi tiết" value={describeSelection(nodes)} />
          <InfoRow label="Tổng dung lượng" value={formatSize(totalSize)} />
        </dl>
      )}

      {nodes.length > 0 && !isTrash && (
        <div className="mgd-info__actions">
          {single && (
            <button
              type="button"
              className="mgd-chipbtn"
              onClick={() => onRename(single)}
            >
              <Pencil className="mgd-icon mgd-icon--sm" />
              Đổi tên
            </button>
          )}
          <button
            type="button"
            className="mgd-chipbtn"
            onClick={() => onToggleFavourite(nodes.map((n) => n.id))}
          >
            <Heart className="mgd-icon mgd-icon--sm" />
            {nodes.every((n) => n.favourite) ? 'Bỏ ưa thích' : 'Ưa thích'}
          </button>
          <button type="button" className="mgd-chipbtn" onClick={() => onDownload(nodes)}>
            <Download className="mgd-icon mgd-icon--sm" />
            Tải xuống
          </button>
          <button
            type="button"
            className="mgd-chipbtn is-danger"
            onClick={() => onTrash(nodes.map((n) => n.id))}
          >
            <Trash2 className="mgd-icon mgd-icon--sm" />
            Xoá
          </button>
        </div>
      )}
    </aside>
  );
}