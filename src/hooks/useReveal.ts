import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useReveal(deps: unknown[] = []) {
  const { pathname, search } = useLocation();

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let frame = 0;
    let timeout = 0;

    const run = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      if (!nodes.length) return;

      if (!('IntersectionObserver' in window)) {
        nodes.forEach((node) => node.classList.add('is-in'));
        return;
      }

      io?.disconnect();

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io?.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
      );

      nodes.forEach((node) => {
        if (node.classList.contains('is-in')) return;
        io?.observe(node);
      });
    };

    frame = window.requestAnimationFrame(run);
    timeout = window.setTimeout(run, 150);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      io?.disconnect();
    };
  }, [pathname, search, ...deps]);
}