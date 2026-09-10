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

    if (!page) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const scale = Math.min(pxW / page.width, pxH / page.height);
    const drawW = page.width * scale;
    const drawH = page.height * scale;

    ctx.drawImage(
      page.el,
      (pxW - drawW) / 2,
      (pxH - drawH) / 2,
      drawW,
      drawH
    );
  }, [page, width, height]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width, height, display: 'block' }}
    />
  );
}