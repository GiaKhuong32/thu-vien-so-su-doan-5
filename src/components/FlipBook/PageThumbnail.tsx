import { usePdfThumbnail } from './usePdfThumbnail';
import * as pdfjs from 'pdfjs-dist';

type PageThumbnailProps = {
  pdf: pdfjs.PDFDocumentProxy | null;
  pageNumber: number;
  current: boolean;
  onClick: (pageNumber: number) => void;
  docId?: number;
};

export default function PageThumbnail({
  pdf,
  pageNumber,
  current,
  onClick,
  docId = 0,
}: PageThumbnailProps) {
  const { ref, src } = usePdfThumbnail(pdf, pageNumber, docId);

  return (
    <button
      ref={ref}
      type="button"
      className={`fb-thumb${current ? ' is-current' : ''}`}
      aria-label={`Tới trang ${pageNumber}`}
      aria-current={current || undefined}
      onClick={() => onClick(pageNumber)}
    >
      {src ? (
        <img
          className="fb-thumb__img"
          src={src}
          alt={`Trang ${pageNumber}`}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="fb-thumb__ph" />
      )}
      <span className="fb-thumb__num">{pageNumber}</span>
    </button>
  );
}