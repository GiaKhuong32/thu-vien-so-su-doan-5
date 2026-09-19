import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../../assets/skin/logo.png';
import './LoadingScreen.css';

type LoadingPhase = 'visible' | 'leaving' | 'hidden';

const MINIMUM_VISIBLE_TIME = 650;
const EXIT_ANIMATION_TIME = 850;

export default function LoadingScreen() {
  const location = useLocation();
  const [phase, setPhase] = useState<LoadingPhase>('visible');
  const shownAt = useRef(performance.now());
  const hideTimer = useRef<number | undefined>(undefined);
  const removeTimer = useRef<number | undefined>(undefined);

  const clearTimers = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(removeTimer.current);
  }, []);

  const show = useCallback(() => {
    clearTimers();
    shownAt.current = performance.now();
    setPhase('visible');
  }, [clearTimers]);

  const hide = useCallback(() => {
    const elapsed = performance.now() - shownAt.current;
    const delay = Math.max(0, MINIMUM_VISIBLE_TIME - elapsed);

    hideTimer.current = window.setTimeout(() => {
      setPhase('leaving');
      removeTimer.current = window.setTimeout(() => {
        setPhase('hidden');
      }, EXIT_ANIMATION_TIME);
    }, delay);
  }, []);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const currentRoute = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextRoute = `${destination.pathname}${destination.search}${destination.hash}`;

      if (currentRoute !== nextRoute) show();
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [show]);

  useLayoutEffect(() => {
    show();

    let firstFrame = 0;
    let secondFrame = 0;
    const finishTransition = () => {
      firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(hide);
      });
    };

    if (document.readyState === 'complete') {
      finishTransition();
    } else {
      window.addEventListener('load', finishTransition, { once: true });
    }

    return () => {
      window.removeEventListener('load', finishTransition);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [location.key, hide, show]);

  useEffect(() => {
    document.body.classList.toggle('is-route-loading', phase === 'visible');
    return () => document.body.classList.remove('is-route-loading');
  }, [phase]);

  useEffect(() => clearTimers, [clearTimers]);

  return (
    <div
      className={`loading-screen loading-screen--${phase}`}
      role="status"
      aria-live="polite"
      aria-hidden={phase === 'hidden'}
      aria-label="Đang tải nội dung"
    >
      <div className="loading-screen__inner">
        <img src={logo} alt="" aria-hidden="true" />
      </div>
      <span className="sr-only">Đang tải nội dung</span>
    </div>
  );
}
