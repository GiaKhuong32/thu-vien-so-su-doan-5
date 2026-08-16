import { Link } from 'react-router-dom';
import type { BookAction, BookDetail } from '../../data/detail';
import { FORMAT_HREF } from '../../data/detail';
import './BookBrief.css';

const SITE = 'https://thuviennguyenanninh.vn';

function Stars({ value = 0 }: { value?: number }) {
  const full = Math.round(value);
  return (
    <div className="rated-star">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star${i <= full ? ' is-on' : ''}`} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

/** one "label: value" metadata row */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="brief-row">
      <div className="label text-desc">{label}</div>
      <div className="field">{children}</div>
    </div>
  );
}

/** per-action glyph, mirroring the Font Awesome icons on the original */
function ActionIcon({ kind }: { kind: BookAction['kind'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (kind === 'audio') {
    return (
      <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 10v4M8 7v10M12 4v16M16 7v10M20 10v4" {...common} />
      </svg>
    );
  }

  if (kind === 'video') {
    return (
      <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" {...common} />
        <path d="m10 9 5 3-5 3V9Z" {...common} />
      </svg>
    );
  }

  if (kind === 'vr') {
    return (
      <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3.5 9.5h17a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4l-2.2 2a1 1 0 0 1-1.3 0l-2.2-2h-4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z" {...common} />
        <path d="M8 12h.01M16 12h.01" {...common} />
      </svg>
    );
  }

  if (kind === 'pdf') {
    
    return (
      <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 6.5c-1.8-1.4-4.2-2-7-2v12c2.8 0 5.2.6 7 2 1.8-1.4 4.2-2 7-2v-12c-2.8 0-5.2.6-7 2Z" {...common} />
        <path d="M12 6.5v12" {...common} />
      </svg>
    );
  }

  // fa-book — closed book (Sách giấy)
  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5.2A1.7 1.7 0 0 1 4.7 3.5h4.4c1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3h4.4a1.7 1.7 0 0 1 1.7 1.7v12.1a1.2 1.2 0 0 1-1.2 1.2h-4.4c-1 0-1.9.6-2.4 1.4h-1c-.5-.8-1.4-1.4-2.4-1.4H4.7a1.2 1.2 0 0 1-1.2-1.2V5.2Z" {...common} />
      <path d="M12 6.6v12.5" {...common} />
    </svg>
  );
}

type Props = {
  book: BookDetail;
  /** called when an action has no working target in this clone */
  onUnavailable: (action: BookAction) => void;
};

/** Cover + metadata block at the top of the book detail page. */
export default function BookBrief({ book, onUnavailable }: Props) {
  const shareUrl = `${SITE}/sach/${book.slug}.html`;

  return (
    <div className="brief">
      <div className="brief__media">
        <div className="brief__thumb">
          <img src={book.img} alt={book.title} />
        </div>
      </div>

      <div className="brief__info">
        <h1 className="brief__tt">{book.title}</h1>

        <div className="group-info">
          {book.author && (
            <Row label="Tác giả:">
              <b>{book.author}</b>
            </Row>
          )}

          <Row label="Đánh giá:">
            <Stars value={book.rating} />
            <span className="rate-point text-desc">{book.rating}/5</span>
          </Row>

          {!!book.formats.length && (
            <Row label="Định dạng:">
              <div className="list-category">
                {book.formats.map((f) => (
                  <Link key={f} to={FORMAT_HREF[f] ?? '/sach/'} title={f}>
                    {f}
                  </Link>
                ))}
              </div>
            </Row>
          )}

          {book.category && (
            <Row label="Thể loại:">
              <div className="list-category">
                <Link to={book.category.href} title={book.category.label}>
                  {book.category.label}
                </Link>
              </div>
            </Row>
          )}
        </div>

        {!!book.actions.length && (
          <div className="group-button">
            <div className="list-button">
              {book.actions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  className={`btn ${a.primary ? 'btn-primary' : 'btn-outline-primary'}`}
                  title={book.title}
                  onClick={() => onUnavailable(a)}
                >
                  <ActionIcon kind={a.kind} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="list-share-icon">
          <span className="text-desc">Chia sẻ:</span>
          <a
            className="btn-circle btn-facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Chia sẻ Facebook"
            title="Facebook"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            className="btn-circle btn-zalo"
            href={`https://zalo.me/share?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="Chia sẻ Zalo"
            title="Zalo"
          >
            <span>Z</span>
          </a>
        </div>
      </div>
    </div>
        );
}
