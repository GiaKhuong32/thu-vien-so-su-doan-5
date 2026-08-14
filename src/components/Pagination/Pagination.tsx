import { Link } from 'react-router-dom';
import './Pagination.css';

type Props = {
  page: number;
  totalPages: number;
  hrefFor?: (page: number) => string;
  onChange?: (page: number) => void;
};

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={dir === 'prev' ? 'm15 5-7 7 7 7' : 'm9 5 7 7-7 7'}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Pagination({ page, totalPages, hrefFor, onChange }: Props) {
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  const step = (target: number) => (e: React.MouseEvent) => {
    if (onChange) {
      e.preventDefault();
      onChange(target);
    }
  };

  return (
    <nav className="pagination" aria-label="Phân trang">
      <div className={`page-item prev${prevDisabled ? ' is-disabled' : ''}`}>
        {hrefFor && !prevDisabled ? (
          <Link
            to={hrefFor(page - 1)}
            title="Trước"
            aria-label="Trang trước"
            aria-disabled={prevDisabled}
            onClick={step(page - 1)}
          >
            <Arrow dir="prev" />
          </Link>
        ) : (
          <span className="page-item prev is-disabled">
            <Arrow dir="prev" />
          </span>
        )}
      </div>

      <div className="page-item">
        <div className="text">
          Trang<span className="number">{page}</span>của<span className="number">{totalPages}</span>
        </div>
      </div>

      <div className={`page-item next${nextDisabled ? ' is-disabled' : ''}`}>
        {hrefFor && !nextDisabled ? (
          <Link
            to={hrefFor(page + 1)}
            title="Sau"
            aria-label="Trang sau"
            aria-disabled={nextDisabled}
            onClick={step(page + 1)}
          >
            <Arrow dir="next" />
          </Link>
        ) : (
          <span className="page-item next is-disabled">
            <Arrow dir="next" />
          </span>
        )}
      </div>
    </nav>
  );
}
