import { useEffect, useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import type { DriveNode } from '../../types/drive';
import { getFileKind } from './driveIcons';
import { driveApi } from '../../api/drive';
import './DriveFilePreviewModal.css';

type Props = {
  open: boolean;
  file: DriveNode | null;
  onClose: () => void;
};

function officeViewerUrl(fileUrl: string) {
  return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
}

export default function DriveFilePreviewModal({ open, file, onClose }: Props) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !file) return;

    let revoked = false;
    let createdUrl: string | null = null;

    setLoading(true);
    setError(null);
    setObjectUrl(null);

    driveApi
      .fetchFileBlob(file.id)
      .then(({ objectUrl }) => {
        if (revoked) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        createdUrl = objectUrl;
        setObjectUrl(objectUrl);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Không xem được file');
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open, file]);

  if (!open || !file) return null;

  const kind = getFileKind(file);
  const canPreview = !!objectUrl;

  return (
    <div className="drive-preview" role="dialog" aria-modal="true">
      <div className="drive-preview__backdrop" onClick={onClose} />

      <div className="drive-preview__panel">
        <div className="drive-preview__header">
          <div>
            <strong>{file.name}</strong>
            <span>{file.mimeType || 'Tệp'}</span>
          </div>

          <div className="drive-preview__actions">
            {objectUrl && (
              <a href={objectUrl} target="_blank" rel="noreferrer" title="Mở trong tab mới">
                <ExternalLink size={18} />
              </a>
            )}
            <button type="button" onClick={onClose} title="Đóng">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="drive-preview__body">
          {loading && <div className="drive-preview__empty">Đang tải file...</div>}
          {error && <div className="drive-preview__empty">{error}</div>}

          {!loading && !error && canPreview && kind === 'image' && (
            <img className="drive-preview__image" src={objectUrl} alt={file.name} />
          )}

          {!loading && !error && canPreview && kind === 'pdf' && (
            <iframe
              title={file.name}
              src={objectUrl}
              className="drive-preview__frame"
            />
          )}

          {!loading && !error && canPreview && kind === 'video' && (
            <video className="drive-preview__media" src={objectUrl} controls autoPlay />
          )}

          {!loading && !error && canPreview && kind === 'audio' && (
            <audio className="drive-preview__audio" src={objectUrl} controls autoPlay />
          )}

          {!loading && !error && canPreview && kind === 'text' && (
            <iframe title={file.name} src={objectUrl} className="drive-preview__frame" />
          )}

          {!loading && !error && canPreview && ['doc', 'sheet', 'slide'].includes(kind) && (
            <div className="drive-preview__empty">
              Office Online không xem được blob URL nội bộ. Hãy tải file hoặc mở endpoint
              công khai nếu backend hỗ trợ.
            </div>
          )}

          {!loading && !error && canPreview &&
            !['image', 'pdf', 'video', 'audio', 'text', 'doc', 'sheet', 'slide'].includes(kind) && (
              <div className="drive-preview__empty">Loại tệp này chưa hỗ trợ xem trước.</div>
            )}
        </div>
      </div>
    </div>
  );
}
