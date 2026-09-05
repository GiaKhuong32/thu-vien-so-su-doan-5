import { useEffect, useRef, useState } from "react";
import * as pdfjs from 'pdfjs-dist';

const thumbCache = new Map<number, string>();

export function usePdfThumbnail(pdf: pdfjs.PDFDocumentProxy | null, pageNumber: number) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [src, setSrc] = useState<string | null>(thumbCache.get(pageNumber) ?? null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      {
        root: document.querySelector(".fb-panel__body") ?? null,
        rootMargin: "500px",
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pdf || !visible || src) return;

    let cancelled = false;

    async function load() {
      try {
        const nextSrc = await renderPdfThumbnail(pdf, pageNumber);

        if (!cancelled) {
          setSrc(nextSrc);
        }
      } catch (error) {
        console.error(`[usePdfThumbnail] Lỗi render thumbnail trang ${pageNumber}:`, error);

        if (!cancelled && retry < 5) {
          window.setTimeout(() => {
            setRetry((value) => value + 1);
          }, 300 + retry * 300);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, visible, src, retry]);

  return { ref, src };
}

async function renderPdfThumbnail(
  pdf: pdfjs.PDFDocumentProxy,
  pageNumber: number
): Promise<string> {
  const cached = thumbCache.get(pageNumber);
  if (cached) return cached;

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 0.28 });

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Cannot create thumbnail canvas");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const task = page.render({
    canvasContext: context,
    viewport,
  });

  await task.promise;
  page.cleanup();

  if (isCanvasVisuallyBlank(canvas)) {
    throw new Error(`Blank thumbnail ${pageNumber}`);
  }

  const src = canvas.toDataURL("image/jpeg", 0.86);
  thumbCache.set(pageNumber, src);

  return src;
}

function isCanvasVisuallyBlank(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return true;

  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let nonWhitePixels = 0;

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a > 0 && (r < 245 || g < 245 || b < 245)) {
      nonWhitePixels++;
      if (nonWhitePixels > 20) return false;
    }
  }

  return true;
}

export function clearThumbnailCache(pageNumber?: number) {
  if (pageNumber) {
    thumbCache.delete(pageNumber);
  } else {
    thumbCache.clear();
  }
}
