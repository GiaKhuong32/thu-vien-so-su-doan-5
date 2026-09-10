import { useEffect, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';

const caches = new Map<number, Map<number, string>>();

function cacheFor(docId: number): Map<number, string> {
  let cache = caches.get(docId);
  if (!cache) {
    cache = new Map();
    caches.set(docId, cache);

    if (caches.size > 2) {
      const oldest = caches.keys().next().value;
      if (oldest !== undefined && oldest !== docId) caches.delete(oldest);
    }
  }
  return cache;
}

const THUMB_WIDTH = 132;

const MAX_CONCURRENT = 2;

let active = 0;
const waiting: (() => void)[] = [];

async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiting.push(resolve));
  active += 1;
}

function release(): void {
  active -= 1;
  waiting.shift()?.();
}

export function usePdfThumbnail(
  pdf: pdfjs.PDFDocumentProxy | null,
  pageNumber: number,
  docId = 0
) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(
    () => cacheFor(docId).get(pageNumber) ?? null
  );

  useEffect(() => {
    setSrc(cacheFor(docId).get(pageNumber) ?? null);
  }, [docId, pageNumber]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      {
      
        root: el.closest('.fb-panel__body') ?? null,
        rootMargin: '220px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !visible || src) return;

    let cancelled = false;

    const load = async () => {
      await acquire();

      try {
        if (cancelled) return;

        const cache = cacheFor(docId);
        const cached = cache.get(pageNumber);

        if (cached) {
          if (!cancelled) setSrc(cached);
          return;
        }

        const next = await renderThumb(pdf, pageNumber);
        cache.set(pageNumber, next);

        if (!cancelled) setSrc(next);
      } catch (err) {
     
        console.warn(`[FlipBook] Không render được thumbnail trang ${pageNumber}`, err);
      } finally {
        release();
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, visible, src, docId]);

  return { ref, src };
}

async function renderThumb(
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number
): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: THUMB_WIDTH / base.width });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    page.cleanup();
    throw new Error('Không tạo được canvas thumbnail');
  }

  canvas.width = Math.max(1, Math.ceil(viewport.width));
  canvas.height = Math.max(1, Math.ceil(viewport.height));

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup();

  const url = canvas.toDataURL('image/jpeg', 0.82);

  canvas.width = 0;
  canvas.height = 0;

  return url;
}

export function clearThumbnailCache(docId?: number) {
  if (docId === undefined) caches.clear();
  else caches.delete(docId);
}
