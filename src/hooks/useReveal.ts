import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useReveal() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let frame = 0;

    const run = () => {
      const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));

      if (!nodes.length) return;

      nodes.forEach((node) => {
        node.classList.remove('is-in');
      });

      if (!('IntersectionObserver' in window)) {
        nodes.forEach((node) => node.classList.add('is-in'));
        return;
      }

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

      nodes.forEach((node) => io?.observe(node));
    };

    frame = window.requestAnimationFrame(run);

    return () => {
      window.cancelAnimationFrame(frame);
      io?.disconnect();
    };
  }, [pathname, search]);
}