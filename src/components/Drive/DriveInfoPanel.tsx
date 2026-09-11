import { X } from 'lucide-react';
import type { DriveNode } from '../../types/drive';
import { DriveNodeIcon } from './driveIcons';
import { formatBytes, formatDate } from './driveFormat';
import './DriveInfoPanel.css';

type Props = {
  open: boolean;
  node: DriveNode | null;
  nodes: DriveNode[];
  folderSize: (id: string) => number;
  onClose: () => void;
};

export default function DriveInfoPanel({ open, node, nodes, folderSize, onClose }: Props) {
  return (
    <div className={`drive-info-panel${open ? ' is-open' : ''}`}>
      <div className="drive-info-inner">
        <div className="drive-info-close-row">
          <button type="button" className="drive-icon-btn" onClick={onClose}>
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {!node ? (
          <div className="drive-info-empty">Chọn một tệp hoặc thư mục để xem thông tin chi tiết.</div>
        ) : (
          <>
            <div className="drive-info-thumb">
              {node.type === 'file' && node.previewUrl ? (
                <img src={node.previewUrl} alt="" />
              ) : (
                <DriveNodeIcon node={node} size={40} />
              )}
            </div>
            <div className="drive-info-name">{node.name}</div>

            <InfoRow label="Loại" value={node.type === 'folder' ? 'Thư mục' : node.mimeType ?? 'Tệp tin'} />
            <InfoRow
              label="Dung lượng"
              value={formatBytes(node.type === 'folder' ? folderSize(node.id) : node.size)}
            />
            <InfoRow label="Đã thêm" value={formatDate(node.createdAt)} />
            <InfoRow label="Cập nhật" value={formatDate(node.updatedAt)} />
            <InfoRow
              label="Vị trí"
              value={
                node.trashed
                  ? 'Thùng rác'
                  : node.parentId
                    ? (nodes.find((n) => n.id === node.parentId)?.name ?? 'Ổ Mây')
                    : 'Đám Mây'
              }
            />
            <InfoRow label="Ưa thích" value={node.favourite ? 'Có' : 'Không'} />
          </>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="drive-info-row">
      <span className="k">{label}</span>
      <span className="v">{value}</span>
    </div>
  );
}
