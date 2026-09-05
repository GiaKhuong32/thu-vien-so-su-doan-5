import { usePdfThumbnail } from './usePdfThumbnail';
import * as pdfjs from 'pdfjs-dist';

type PageThumbnailProps = {
  pdf: pdfjs.PDFDocumentProxy | null;
  pageNumber: number;
  current: boolean;
  onClick: (pageNumber: number) => void;
};

export default function PageThumbnail({
  pdf,
  pageNumber,
  current,
  onClick,
}: PageThumbnailProps) {
  const { ref, src } = usePdfThumbnail(pdf, pageNumber);

  return (
    <button
      ref={ref}
      type="button"
      className={`fb-thumb${current ? ' is-current' : ''}`}
      onClick={() => onClick(pageNumber)}
    >
      {src ? (
        <img
          className="fb-thumb__img"
          src={src}
          alt={`Trang ${pageNumber}`}
          loading="lazy"
        />
      ) : (
        <span className="fb-thumb__ph" />
      )}
      <span className="fb-thumb__num">{pageNumber}</span>
    </button>
  );
}
