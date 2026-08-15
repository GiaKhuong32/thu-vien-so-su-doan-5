import './BookBrief.css';

export type BookDetail = {
  title: string;
  author: string;
  img: string;
  href: string;
  rating?: number;
  /** "Sách giấy" | "Sách số" | "Sách nói" … */
  format?: string;
  formatHref?: string;
  categories?: { label: string; href: string }[];
  /** call-to-action label, e.g. "Đọc sách" / "Nghe sách" */
  action?: string;
};

function Stars({ value = 0 }: { value?: number }) {
  return (
    <div className="rated-star">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`star${i <= value ? ' is-on' : ''}`} aria-hidden="true">
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

/** Cover + metadata block at the top of the book detail page. */
export default function BookBrief({ book }: { book: BookDetail }) {
  const rating = book.rating ?? 0;

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
            <Stars value={rating} />
            <span className="rate-point text-desc">{rating}/5</span>
          </Row>

          {book.format && (
            <Row label="Định dạng:">
              <a className="filter-link" href={book.formatHref ?? '#'} title={book.format}>
                {book.format}
              </a>
            </Row>
          )}

          {!!book.categories?.length && (
            <Row label="Thể loại:">
              <div className="list-category">
                {book.categories.map((c) => (
                  <a key={c.href} href={c.href} title={c.label}>
                    {c.label}
                  </a>
                ))}
              </div>
            </Row>
          )}
        </div>

        <div className="group-button">
          <a className="btn btn-outline-primary" href={book.href}>
            <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M3 5.2A1.7 1.7 0 0 1 4.7 3.5h4.4c1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3h4.4a1.7 1.7 0 0 1 1.7 1.7v12.1a1.2 1.2 0 0 1-1.2 1.2h-4.4c-1 0-1.9.6-2.4 1.4h-1c-.5-.8-1.4-1.4-2.4-1.4H4.7a1.2 1.2 0 0 1-1.2-1.2V5.2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M12 6.6v12.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {book.action ?? 'Đọc sách'}
          </a>
        </div>

        <div className="list-share-icon">
          <span className="text-desc">Chia sẻ:</span>
          <a className="btn-circle btn-facebook" href="#" aria-label="Chia sẻ Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.3H7.6V13h2.7v8h3.2Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a className="btn-circle btn-zalo" href="#" aria-label="Chia sẻ Zalo">
            <span>Z</span>
          </a>
        </div>
      </div>
    </div>
  );
}