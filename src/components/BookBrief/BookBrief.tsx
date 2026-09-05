import { Link } from 'react-router-dom';
import type { BookAction, BookDetail } from '../../data/detail.js';
import './BookBrief.css';



function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="brief-row">
      <div className="label text-desc">{label}</div>
      <div className="field">{children}</div>
    </div>
  );
}

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

  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 5.2A1.7 1.7 0 0 1 4.7 3.5h4.4c1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3h4.4a1.7 1.7 0 0 1 1.7 1.7v12.1a1.2 1.2 0 0 1-1.2 1.2h-4.4c-1 0-1.9.6-2.4 1.4h-1c-.5-.8-1.4-1.4-2.4-1.4H4.7a1.2 1.2 0 0 1-1.2-1.2V5.2Z" {...common} />
      <path d="M12 6.6v12.5" {...common} />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg className="qr-box__icon" viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="7"
        y="2.5"
        width="10"
        height="19"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line x1="11" y1="18" x2="13" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

type Props = {
  book: BookDetail;
  onUnavailable: (action: BookAction) => void;
};

export default function BookBrief({ book, onUnavailable }: Props) {
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

          {book.publishYear && (
            <Row label="Năm xuất bản:">
              <b>{book.publishYear}</b>
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

       {!!book.formats.length && (
  <Row label="Định dạng:">
    <span>{book.formats.join(', ')}</span>
  </Row>
)}
        </div>

        {!!book.actions.length && (
          <div className="group-button">
            <div className="list-button">
              {book.actions.map((a) => {
                const cls = `btn ${a.primary ? 'btn-primary' : 'btn-outline-primary'}`;

                if (a.href) {
                  return (
                    <Link
                      key={a.label}
                      to={a.href}
                      className={cls}
                      title={book.title}
                    >
                      <ActionIcon kind={a.kind} />
                      {a.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={a.label}
                    type="button"
                    className={cls}
                    title={book.title}
                    onClick={() => onUnavailable(a)}
                  >
                    <ActionIcon kind={a.kind} />
                    {a.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {book.formats.includes('Sách số') && (
          <div className="qr-box">
            <div className="qr-box__code">
              {book.qrCode ? (
                <img src={book.qrCode} alt={`Mã QR đọc sách ${book.title}`} />
              ) : (
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <rect x="0" y="0" width="100" height="100" fill="#fff" />
                  <rect x="6" y="6" width="24" height="24" fill="none" stroke="#111" strokeWidth="6" />
                  <rect x="14" y="14" width="8" height="8" fill="#111" />
                  <rect x="70" y="6" width="24" height="24" fill="none" stroke="#111" strokeWidth="6" />
                  <rect x="78" y="14" width="8" height="8" fill="#111" />
                  <rect x="6" y="70" width="24" height="24" fill="none" stroke="#111" strokeWidth="6" />
                  <rect x="14" y="78" width="8" height="8" fill="#111" />
                  <rect x="40" y="6" width="6" height="6" fill="#111" />
                  <rect x="52" y="6" width="6" height="6" fill="#111" />
                  <rect x="40" y="18" width="6" height="6" fill="#111" />
                  <rect x="58" y="18" width="6" height="6" fill="#111" />
                  <rect x="40" y="30" width="6" height="6" fill="#111" />
                  <rect x="46" y="42" width="6" height="6" fill="#111" />
                  <rect x="58" y="42" width="6" height="6" fill="#111" />
                  <rect x="70" y="42" width="6" height="6" fill="#111" />
                  <rect x="82" y="42" width="6" height="6" fill="#111" />
                  <rect x="40" y="54" width="6" height="6" fill="#111" />
                  <rect x="58" y="54" width="6" height="6" fill="#111" />
                  <rect x="70" y="54" width="6" height="6" fill="#111" />
                  <rect x="40" y="66" width="6" height="6" fill="#111" />
                  <rect x="52" y="66" width="6" height="6" fill="#111" />
                  <rect x="64" y="66" width="6" height="6" fill="#111" />
                  <rect x="82" y="66" width="6" height="6" fill="#111" />
                  <rect x="46" y="78" width="6" height="6" fill="#111" />
                  <rect x="58" y="78" width="6" height="6" fill="#111" />
                  <rect x="70" y="82" width="6" height="6" fill="#111" />
                  <rect x="82" y="78" width="6" height="6" fill="#111" />
                </svg>
              )}
            </div>
            <div className="qr-box__text">
              <PhoneIcon />
              <span>
                Quét mã QR
                <br />
                để xem chi tiết sách
                <br />
                trên thiết bị di động
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}