import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import FlipBook from '../components/FlipBook';
import { useBookDetail } from '../hooks/useBooks';
import {
  findPdfFile,
  getBookFileUrl,
  getDocumentFiles,
} from '../api/bookFiles';

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
        const files = await getDocumentFiles(idDocument);
        const pdf = findPdfFile(files);
        const url = getBookFileUrl(pdf);

        if (!cancelled) setPdfUrl(url);
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