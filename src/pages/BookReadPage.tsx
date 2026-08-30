import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import FlipBook from '../components/FlipBook';
import { useBookDetail } from '../hooks/useBooks';
import { API_BASE_URL } from '../config/api';

interface BookFile {
  bookFile?: string;
  fileName?: string;
  idFile?: string;
  partFile?: string;
  thumbnail?: string;
  typeFile?: string;
  fileUrl?: string;
  filePath?: string;
}

/** Nhận diện file PDF (sách số) trong danh sách file của tài liệu. */
function isPdfFile(file: BookFile): boolean {
  const bookFile = (file.bookFile || '').toLowerCase();
  const typeFile = (file.typeFile || '').toLowerCase();
  const fileName = (file.fileName || '').toLowerCase();
  const part = (file.partFile || '').toLowerCase();

  return (
    bookFile.includes('số') ||
    bookFile === 'sách_số' ||
    typeFile === 'pdf' ||
    fileName.endsWith('.pdf') ||
    part.endsWith('.pdf')
  );
}

/**
 * Trang đọc sách toàn màn hình.
 *
 * Nguồn PDF được lấy theo thứ tự ưu tiên:
 *   1. Query `?file=<url>` — tiện cho việc test hoặc link trực tiếp.
 *   2. File PDF trong `/files/document/{idDocument}` của backend.
 */
export default function BookReadPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();

  const fileFromQuery = searchParams.get('file');
  const initialPage = Number(searchParams.get('page')) || 1;

  const { data: book } = useBookDetail(slug || '');

  const [pdfUrl, setPdfUrl] = useState<string | null>(fileFromQuery);
  const [resolving, setResolving] = useState(!fileFromQuery);

  useEffect(() => {
    if (fileFromQuery) {
      setPdfUrl(fileFromQuery);
      setResolving(false);
      return;
    }

    const idDocument = book?.idDocument;
    if (!idDocument) return;

    let cancelled = false;

    const load = async () => {
      setResolving(true);

      try {
        const res = await fetch(`${API_BASE_URL}/files/document/${idDocument}`, {
          method: 'GET',
          headers: { Accept: '*/*' },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const files: BookFile[] = Array.isArray(data?.Result)
          ? data.Result
          : Array.isArray(data?.result)
            ? data.result
            : [];

        const pdf = files.find(isPdfFile);
        const url =
          pdf?.partFile ||
          pdf?.fileUrl ||
          pdf?.filePath ||
          (pdf?.idFile ? `${API_BASE_URL}/files/download/${pdf.idFile}` : null);

        if (!cancelled) setPdfUrl(url ?? null);
      } catch (err) {
        console.error('[BookReadPage] Không lấy được file PDF:', err);
        if (!cancelled) setPdfUrl(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [book?.idDocument, fileFromQuery]);

  /** Ẩn thanh cuộn trang khi đang đọc để reader chiếm trọn khung. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const backUrl = useMemo(
    () => (slug ? `/sach/${slug}.html` : '/sach/'),
    [slug]
  );

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <FlipBook
        src={pdfUrl ?? undefined}
        title={book?.title}
        author={book?.author}
        category={book?.category?.label}
        downloadUrl={pdfUrl ?? undefined}
        backUrl={backUrl}
        bookKey={slug || pdfUrl || 'flipbook'}
        initialPage={initialPage}
      />

      {/* Trong lúc dò file, FlipBook tự hiện overlay nạp nên không cần UI riêng.
          Chỉ báo lỗi khi đã dò xong mà không tìm được PDF nào. */}
      {!resolving && !pdfUrl && (
        <div className="fb-overlay" style={{ zIndex: 75 }}>
          <h3 className="fb-overlay__title">Sách chưa có bản đọc trực tuyến</h3>
          <p className="fb-overlay__text">
            Tài liệu này hiện chưa có tệp sách số. Vui lòng thử lại sau.
          </p>
          <a className="fb-overlay__btn" href={backUrl}>
            Về trang sách
          </a>
        </div>
      )}
    </div>
  );
}