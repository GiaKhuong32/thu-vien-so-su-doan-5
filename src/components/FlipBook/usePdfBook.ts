import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { OutlineItem, SearchHit } from './types';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** Độ phân giải render. 1.5 cho chữ nét trên màn hình retina mà không quá nặng. */
const RENDER_SCALE = 1.5;
const THUMB_WIDTH = 150;

type PageBitmap = {
  url: string;
  width: number;
  height: number;
};

export type PdfBookState = {
  /** Tổng số trang. 0 khi chưa tải xong. */
  numPages: number;
  loading: boolean;
  /** Tiến trình tải file, 0..1 */
  progress: number;
  error: string | null;
  /** Tỉ lệ khung trang (width / height) của trang đầu, dùng để dựng layout. */
  aspect: number;
  outline: OutlineItem[];
  /** Lấy ảnh của một trang (render nếu chưa có). */
  getPage: (pageNumber: number) => PageBitmap | undefined;
  requestPage: (pageNumber: number) => void;
  getThumb: (pageNumber: number) => string | undefined;
  requestThumb: (pageNumber: number) => void;
  searchText: (query: string) => Promise<SearchHit[]>;
  /** Bản ghi tăng dần mỗi khi có trang mới render xong, để component re-render. */
  revision: number;
};

/**
 * Hook quản lý toàn bộ việc đọc PDF: tải document, render trang theo yêu cầu,
 * đọc outline (mục lục) và tìm kiếm văn bản.
 *
 * Nếu `pages` được truyền (danh sách URL ảnh), hook bỏ qua pdf.js và dùng luôn ảnh.
 */
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

  const bump = useCallback(() => {
    if (aliveRef.current) setRevision((r) => r + 1);
  }, []);

  /* ---------- Chế độ ảnh: không cần pdf.js ---------- */
  const imageMode = Boolean(pages?.length) && !src;

  useEffect(() => {
    if (!imageMode || !pages?.length) return;
    aliveRef.current = true;

    pageCache.current.clear();
    thumbCache.current.clear();

    pages.forEach((url, i) => {
      pageCache.current.set(i + 1, { url, width: 0, height: 0 });
      thumbCache.current.set(i + 1, url);
    });

    setNumPages(pages.length);
    setLoading(false);
    setProgress(1);

    // Đo tỉ lệ khung từ ảnh đầu tiên
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

  /* ---------- Chế độ PDF ---------- */
  useEffect(() => {
    if (!src) return;
    aliveRef.current = true;

    let task: pdfjs.PDFDocumentLoadingTask | null = null;

    /**
     * Cờ riêng cho từng lần chạy effect.
     * Không dùng `aliveRef` chung ở đây: dưới StrictMode, effect chạy 2 lần
     * (mount → cleanup → mount). Lần chạy đầu bị huỷ sẽ reject muộn với
     * "Worker was destroyed", lúc đó `aliveRef` đã được lần chạy thứ hai
     * bật lại thành true, khiến lỗi giả bị hiển thị.
     */
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setProgress(0);
      pageCache.current.clear();
      thumbCache.current.clear();
      textCache.current.clear();

      try {
        task = pdfjs.getDocument({
          url: src,
          // Cho phép nạp font/CMap của PDF tiếng Việt
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

        // Tỉ lệ khung trang đầu
        const first = await doc.getPage(1);
        const vp = first.getViewport({ scale: 1 });
        if (!cancelled) setAspect(vp.width / vp.height);

        // Mục lục
        try {
          const raw = await doc.getOutline();
          if (raw?.length && !cancelled) {
            setOutline(await flattenOutline(doc, raw, 0));
          }
        } catch {
          /* PDF không có outline: bỏ qua */
        }

        if (!cancelled) {
          setLoading(false);
          setProgress(1);
          bump();
        }
      } catch (err) {
        // Lần chạy đã bị huỷ: bỏ qua mọi lỗi phát sinh do teardown
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
    };
  }, [src, bump]);

  /* ---------- Render một trang thành ảnh ---------- */
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

      // Nền trắng để trang không bị trong suốt
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;
      page.cleanup();

      return {
        url: canvas.toDataURL('image/jpeg', 0.82),
        width: canvas.width,
        height: canvas.height,
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
            pageCache.current.set(pageNumber, bitmap);
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
            thumbCache.current.set(pageNumber, bitmap.url);
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

  /* ---------- Tìm kiếm văn bản ---------- */
  const searchText = useCallback(async (query: string): Promise<SearchHit[]> => {
    const doc = docRef.current;
    const needle = query.trim().toLowerCase();
    if (!doc || needle.length < 2) return [];

    const hits: SearchHit[] = [];

    for (let p = 1; p <= doc.numPages; p += 1) {
      let text = textCache.current.get(p);

      if (text === undefined) {
        try {
          const page = await doc.getPage(p);
          const content = await page.getTextContent();
          text = content.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ')
            .replace(/\s+/g, ' ');
          textCache.current.set(p, text);
          page.cleanup();
        } catch {
          text = '';
          textCache.current.set(p, text);
        }
      }

      if (!text) continue;

      const haystack = text.toLowerCase();
      let idx = haystack.indexOf(needle);

      // Tối đa 3 kết quả mỗi trang để danh sách không quá dài
      let perPage = 0;
      while (idx !== -1 && perPage < 3) {
        const from = Math.max(0, idx - 42);
        const to = Math.min(text.length, idx + needle.length + 58);
        hits.push({
          page: p,
          excerpt: (from > 0 ? '…' : '') + text.slice(from, to).trim() + (to < text.length ? '…' : ''),
          start: idx - from + (from > 0 ? 1 : 0),
          length: needle.length,
        });
        perPage += 1;
        idx = haystack.indexOf(needle, idx + needle.length);
      }

      if (hits.length >= 80) break;
    }

    return hits;
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

/** Chuyển outline dạng cây của pdf.js thành danh sách phẳng kèm số trang. */
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