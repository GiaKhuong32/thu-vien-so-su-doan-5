import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/skin/logo.png';
import { registerNavigateWithLoading } from './navigateWithLoading';
import './LoadingScreen.css';

type LoadingPhase = 'enter' | 'visible' | 'leaving' | 'hidden';

const ENTER_HOLD_TIME = 280;
const MINIMUM_VISIBLE_TIME = 650;
const EXIT_ANIMATION_TIME = 850;

function routeKey(path: string, search: string, hash: string) {
  return `${path}${search}${hash}`;
}

export default function LoadingScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<LoadingPhase>('visible');
  const shownAt = useRef(performance.now());
  const hideTimer = useRef<number | undefined>(undefined);
  const removeTimer = useRef<number | undefined>(undefined);
  const goTimer = useRef<number | undefined>(undefined);
  const pendingHref = useRef<string | null>(null);
  const busy = useRef(true);

  const clearTimers = useCallback(() => {
    window.clearTimeout(hideTimer.current);
    window.clearTimeout(removeTimer.current);
    window.clearTimeout(goTimer.current);
  }, []);

  const coverNow = useCallback(() => {
    clearTimers();
    shownAt.current = performance.now();
    busy.current = true;
    flushSync(() => {
      setPhase('enter');
    });
  }, [clearTimers]);

  const hide = useCallback(() => {
    const elapsed = performance.now() - shownAt.current;
    const delay = Math.max(0, MINIMUM_VISIBLE_TIME - elapsed);

    hideTimer.current = window.setTimeout(() => {
      setPhase('leaving');
      removeTimer.current = window.setTimeout(() => {
        setPhase('hidden');
        busy.current = false;
        pendingHref.current = null;
      }, EXIT_ANIMATION_TIME);
    }, delay);
  }, []);

  const goAfterCover = useCallback(
    (href: string) => {
      pendingHref.current = href;
      coverNow();
      goTimer.current = window.setTimeout(() => {
        pendingHref.current = null;
        navigate(href);
      }, ENTER_HOLD_TIME);
    },
    [coverNow, navigate]
  );

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

      const currentRoute = routeKey(
        window.location.pathname,
        window.location.search,
        window.location.hash
      );
      const nextRoute = routeKey(destination.pathname, destination.search, destination.hash);

      if (currentRoute === nextRoute) return;

      event.preventDefault();
      event.stopPropagation();

      if (busy.current) return;

      goAfterCover(nextRoute);
    };

    document.addEventListener('click', onDocumentClick, true);
    return () => document.removeEventListener('click', onDocumentClick, true);
  }, [goAfterCover]);

  useLayoutEffect(() => {
    if (pendingHref.current) return;

    coverNow();

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
  }, [location.key, hide, coverNow]);

  useEffect(() => {
    const loading = phase === 'enter' || phase === 'visible';
    document.body.classList.toggle('is-route-loading', loading);
    return () => document.body.classList.remove('is-route-loading');
  }, [phase]);

  useEffect(() => {
    if (phase === 'enter') {
      const id = window.requestAnimationFrame(() => setPhase('visible'));
      return () => window.cancelAnimationFrame(id);
    }
  }, [phase]);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => registerNavigateWithLoading(goAfterCover), [goAfterCover]);

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
