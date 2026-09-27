import { useEffect, useRef } from 'react';
import type { PageDrawable } from './types';

type PageCanvasProps = {
  page?: PageDrawable;
  width: number;
  height: number;
  className?: string;
};

export default function PageCanvas({
  page,
  width,
  height,
  className = '',
}: PageCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  const pageEl = page?.el;
  const pageW = page?.width;
  const pageH = page?.height;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || width <= 0 || height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pxW = Math.round(width * dpr);
    const pxH = Math.round(height * dpr);

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pxW, pxH);

    if (!pageEl || !pageW || !pageH) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = Math.min(pxW / pageW, pxH / pageH);
    const drawW = pageW * scale;
    const drawH = pageH * scale;

    ctx.drawImage(
      pageEl,
      (pxW - drawW) / 2,
      (pxH - drawH) / 2,
      drawW,
      drawH
    );
  }, [pageEl, pageW, pageH, width, height]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width, height, display: 'block' }}
    />
  );
}
