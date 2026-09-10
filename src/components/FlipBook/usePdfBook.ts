import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { OutlineItem, PageDrawable, SearchHit } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const PREVIEW_WIDTH = 380;
const MAX_FULL_WIDTH = 2200;
const FULL_CACHE = 8;
const PREVIEW_CACHE = 64;
const THUMB_WIDTH = 150;
const THUMB_CACHE = 120;
const MAX_CONCURRENT = 2;
type Tier = 'preview' | 'full';

type CanvasEntry = {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
};

type Job = {
  key: string;
  pageNumber: number;
  tier: Tier;
  targetWidth: number;
  priority: number;
  run: () => Promise<void>;
};

function releaseCanvas(entry?: CanvasEntry) {
  if (!entry) return;
  entry.canvas.width = 0;
  entry.canvas.height = 0;
}

function trimCache(cache: Map<number, CanvasEntry>, max: number, keep: Set<number>) {
  if (cache.size <= max) return;

  for (const key of [...cache.keys()]) {
    if (cache.size <= max) break;
    if (keep.has(key)) continue;
    releaseCanvas(cache.get(key));
    cache.delete(key);
  }
}

function trimStringCache(cache: Map<number, string>, max: number) {
  while (cache.size > max) {
    const first = cache.keys().next().value;
    if (first === undefined) break;
    const removed = cache.get(first);
    if (removed?.startsWith('blob:')) URL.revokeObjectURL(removed);
    cache.delete(first);
  }
}

export type PdfBookState = {
  numPages: number;
  loading: boolean;
  progress: number;
  error: string | null;
  aspect: number;
  outline: OutlineItem[];
  getPage: (pageNumber: number) => PageDrawable | undefined;
  requestPage: (pageNumber: number, priority?: number) => void;
  getThumb: (pageNumber: number) => string | undefined;
  requestThumb: (pageNumber: number) => void;
  searchText: (query: string) => Promise<SearchHit[]>;
  setTargetWidth: (width: number) => void;
  revision: number;
  getDoc: () => pdfjs.PDFDocumentProxy | null;
  docId: number;
  markHot: (list: number[]) => void;
};

export function usePdfBook(src?: string, pages?: string[]): PdfBookState {
  const [numPages, setNumPages] = useState(0);
  const [loading, setLoading] = useState(Boolean(src) || Boolean(pages?.length));
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aspect, setAspect] = useState(0.707);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [revision, setRevision] = useState(0);
  const [docId, setDocId] = useState(0);

  const docRef = useRef<pdfjs.PDFDocumentProxy | null>(null);
  const fullCache = useRef<Map<number, CanvasEntry>>(new Map());
  const previewCache = useRef<Map<number, CanvasEntry>>(new Map());
  const imageCache = useRef<Map<number, PageDrawable>>(new Map());
  const thumbCache = useRef<Map<number, string>>(new Map());
  const textCache = useRef<Map<number, string>>(new Map());

  const inflight = useRef<Set<string>>(new Set());
  const queue = useRef<Job[]>([]);
  const active = useRef(0);
  const hotPages = useRef<Set<number>>(new Set());
  const targetWidth = useRef(900);
  const aliveRef = useRef(true);
  const searchSeq = useRef(0);
  const rafBump = useRef<number | null>(null);

  const imageMode = Boolean(pages?.length) && !src;

  const bump = useCallback(() => {
    if (!aliveRef.current || rafBump.current !== null) return;

    rafBump.current = requestAnimationFrame(() => {
      rafBump.current = null;
      if (aliveRef.current) setRevision((r) => r + 1);
    });
  }, []);

  const clearAll = useCallback(() => {
    queue.current = [];
    inflight.current.clear();

    for (const entry of fullCache.current.values()) releaseCanvas(entry);
    fullCache.current.clear();

    for (const entry of previewCache.current.values()) releaseCanvas(entry);
    previewCache.current.clear();

    imageCache.current.clear();

    for (const url of thumbCache.current.values()) {
      if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    }
    thumbCache.current.clear();
    textCache.current.clear();
  }, []);

  const pump = useCallback(() => {
    while (active.current < MAX_CONCURRENT && queue.current.length > 0) {
  
      queue.current.sort((a, b) => b.priority - a.priority);
      const job = queue.current.shift();
      if (!job) break;

      active.current += 1;
      job
        .run()
        .catch(() => undefined)
        .finally(() => {
          active.current -= 1;
          inflight.current.delete(job.key);
          pump();
        });
    }
  }, []);

  const enqueue = useCallback(
    (job: Job) => {
      if (inflight.current.has(job.key)) {
       
        const existing = queue.current.find((j) => j.key === job.key);
        if (existing && job.priority > existing.priority) {
          existing.priority = job.priority;
        }
        return;
      }

      inflight.current.add(job.key);
      queue.current.push(job);
      pump();
    },
    [pump]
  );

  const renderToCanvas = useCallback(
    async (pageNumber: number, width: number): Promise<CanvasEntry | null> => {
      const doc = docRef.current;
      if (!doc || pageNumber < 1 || pageNumber > doc.numPages) return null;

      const page = await doc.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.max(width, 64) / base.width;
      const viewport = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.ceil(viewport.width));
      canvas.height = Math.max(1, Math.ceil(viewport.height));

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        page.cleanup();
        return null;
      }

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      return { canvas, width: canvas.width, height: canvas.height };
    },
    []
  );

  const requestPage = useCallback(
    (pageNumber: number, priority = 0) => {
      if (imageMode || pageNumber < 1) return;
      if (!docRef.current || pageNumber > numPages) return;

      const wantFull = Math.min(Math.round(targetWidth.current), MAX_FULL_WIDTH);

      const preview = previewCache.current.get(pageNumber);
      if (!preview) {
        enqueue({
          key: `p:${pageNumber}`,
          pageNumber,
          tier: 'preview',
          targetWidth: PREVIEW_WIDTH,
   
          priority: priority + 1000,
          run: async () => {
            const entry = await renderToCanvas(pageNumber, PREVIEW_WIDTH);
            if (!entry || !aliveRef.current) {
              releaseCanvas(entry ?? undefined);
              return;
            }
            releaseCanvas(previewCache.current.get(pageNumber));
            previewCache.current.set(pageNumber, entry);
            trimCache(previewCache.current, PREVIEW_CACHE, hotPages.current);
            bump();
          },
        });
      }

      const full = fullCache.current.get(pageNumber);
      const needFull = !full || full.width < wantFull * 0.85;

      if (needFull) {
        enqueue({
          key: `f:${pageNumber}`,
          pageNumber,
          tier: 'full',
          targetWidth: wantFull,
          priority,
          run: async () => {
            const entry = await renderToCanvas(pageNumber, wantFull);
            if (!entry || !aliveRef.current) {
              releaseCanvas(entry ?? undefined);
              return;
            }
            releaseCanvas(fullCache.current.get(pageNumber));
            fullCache.current.set(pageNumber, entry);
            trimCache(fullCache.current, FULL_CACHE, hotPages.current);
            bump();
          },
        });
      }
    },
    [imageMode, numPages, enqueue, renderToCanvas, bump]
  );

  const getPage = useCallback(
    (pageNumber: number): PageDrawable | undefined => {
      if (imageMode) return imageCache.current.get(pageNumber);

      const full = fullCache.current.get(pageNumber);
      if (full) {
        return {
          el: full.canvas,
          width: full.width,
          height: full.height,
          renderedWidth: full.width,
        };
      }

      const preview = previewCache.current.get(pageNumber);
      if (preview) {
        return {
          el: preview.canvas,
          width: preview.width,
          height: preview.height,
          renderedWidth: preview.width,
        };
      }

      return undefined;
    },
    [imageMode]
  );

  const setTargetWidth = useCallback((width: number) => {
    const next = Math.min(Math.max(Math.round(width), 240), MAX_FULL_WIDTH);
    const current = targetWidth.current;

    if (Math.abs(next - current) / current < 0.2) return;
    targetWidth.current = next;
  }, []);

  const requestThumb = useCallback(
    (pageNumber: number) => {
      if (imageMode || pageNumber < 1) return;
      if (!docRef.current || thumbCache.current.has(pageNumber)) return;

      enqueue({
        key: `t:${pageNumber}`,
        pageNumber,
        tier: 'preview',
        targetWidth: THUMB_WIDTH,
        priority: -500,
        run: async () => {
          const entry = await renderToCanvas(pageNumber, THUMB_WIDTH);
          if (!entry) return;

          try {
            if (aliveRef.current) {
              thumbCache.current.set(
                pageNumber,
                entry.canvas.toDataURL('image/jpeg', 0.82)
              );
              trimStringCache(thumbCache.current, THUMB_CACHE);
              bump();
            }
          } finally {
            releaseCanvas(entry);
          }
        },
      });
    },
    [imageMode, enqueue, renderToCanvas, bump]
  );

  const getThumb = useCallback(
    (pageNumber: number) => {
      if (imageMode) return imageCache.current.get(pageNumber)?.el instanceof HTMLImageElement
        ? (imageCache.current.get(pageNumber)!.el as HTMLImageElement).src
        : undefined;
      return thumbCache.current.get(pageNumber);
    },
    [imageMode]
  );

  const getPageText = useCallback(async (pageNumber: number): Promise<string> => {
    const cached = textCache.current.get(pageNumber);
    if (cached !== undefined) return cached;

    const doc = docRef.current;
    if (!doc) return '';

    try {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();

      const text = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ');

      textCache.current.set(pageNumber, text);
      page.cleanup();

      return text;
    } catch {
      return '';
    }
  }, []);

  const searchText = useCallback(
    async (query: string): Promise<SearchHit[]> => {
      const doc = docRef.current;
      const needle = query.trim().toLowerCase();
      if (!doc || needle.length < 2) return [];

      const seq = ++searchSeq.current;
      const hits: SearchHit[] = [];
      const batchSize = 6;

      for (let start = 1; start <= doc.numPages; start += batchSize) {
        if (seq !== searchSeq.current) return [];

        const batch = Array.from(
          { length: Math.min(batchSize, doc.numPages - start + 1) },
          (_, i) => start + i
        );

        const texts = await Promise.all(
          batch.map(async (pageNumber) => ({
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
              excerpt:
                (from > 0 ? '…' : '') +
                text.slice(from, to).trim() +
                (to < text.length ? '…' : ''),
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
    },
    [getPageText]
  );

  useEffect(() => {
    if (!imageMode || !pages?.length) return;

    aliveRef.current = true;
    clearAll();

    let cancelled = false;

    setNumPages(pages.length);
    setError(null);
    setDocId((id) => id + 1);

    const loadAll = pages.map(
      (url, i) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            if (!cancelled) {
              imageCache.current.set(i + 1, {
                el: img,
                width: img.naturalWidth,
                height: img.naturalHeight,
                renderedWidth: img.naturalWidth,
              });

              if (i === 0 && img.naturalHeight > 0) {
                setAspect(img.naturalWidth / img.naturalHeight);
              }
              bump();
            }
            resolve();
          };

          img.onerror = () => resolve();
          img.src = url;
        })
    );

    loadAll[0]?.then(() => {
      if (!cancelled) {
        setLoading(false);
        setProgress(1);
      }
    });

    Promise.all(loadAll).then(() => {
      if (!cancelled) {
        setLoading(false);
        setProgress(1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [imageMode, pages, clearAll, bump]);

  useEffect(() => {
    if (!src) return;

    aliveRef.current = true;
    let cancelled = false;
    let task: pdfjs.PDFDocumentLoadingTask | null = null;

    const load = async () => {
      setLoading(true);
      setError(null);
      setProgress(0);
      setOutline([]);
      clearAll();

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
          if (total > 0 && !cancelled) setProgress(Math.min(loaded / total, 1));
        };

        const doc = await task.promise;

        if (cancelled) {
          doc.destroy().catch(() => undefined);
          return;
        }

        docRef.current = doc;
        setNumPages(doc.numPages);
        setDocId((id) => id + 1);

        const first = await doc.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (!cancelled) setAspect(vp.width / vp.height);
        first.cleanup();

        if (cancelled) return;

        const cover = await renderToCanvas(1, PREVIEW_WIDTH);
        if (cancelled || !aliveRef.current) {
          releaseCanvas(cover ?? undefined);
          return;
        }

        if (cover) {
          previewCache.current.set(1, cover);
        }

        setLoading(false);
        setProgress(1);
        bump();

        doc
          .getOutline()
          .then(async (raw) => {
            if (!raw?.length || cancelled) return;
            const flat = await flattenOutline(doc, raw, 0);
            if (!cancelled) setOutline(flat);
          })
          .catch(() => undefined);
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

      if (rafBump.current !== null) {
        cancelAnimationFrame(rafBump.current);
        rafBump.current = null;
      }

      task?.destroy().catch(() => undefined);
      docRef.current = null;
      clearAll();
    };
  }, [src, clearAll, renderToCanvas, bump]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
    };
  }, []);

  const markHot = useCallback((list: number[]) => {
    hotPages.current = new Set(list);
  }, []);

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
      setTargetWidth,
      revision,
      getDoc: () => docRef.current,
      docId,
      markHot,
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
      setTargetWidth,
      revision,
      docId,
      markHot,
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
        const index = await doc.getPageIndex(
          dest[0] as Parameters<typeof doc.getPageIndex>[0]
        );
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