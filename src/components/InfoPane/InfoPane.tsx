import { useState } from 'react';
import type { ReactNode } from 'react';
import './InfoPane.css';

type Props = {
  title: string;
  children: ReactNode;
  closed?: boolean;
};

export default function InfoPane({ title, children, closed = false }: Props) {
  const [open, setOpen] = useState(!closed);

  return (
    <section className="info-pane">
      <button
        type="button"
        className={`tt-detail${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span className="tt-detail__chev" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="m9 5 7 7-7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      <div className={`info-pane__body${open ? ' is-open' : ''}`}>{children}</div>
    </section>
  );
}
