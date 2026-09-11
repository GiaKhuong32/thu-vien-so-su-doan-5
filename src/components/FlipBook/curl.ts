import type { PageDrawable } from './types';

export type CurlDirection = 'next' | 'prev';

export type CurlFrame = {
  ctx: CanvasRenderingContext2D;
  canvasW: number;
  canvasH: number;
  pad: number;
  leafW: number;
  leafH: number;
  spread: boolean;
  dir: CurlDirection;
  progress: number;
  front?: PageDrawable;
  back?: PageDrawable;
  columns?: number;
};

const MAX_CURL = 1.05;
const MAX_TILT_DEG = 3.4;
const PERSPECTIVE = 2.15;

const PERSP_DAMP = 0.22;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);
export function easeFlip(t: number): number {
  const p = clamp(t, 0, 1);
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export function drawCurl(frame: CurlFrame): void {
  const {
    ctx,
    canvasW,
    canvasH,
    pad,
    leafW,
    leafH,
    spread,
    dir,
    front,
    back,
  } = frame;

  const progress = clamp(frame.progress, 0, 1);
  const columns = frame.columns ?? Math.max(48, Math.min(160, Math.round(leafW / 5)));

  ctx.clearRect(0, 0, canvasW, canvasH);
  if (leafW <= 0 || leafH <= 0) return;
  const bookLeft = pad + (spread ? 0 : leafW / 2);
  const spineX = spread ? pad + leafW : bookLeft + (dir === 'next' ? 0 : leafW);
  const s = dir === 'next' ? 1 : -1;

  const cy = canvasH / 2;
  const focal = leafH * PERSPECTIVE;

  const A = Math.PI * progress;

  const kappa = MAX_CURL * Math.sin(Math.PI * progress) + 1e-4;

  const sinA = Math.sin(A);
  const cosA = Math.cos(A);

  const frontMirrored = dir === 'prev';
  const backMirrored = dir === 'next';

  drawLiftShadow(frame, { spineX, s, progress, bookLeft });

  if (!front && !back) return;

  const tilt = ((MAX_TILT_DEG * Math.PI) / 180) * Math.sin(Math.PI * progress) * s;

  ctx.save();
  ctx.translate(spineX, cy);
  ctx.rotate(tilt);
  ctx.translate(-spineX, -cy);

  const geom = (u: number) => {
    const psi = A + kappa * u;
    const x = spineX + (s * leafW * (Math.sin(psi) - sinA)) / kappa;
    const z = (leafW * (cosA - Math.cos(psi))) / kappa;

    const raw = clamp(focal / (focal - z), 0.62, 1.55);
    const persp = 1 + (raw - 1) * PERSP_DAMP;

    return { psi, x, z, persp };
  };

  for (let i = 0; i < columns; i += 1) {
    const u0 = i / columns;
    const u1 = (i + 1) / columns;

    const g0 = geom(u0);
    const g1 = geom(u1);

    const left = Math.min(g0.x, g1.x);
    const width = Math.abs(g1.x - g0.x);
    if (width < 0.01) continue;
    const persp = (g0.persp + g1.persp) / 2;
    const h = leafH * persp;
    const top = cy - h / 2;
    const psi = (g0.psi + g1.psi) / 2;
    const useBack = psi > Math.PI / 2;
    const face = useBack ? back : front;
    if (!face?.width || !face.height) continue;

    const mirrored = useBack ? backMirrored : frontMirrored;

    const su0 = mirrored ? 1 - u1 : u0;
    const su1 = mirrored ? 1 - u0 : u1;
    const sx = su0 * face.width;
    const sw = Math.max((su1 - su0) * face.width, 0.01);

    ctx.drawImage(face.el, sx, 0, sw, face.height, left, top, width + 1, h);

    const lambert = Math.cos(psi - Math.PI / 2.6) * (useBack ? -1 : 1);
    const shade = clamp(-lambert, 0, 1) * 0.42;
    const gloss = clamp(lambert, 0, 1) * 0.2;

    if (shade > 0.004) {
      ctx.fillStyle = `rgba(28, 22, 16, ${shade})`;
      ctx.fillRect(left, top, width + 1, h);
    } else if (gloss > 0.004) {
      ctx.fillStyle = `rgba(255, 253, 246, ${gloss})`;
      ctx.fillRect(left, top, width + 1, h);
    }
  }

  drawSpineShade(ctx, spineX, cy, leafH, s, progress);
  drawCurledCorner(frame, { geom, cy, progress, s });

  ctx.restore();
}

function drawLiftShadow(
  frame: CurlFrame,
  opts: { spineX: number; s: number; progress: number; bookLeft: number }
): void {
  const { ctx, leafW, leafH, canvasH } = frame;
  const { spineX, s, progress } = opts;

  const strength = Math.sin(Math.PI * progress);
  if (strength <= 0.01) return;

  const reach = leafW * (0.42 + 0.34 * strength);
  const cy = canvasH / 2;
  const top = cy - leafH / 2;

  const x0 = spineX;
  const x1 = spineX + s * reach;

  const grad = ctx.createLinearGradient(x0, 0, x1, 0);
  grad.addColorStop(0, `rgba(0, 0, 0, ${0.3 * strength})`);
  grad.addColorStop(0.55, `rgba(0, 0, 0, ${0.1 * strength})`);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(Math.min(x0, x1), top, reach, leafH);
  ctx.restore();
}

function drawSpineShade(
  ctx: CanvasRenderingContext2D,
  spineX: number,
  cy: number,
  leafH: number,
  s: number,
  progress: number
): void {
  const strength = 0.28 + 0.34 * Math.sin(Math.PI * progress);
  const w = 26;
  const top = cy - leafH / 2;

  const grad = ctx.createLinearGradient(spineX, 0, spineX + s * w, 0);
  grad.addColorStop(0, `rgba(24, 18, 12, ${strength})`);
  grad.addColorStop(1, 'rgba(24, 18, 12, 0)');

  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(Math.min(spineX, spineX + s * w), top, w, leafH);
  ctx.restore();
}

function drawCurledCorner(
  frame: CurlFrame,
  opts: {
    geom: (u: number) => { psi: number; x: number; z: number; persp: number };
    cy: number;
    progress: number;
    s: number;
  }
): void {
  const { ctx, leafH } = frame;
  const { geom, cy, progress, s } = opts;

  const strength = Math.sin(Math.PI * progress);
  if (strength <= 0.02) return;

  const edge = geom(1);
  const ex = edge.x;
  const h = leafH * edge.persp;
  const bottom = cy + h / 2;

  const size = Math.min(leafH * 0.16, 96) * strength;
  if (size < 2) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ex, bottom);
  ctx.lineTo(ex - s * size, bottom);
  ctx.lineTo(ex, bottom - size);
  ctx.closePath();

  const grad = ctx.createLinearGradient(ex - s * size, bottom, ex, bottom - size);
  grad.addColorStop(0, `rgba(255, 255, 252, ${0.9 * strength})`);
  grad.addColorStop(0.45, `rgba(232, 226, 214, ${0.92 * strength})`);
  grad.addColorStop(1, `rgba(176, 168, 152, ${0.85 * strength})`);

  ctx.fillStyle = grad;
  ctx.shadowColor = `rgba(0, 0, 0, ${0.34 * strength})`;
  ctx.shadowBlur = 10 * strength;
  ctx.shadowOffsetY = 2;
  ctx.fill();
  ctx.restore();
}

export function drawCornerHint(opts: {
  ctx: CanvasRenderingContext2D;
  canvasW: number;
  canvasH: number;
  pad: number;
  leafW: number;
  leafH: number;
  spread: boolean;
  side: CurlDirection;
 
  amount: number;
}): void {
  const { ctx, canvasW, canvasH, pad, leafW, leafH, spread, side, amount } = opts;

  ctx.clearRect(0, 0, canvasW, canvasH);

  const a = clamp(amount, 0, 1);
  if (a <= 0.01 || leafW <= 0) return;

  const cy = canvasH / 2;
  const bottom = cy + leafH / 2;
  const bookLeft = pad + (spread ? 0 : leafW / 2);
  const ex = side === 'next' ? bookLeft + (spread ? leafW * 2 : leafW) : bookLeft;
  const s = side === 'next' ? 1 : -1;

  const size = Math.min(leafH * 0.13, 78) * a;
  if (size < 2) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ex, bottom);
  ctx.lineTo(ex - s * size * 1.05, bottom);
  ctx.lineTo(ex, bottom - size * 1.05);
  ctx.closePath();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.16 * a})`;
  ctx.filter = 'blur(2px)';
  ctx.fill();
  ctx.filter = 'none';
  ctx.beginPath();
  ctx.moveTo(ex, bottom);
  ctx.lineTo(ex - s * size, bottom);
  ctx.lineTo(ex, bottom - size);
  ctx.closePath();

  const grad = ctx.createLinearGradient(ex - s * size, bottom, ex, bottom - size);
  grad.addColorStop(0, `rgba(255, 255, 253, ${0.96 * a})`);
  grad.addColorStop(0.5, `rgba(236, 230, 219, ${0.96 * a})`);
  grad.addColorStop(1, `rgba(190, 182, 166, ${0.9 * a})`);

  ctx.fillStyle = grad;
  ctx.shadowColor = `rgba(0, 0, 0, ${0.3 * a})`;
  ctx.shadowBlur = 8 * a;
  ctx.fill();

  ctx.restore();
}
