import { useEffect, useState } from 'react';
import './FloatingActions.css';

export default function FloatingActions() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="icon-stick">
      
      <button
        type="button"
        className={`stick-btn stick-btn--top${show ? ' is-show' : ''}`}
        aria-label="Lên đầu trang"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m6 14 6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
