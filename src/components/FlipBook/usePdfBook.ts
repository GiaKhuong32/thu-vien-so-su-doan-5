import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { OutlineItem, SearchHit } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const RENDER_SCALE = 1.5;
const THUMB_WIDTH = 150;

type PageBitmap = {
  url: string;
  width: number;
  height: number;
  objectUrl?: boolean;
};

function revokeBitmap(bitmap?: PageBitmap) {
  if (bitmap?.objectUrl) {
    URL.revokeObjectURL(bitmap.url);
  }
}

function setLimitedCache<K, V extends { url: string; objectUrl?: boolean }>(
  cache: Map<K, V>,
  key: K,
  value: V,
  max: number
) {
  const old = cache.get(key);
  if (old?.objectUrl) URL.revokeObjectURL(old.url);

  cache.delete(key);
  cache.set(key, value);

  while (cache.size > max) {
    const firstKey = cache.keys().next().value;
    if (firstKey === undefined) break;
    const removed = cache.get(firstKey);

    if (removed?.objectUrl) URL.revokeObjectURL(removed.url);

    cache.delete(firstKey);
  }
}

function setLimitedThumbCache(
  cache: Map<number, string>,
  key: number,
  value: string,
  max: number
) {
  const old = cache.get(key);
  if (old?.startsWith('blob:')) {
    URL.revokeObjectURL(old);
  }

  cache.delete(key);
  cache.set(key, value);

  while (cache.size > max) {
    const firstKey = cache.keys().next().value;
    if (firstKey === undefined) break;
    const removed = cache.get(firstKey);

    if (removed?.startsWith('blob:')) {
      URL.revokeObjectURL(removed);
    }

    cache.delete(firstKey);
  }
}

export type PdfBookState = {
  numPages: number;
  loading: boolean;
  progress: number;
  error: string | null;
  aspect: number;
  outline: OutlineItem[];
  getPage: (pageNumber: number) => PageBitmap | undefined;
  requestPage: (pageNumber: number) => void;
  getThumb: (pageNumber: number) => string | undefined;
  requestThumb: (pageNumber: number) => void;
  searchText: (query: string) => Promise<SearchHit[]>;
  revision: number;
};

export function usePdfBook(src?: string, pages?: string[]): PdfBookState {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(Boolean(src) || Boolean(pages?.length));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aspect, setAspect] = useState(0.707); // A4 dọc
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [revision, setRevision] = useState(0);
  const docRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const pageCache = useRef<Map<number, PageBitmap>>(new Map());
  const thumbCache = useRef<Map<number, string>>(new Map());
  const pendingPages = useRef<Set<number>>(new Set());
  const pendingThumbs = useRef<Set<number>>(new Set());
  const textCache = useRef<Map<number, string>>(new Map());
  const aliveRef = useRef(true);
  const searchSeq = useRef(0);

  const bump = useCallback(() => {
    if (aliveRef.current) setRevision((r) => r + 1);
  }, []);

  const getPageText = useCallback(async (pageNumber: number): Promise<string> => {
    const cached = textCache.current.get(pageNumber);
    if (cached !== undefined) return cached;

    const doc = docRef.current;
    if (!doc) return '';

    try {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();

      const text = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ');

      textCache.current.set(pageNumber, text);
      page.cleanup();

      return text;
    } catch {
      return '';
    }
  }, []);

  const imageMode = Boolean(pages?.length) && !src;

  useEffect(() => {
    if (!imageMode || !pages?.length) return;
    aliveRef.current = true;

    for (const bitmap of pageCache.current.values()) {
      revokeBitmap(bitmap);
    }
    pageCache.current.clear();

    for (const thumb of thumbCache.current.values()) {
      if (thumb.startsWith('blob:')) {
        URL.revokeObjectURL(thumb);
      }
    }
    thumbCache.current.clear();

    pages.forEach((url, i) => {
      pageCache.current.set(i + 1, { url, width: 0, height: 0 });
      thumbCache.current.set(i + 1, url);
    });

    setNumPages(pages.length);
    setLoading(false);
    setProgress(1);

    const probe = new Image();
    probe.onload = () => {
      if (probe.naturalHeight > 0 && aliveRef.current) {
        setAspect(probe.naturalWidth / probe.naturalHeight);
      }
    };
    probe.src = pages[0];
    bump();

    return () => {
      aliveRef.current = false;
    };
  }, [imageMode, pages, bump]);

  useEffect(() => {
    if (!src) return;
    aliveRef.current = true;

    let task: pdfjs.PDFDocumentLoadingTask | null = null;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setProgress(0);

      for (const bitmap of pageCache.current.values()) {
        revokeBitmap(bitmap);
      }
      pageCache.current.clear();

      for (const thumb of thumbCache.current.values()) {
        if (thumb.startsWith('blob:')) {
          URL.revokeObjectURL(thumb);
        }
      }
      thumbCache.current.clear();
      textCache.current.clear();

      try {
        task = pdfjs.getDocument({
          url: src,
 
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
          standardFontDataUrl:
            'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/standard_fonts/',
          withCredentials: false,
        });

        task.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
          if (total > 0 && !cancelled) {
            setProgress(Math.min(loaded / total, 1));
          }
        };

        const doc = await task.promise;
        if (cancelled) {
          doc.destroy().catch(() => undefined);
          return;
        }

        docRef.current = doc;
        setNumPages(doc.numPages);

        const first = await doc.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (!cancelled) setAspect(vp.width / vp.height);

        try {
          const raw = await doc.getOutline();
          if (raw?.length && !cancelled) {
            setOutline(await flattenOutline(doc, raw, 0));
          }
        } catch {
        }

        if (!cancelled) {
          setLoading(false);
          setProgress(1);
          bump();
        }
      } catch (err) {
   
        if (cancelled) return;

        console.error('[FlipBook] Không tải được PDF:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Không tải được tệp PDF. Vui lòng thử lại.'
        );
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
      aliveRef.current = false;
      task?.destroy().catch(() => undefined);
      docRef.current = null;

      for (const bitmap of pageCache.current.values()) {
        revokeBitmap(bitmap);
      }
      pageCache.current.clear();

      for (const thumb of thumbCache.current.values()) {
        if (thumb.startsWith('blob:')) {
          URL.revokeObjectURL(thumb);
        }
      }
      thumbCache.current.clear();
    };
  }, [src, bump]);

  const renderPage = useCallback(
    async (pageNumber: number, targetWidth?: number): Promise<PageBitmap | null> => {
      const doc = docRef.current;
      if (!doc || pageNumber < 1 || pageNumber > doc.numPages) return null;

      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = targetWidth ? targetWidth / base.width : RENDER_SCALE;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return null;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.86);
      });

      if (!blob) return null;

      return {
        url: URL.createObjectURL(blob),
        width: canvas.width,
        height: canvas.height,
        objectUrl: true,
      };
    },
    []
  );

  const requestPage = useCallback(
    (pageNumber: number) => {
      if (
        imageMode ||
        pageNumber < 1 ||
        pageCache.current.has(pageNumber) ||
        pendingPages.current.has(pageNumber) ||
        !docRef.current
      ) {
        return;
      }

      pendingPages.current.add(pageNumber);
      renderPage(pageNumber)
        .then((bitmap) => {
          if (bitmap && aliveRef.current) {
            setLimitedCache(pageCache.current, pageNumber, bitmap, 32);
            bump();
          }
        })
        .catch(() => undefined)
        .finally(() => pendingPages.current.delete(pageNumber));
    },
    [imageMode, renderPage, bump]
  );

  const requestThumb = useCallback(
    (pageNumber: number) => {
      if (
        imageMode ||
        pageNumber < 1 ||
        thumbCache.current.has(pageNumber) ||
        pendingThumbs.current.has(pageNumber) ||
        !docRef.current
      ) {
        return;
      }

      pendingThumbs.current.add(pageNumber);
      renderPage(pageNumber, THUMB_WIDTH)
        .then((bitmap) => {
          if (bitmap && aliveRef.current) {
            setLimitedThumbCache(
              thumbCache.current,
              pageNumber,
              bitmap.url,
              80
            );
            bump();
          }
        })
        .catch(() => undefined)
        .finally(() => pendingThumbs.current.delete(pageNumber));
    },
    [imageMode, renderPage, bump]
  );

  const getPage = useCallback(
    (pageNumber: number) => pageCache.current.get(pageNumber),
    []
  );
  const getThumb = useCallback(
    (pageNumber: number) => thumbCache.current.get(pageNumber),
    []
  );

  const searchText = useCallback(async (query: string): Promise<SearchHit[]> => {
    const doc = docRef.current;
    const needle = query.trim().toLowerCase();
    if (!doc || needle.length < 2) return [];

    const seq = ++searchSeq.current;
    const hits: SearchHit[] = [];
    const batchSize = 6;

    for (let start = 1; start <= doc.numPages; start += batchSize) {

      if (seq !== searchSeq.current) return [];

      const pages = Array.from(
        { length: Math.min(batchSize, doc.numPages - start + 1) },
        (_, i) => start + i
      );

      const texts = await Promise.all(
        pages.map(async (pageNumber) => ({
          pageNumber,
          text: await getPageText(pageNumber),
        }))
      );

      for (const { pageNumber, text } of texts) {
        if (!text) continue;

        const haystack = text.toLowerCase();
        let idx = haystack.indexOf(needle);

        let perPage = 0;
        while (idx !== -1 && perPage < 3) {
          const from = Math.max(0, idx - 42);
          const to = Math.min(text.length, idx + needle.length + 58);
          hits.push({
            page: pageNumber,
            excerpt: (from > 0 ? '…' : '') + text.slice(from, to).trim() + (to < text.length ? '…' : ''),
            start: idx - from + (from > 0 ? 1 : 0),
            length: needle.length,
          });
          perPage += 1;
          idx = haystack.indexOf(needle, idx + needle.length);
        }
      }

      if (hits.length >= 80) return hits;

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    return hits;
  }, [getPageText]);

  return useMemo(
    () => ({
      numPages,
      loading,
      progress,
      error,
      aspect,
      outline,
      getPage,
      requestPage,
      getThumb,
      requestThumb,
      searchText,
      revision,
    }),
    [
      numPages,
      loading,
      progress,
      error,
      aspect,
      outline,
      getPage,
      requestPage,
      getThumb,
      requestThumb,
      searchText,
      revision,
    ]
  );
}

async function flattenOutline(
  doc: pdfjs.PDFDocumentProxy,
  items: Awaited<ReturnType<pdfjs.PDFDocumentProxy['getOutline']>>,
  level: number
): Promise<OutlineItem[]> {
  const out: OutlineItem[] = [];

  for (const item of items ?? []) {
    let page: number | null = null;

    try {
      const dest =
        typeof item.dest === 'string' ? await doc.getDestination(item.dest) : item.dest;

      if (Array.isArray(dest) && dest[0]) {
        const index = await doc.getPageIndex(dest[0] as Parameters<typeof doc.getPageIndex>[0]);
        page = index + 1;
      }
    } catch {
      page = null;
    }

    out.push({ title: item.title || '(không tiêu đề)', page, level });

    if (item.items?.length) {
      out.push(...(await flattenOutline(doc, item.items, level + 1)));
    }
  }

  return out;
}
