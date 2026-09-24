import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { init } from 'pptx-preview';
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
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pptxRef = useRef<HTMLDivElement>(null);
  const [pptxBuffer, setPptxBuffer] = useState<ArrayBuffer | null>(null);

  const kind = file ? getFileKind(file) : 'other';

  useEffect(() => {
    if (!open || !file) return;

    let revoked = false;
    let createdUrl: string | null = null;

    setLoading(true);
    setError(null);
    setObjectUrl(null);
    setHtml(null);
    setPptxBuffer(null);

    driveApi
      .fetchFileBlob(file.id)
      .then(async ({ objectUrl, blob }) => {
        if (revoked) {
          URL.revokeObjectURL(objectUrl);
          return;
        }
        createdUrl = objectUrl;
        setObjectUrl(objectUrl);

        if (kind === 'doc') {
          if (!file.name.toLowerCase().endsWith('.docx')) {
            throw new Error('Chỉ xem được .docx. File .doc cũ hãy tải về để mở.');
          }
          const buffer = await blob.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
          if (!revoked) setHtml(result.value || '<p>(Không có nội dung)</p>');
          return;
        }

        if (kind === 'sheet') {
          const buffer = await blob.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) throw new Error('File Excel trống');
          if (!revoked) setHtml(XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]));
        }

        if (kind === 'slide') {
          const lower = file.name.toLowerCase();
          if (!lower.endsWith('.pptx')) {
            throw new Error('Chỉ xem được .pptx. File .ppt cũ hãy tải về để mở.');
          }
          if (!revoked) setPptxBuffer(await blob.arrayBuffer());
        }
      })
      .catch((err: unknown) => {
        if (!revoked) setError(err instanceof Error ? err.message : 'Không xem được file');
      })
      .finally(() => {
        if (!revoked) setLoading(false);
      });

    return () => {
      revoked = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [open, file]);

  useLayoutEffect(() => {
    if (loading || kind !== 'slide' || !pptxBuffer || !pptxRef.current) return;

    const el = pptxRef.current;
    el.innerHTML = '';
    const width = Math.max(320, Math.min(el.clientWidth || 960, 1180));
    const height = Math.round(width * 0.5625);
    const viewer = init(el, { width, height });
    void viewer.preview(pptxBuffer);

    return () => {
      el.innerHTML = '';
    };
  }, [loading, kind, pptxBuffer]);

  if (!open || !file) return null;

  const canPreview = !!objectUrl;
  const isOffice = ['doc', 'sheet'].includes(kind);

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
            <button
              type="button"
              title="Tải xuống"
              onClick={() => driveApi.downloadFile(file.id, file.name)}
            >
              <Download size={18} />
            </button>
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
            <iframe title={file.name} src={objectUrl} className="drive-preview__frame" />
          )}

          {!loading && !error && canPreview && kind === 'video' && (
            <video
              className="drive-preview__media"
              src={objectUrl}
              controls
              autoPlay
              playsInline
            >
              <source src={objectUrl} type="video/mp4" />
            </video>
          )}

          {!loading && !error && canPreview && kind === 'audio' && (
            <audio className="drive-preview__audio" src={objectUrl} controls autoPlay />
          )}

          {!loading && !error && canPreview && kind === 'text' && (
            <iframe title={file.name} src={objectUrl} className="drive-preview__frame" />
          )}

          {!loading && !error && isOffice && html && (
            <div
              className="drive-preview__html"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {!loading && !error && kind === 'slide' && pptxBuffer && (
            <div ref={pptxRef} className="drive-preview__pptx" />
          )}

          {!loading && !error && canPreview &&
            !['image', 'pdf', 'video', 'audio', 'text', 'doc', 'sheet', 'slide'].includes(kind) && (
              <div className="drive-preview__empty">
                Loại tệp này chưa hỗ trợ xem trước. Hãy tải xuống.
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
