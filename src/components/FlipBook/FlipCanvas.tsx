import { useEffect, useRef } from 'react';
import { drawCornerHint, drawCurl, easeFlip } from './curl';
import type { CurlDirection } from './curl';
import type { PageDrawable } from './types';

export type FlipRequest = {
  id: number;
  dir: CurlDirection;
  front?: PageDrawable;
  back?: PageDrawable;
  from?: number;
  duration: number;
};

type FlipCanvasProps = {
  leafW: number;
  leafH: number;
  spread: boolean;
  pad: number;
  request: FlipRequest | null;

  drag: {
    dir: CurlDirection;
    progress: number;
    front?: PageDrawable;
    back?: PageDrawable;
  } | null;

  hint: { side: CurlDirection; amount: number } | null;
  onFlipEnd: (id: number) => void;
};

export default function FlipCanvas({
  leafW,
  leafH,
  spread,
  pad,
  request,
  drag,
  hint,
  onFlipEnd,
}: FlipCanvasProps) {
  const flipRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef<number | null>(null);

  const canvasW = (spread ? leafW * 2 : leafW) + pad * 2;
  const canvasH = leafH + pad * 2;

  const prepare = (canvas: HTMLCanvasElement | null) => {
    if (!canvas || canvasW <= 0 || canvasH <= 0) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pxW = Math.round(canvasW * dpr);
    const pxH = Math.round(canvasH * dpr);

    if (canvas.width !== pxW || canvas.height !== pxH) {
      canvas.width = pxW;
      canvas.height = pxH;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  };

  useEffect(() => {
    if (!request || leafW <= 0) return;
    if (doneRef.current === request.id) return;

    const ctx = prepare(flipRef.current);
    if (!ctx) return;

    const start = performance.now();
    const from = request.from ?? 0;
    const span = Math.max(request.duration * (1 - from), 1);

    const tick = (now: number) => {
      const linear = Math.min((now - start) / span, 1);
      const progress = from + (1 - from) * easeFlip(linear);

      drawCurl({
        ctx,
        canvasW,
        canvasH,
        pad,
        leafW,
        leafH,
        spread,
        dir: request.dir,
        progress,
        front: request.front,
        back: request.back,
      });

      if (linear < 1) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      ctx.clearRect(0, 0, canvasW, canvasH);
      doneRef.current = request.id;
      onFlipEnd(request.id);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [request, leafW, leafH, spread, pad, canvasW, canvasH, onFlipEnd]);

  useEffect(() => {
    const ctx = prepare(flipRef.current);
    if (!ctx) return;

    if (!drag) {
      if (!request) ctx.clearRect(0, 0, canvasW, canvasH);
      return;
    }

    drawCurl({
      ctx,
      canvasW,
      canvasH,
      pad,
      leafW,
      leafH,
      spread,
      dir: drag.dir,
      progress: drag.progress,
      front: drag.front,
      back: drag.back,
    });
  }, [drag, request, leafW, leafH, spread, pad, canvasW, canvasH]);

  useEffect(() => {
    const ctx = prepare(hintRef.current);
    if (!ctx) return;

    if (!hint || drag || request) {
      ctx.clearRect(0, 0, canvasW, canvasH);
      return;
    }

    drawCornerHint({
      ctx,
      canvasW,
      canvasH,
      pad,
      leafW,
      leafH,
      spread,
      side: hint.side,
      amount: hint.amount,
    });
  }, [hint, drag, request, leafW, leafH, spread, pad, canvasW, canvasH]);

  if (leafW <= 0 || leafH <= 0) return null;

  const style = {
    position: 'absolute' as const,
    top: -pad,
    left: -pad,
    width: canvasW,
    height: canvasH,
    pointerEvents: 'none' as const,
  };

  return (
    <>
      <canvas ref={hintRef} className="fb-hintCanvas" style={{ ...style, zIndex: 25 }} />
      <canvas ref={flipRef} className="fb-flipCanvas" style={{ ...style, zIndex: 45 }} />
    </>
  );
}
