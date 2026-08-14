import { useCallback, useEffect, useRef, useState } from 'react';
import './HeroSlider.css';
import slide1 from '../../assets/slide/silde1.png';
import slide2 from '../../assets/slide/silde2.jpg';

export type Slide = {
  img: string;
  href?: string;
  title?: string;
  desc?: string;
};

const defaultSlides: Slide[] = [
  { img: slide1, href: '/', title: '', desc: '' },
  { img: slide2, href: '/', title: '', desc: '' },
];

type Props = {
  slides?: Slide[];
  interval?: number;
};

export default function HeroSlider({ slides = defaultSlides, interval = 5500 }: Props) {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  const stop = useCallback(() => {
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    if (count < 2) return;
    timer.current = window.setInterval(() => setIndex((i) => (i + 1) % count), interval);
  }, [count, interval, stop]);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  const touchX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    stop();
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1));
    }
    touchX.current = null;
    start();
  };

  return (
    <section
      className="hero"
      aria-label="Ảnh bìa thư viện"
      onMouseEnter={stop}
      onMouseLeave={start}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="hero__track">
        {slides.map((s, i) => (
          <a
            key={s.img}
            className={`hero__cell${i === index ? ' is-active' : ''}`}
            href={s.href || '#'}
            title={s.title || ''}
            aria-hidden={i !== index}
            tabIndex={i === index ? 0 : -1}
          >
            <div className="hero__img">
              <img src={s.img} alt={s.title || 'Slide'} loading={i === 0 ? 'eager' : 'lazy'} />
            </div>
            {(s.title || s.desc) && (
              <div className="container hero__overlay">
                <div className="hero__textbox">
                  {s.title && <div className="hero__title font-display">{s.title}</div>}
                  {s.desc && <div className="hero__desc">{s.desc}</div>}
                </div>
              </div>
            )}
          </a>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="hero__arrow hero__arrow--prev"
            aria-label="Ảnh trước"
            onClick={() => go(index - 1)}
          >
            <Chevron dir="left" />
          </button>
          <button
            type="button"
            className="hero__arrow hero__arrow--next"
            aria-label="Ảnh sau"
            onClick={() => go(index + 1)}
          >
            <Chevron dir="right" />
          </button>
          <div className="hero__dots" role="tablist" aria-label="Chọn ảnh">
            {slides.map((s, i) => (
              <button
                key={s.img}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Ảnh ${i + 1}`}
                className={`hero__dot${i === index ? ' is-active' : ''}`}
                onClick={() => go(i)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path
        d={dir === 'left' ? 'M15 5 8 12l7 7' : 'M9 5l7 7-7 7'}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
