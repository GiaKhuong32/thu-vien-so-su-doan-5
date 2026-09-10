import type { PageDrawable } from './types';

/**
 * Bộ vẽ hiệu ứng "lật trang cong" (page curl) trên canvas 2D.
 *
 * Ý tưởng: coi tờ giấy đang lật như một mặt trụ (cylinder) quay quanh gáy sách.
 * Với mỗi cột dọc u ∈ [0, 1] tính từ gáy ra mép ngoài:
 *
 *   ψ(u) = A + κ·u                     (góc pháp tuyến của cột)
 *   x(u) = spine + s·L·(sin(A+κu) − sin A)/κ
 *   z(u) = L·(cos A − cos(A+κu))/κ     (z > 0 = hướng về phía người xem)
 *
 * A = π·progress là góc quay của phần gáy, κ là độ cong (0 = giấy phẳng).
 * κ đạt cực đại ở giữa hành trình nên trang phẳng lúc bắt đầu/kết thúc và
 * cong nhất khi đang lật — giống giấy thật.
 *
 * Mỗi cột được vẽ bằng một lệnh drawImage với chiều cao đã nhân hệ số phối cảnh,
 * nhờ vậy mép trên/mép dưới của trang bị "phồng" ra tạo cảm giác cong thật,
 * thay vì chỉ là hình chữ nhật quay phẳng như rotateY của CSS.
 */

export type CurlDirection = 'next' | 'prev';

export type CurlFrame = {
  ctx: CanvasRenderingContext2D;
  /** Kích thước canvas theo CSS pixel (đã chia devicePixelRatio). */
  canvasW: number;
  canvasH: number;
  /** Lề an toàn để trang cong tràn ra ngoài không bị cắt. */
  pad: number;
  leafW: number;
  leafH: number;
  spread: boolean;
  dir: CurlDirection;
  /** 0 = chưa lật, 1 = đã lật xong. */
  progress: number;
  front?: PageDrawable;
  back?: PageDrawable;
  /** Số cột dùng để xấp xỉ mặt trụ. Nhiều hơn = mượt hơn nhưng nặng hơn. */
  columns?: number;
};

/** Độ cong tối đa (radian) của mép ngoài so với gáy. */
const MAX_CURL = 1.05;
/** Độ nghiêng nhẹ quanh gáy giúp góc dưới bật lên trước — "chuẩn bị lật". */
const MAX_TILT_DEG = 3.4;
/** Khoảng cách phối cảnh, tính theo chiều cao trang. */
const PERSPECTIVE = 2.15;
/**
 * Hệ số giảm nhẹ hiệu ứng phối cảnh theo chiều cao.
 *
 * Phối cảnh thô cho trang cao thêm tới ~47% ở giữa hành trình, trông phóng đại
 * quá mức. Giảm còn khoảng 1/5 cho cảm giác nhô lên vừa phải, tự nhiên.
 */
const PERSP_DAMP = 0.22;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

/** Làm mềm hai đầu hành trình để trang không giật khi bắt đầu/kết thúc. */
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

  // Toạ độ gáy sách trong hệ canvas.
  const bookLeft = pad + (spread ? 0 : leafW / 2);
  const spineX = spread ? pad + leafW : bookLeft + (dir === 'next' ? 0 : leafW);

  // s = +1: tờ giấy nằm bên phải gáy và quay sang trái (lật tiếp).
  const s = dir === 'next' ? 1 : -1;

  const cy = canvasH / 2;
  const focal = leafH * PERSPECTIVE;

  const A = Math.PI * progress;
  // Tránh chia cho 0 khi κ → 0 (giấy phẳng).
  const kappa = MAX_CURL * Math.sin(Math.PI * progress) + 1e-4;

  const sinA = Math.sin(A);
  const cosA = Math.cos(A);

  /*
   * Mặt nào của tờ giấy đang hướng về người xem được quyết định THEO TỪNG CỘT,
   * không phải theo cả frame.
   *
   * Vì tờ giấy cong, mỗi cột có góc pháp tuyến ψ riêng. Cột nào đã quay quá 90°
   * thì đã "lật qua" và phải hiện mặt sau, dù các cột gần gáy vẫn còn là mặt
   * trước. Nếu chọn mặt cho cả frame (như bản đầu) thì ở khoảng giữa hành trình
   * sẽ xuất hiện vệt gãy và nội dung bị soi ngược.
   *
   * Cách lấy mẫu ảnh nguồn theo mép gáy:
   *   dir=next : mặt trước là trang phải (gáy ở mép trái → u thuận)
   *              mặt sau  là trang trái  (gáy ở mép phải → u nghịch)
   *   dir=prev : ngược lại.
   */
  const frontMirrored = dir === 'prev';
  const backMirrored = dir === 'next';

  drawLiftShadow(frame, { spineX, s, progress, bookLeft });

  if (!front && !back) return;

  const tilt = ((MAX_TILT_DEG * Math.PI) / 180) * Math.sin(Math.PI * progress) * s;

  ctx.save();
  ctx.translate(spineX, cy);
  ctx.rotate(tilt);
  ctx.translate(-spineX, -cy);

  /*
   * Lưu ý quan trọng về phối cảnh:
   *
   * Không chiếu toạ độ NGANG qua phép chia phối cảnh. Khi tờ giấy nhô về phía
   * người xem (z tăng), phép chia đó đẩy mép ngoài ra XA tâm, khiến mép giấy
   * lùi ngược lại một nhịp ở đầu và cuối cú lật rồi mới quét sang — nhìn như
   * bị "giật". Toạ độ x trên mặt trụ vốn đã đơn điệu sẵn, nên dùng trực tiếp.
   *
   * Phối cảnh chỉ dùng cho chiều CAO, tạo cảm giác trang phồng lên gần mắt.
   */
  const geom = (u: number) => {
    const psi = A + kappa * u;
    const x = spineX + (s * leafW * (Math.sin(psi) - sinA)) / kappa;
    const z = (leafW * (cosA - Math.cos(psi))) / kappa;

    const raw = clamp(focal / (focal - z), 0.62, 1.55);
    const persp = 1 + (raw - 1) * PERSP_DAMP;

    return { psi, x, z, persp };
  };

  // Vẽ từng cột. Cột được nới thêm 1px để không hở đường kẻ giữa các cột.
  for (let i = 0; i < columns; i += 1) {
    const u0 = i / columns;
    const u1 = (i + 1) / columns;

    const g0 = geom(u0);
    const g1 = geom(u1);

    // Dùng thẳng toạ độ ngang trên mặt trụ (xem ghi chú ở geom).
    const left = Math.min(g0.x, g1.x);
    const width = Math.abs(g1.x - g0.x);
    if (width < 0.01) continue;

    const persp = (g0.persp + g1.persp) / 2;
    const h = leafH * persp;
    const top = cy - h / 2;

    const psi = (g0.psi + g1.psi) / 2;

    // Quá 90° = cột này đã lật qua, phải vẽ mặt sau.
    const useBack = psi > Math.PI / 2;
    const face = useBack ? back : front;
    if (!face?.width || !face.height) continue;

    const mirrored = useBack ? backMirrored : frontMirrored;

    // Lấy mẫu cột tương ứng trên ảnh nguồn.
    const su0 = mirrored ? 1 - u1 : u0;
    const su1 = mirrored ? 1 - u0 : u1;
    const sx = su0 * face.width;
    const sw = Math.max((su1 - su0) * face.width, 0.01);

    ctx.drawImage(face.el, sx, 0, sw, face.height, left, top, width + 1, h);

    /*
     * Ánh sáng: cột nào ngoảnh về nguồn sáng thì sáng, ngoảnh đi thì tối.
     * Mặt sau có pháp tuyến ngược nên phải đảo dấu, nếu không nửa sau của
     * cú lật sẽ bị tối sầm không tự nhiên.
     */
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

/**
 * Bóng của tờ giấy đang dựng lên, đổ xuống trang nằm dưới.
 * Bóng đậm nhất khi trang dựng thẳng đứng (progress ≈ 0.5).
 */
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

/** Vệt tối sát gáy sách — chỗ giấy chui vào lòng sách. */
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

/**
 * Góc giấy cuộn lên ở mép ngoài, phía dưới — chi tiết làm cho cú lật
 * trông như giấy thật đang bị bẩy lên chuẩn bị sang trang.
 */
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

  // Tam giác giấy bị gập ở góc dưới mép ngoài.
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

/**
 * Góc giấy hé lên khi người dùng đưa chuột tới góc dưới — gợi ý "kéo để lật".
 * Vẽ trực tiếp lên canvas phủ để dùng chung hệ toạ độ với hiệu ứng lật.
 */
export function drawCornerHint(opts: {
  ctx: CanvasRenderingContext2D;
  canvasW: number;
  canvasH: number;
  pad: number;
  leafW: number;
  leafH: number;
  spread: boolean;
  side: CurlDirection;
  /** 0 → 1 theo mức độ hé mở. */
  amount: number;
}): void {
  const { ctx, canvasW, canvasH, pad, leafW, leafH, spread, side, amount } = opts;

  ctx.clearRect(0, 0, canvasW, canvasH);

  const a = clamp(amount, 0, 1);
  if (a <= 0.01 || leafW <= 0) return;

  const cy = canvasH / 2;
  const bottom = cy + leafH / 2;
  const bookLeft = pad + (spread ? 0 : leafW / 2);

  // Mép ngoài của trang đang được hé.
  const ex = side === 'next' ? bookLeft + (spread ? leafW * 2 : leafW) : bookLeft;
  const s = side === 'next' ? 1 : -1;

  const size = Math.min(leafH * 0.13, 78) * a;
  if (size < 2) return;

  ctx.save();

  // Bóng của góc giấy đổ xuống trang.
  ctx.beginPath();
  ctx.moveTo(ex, bottom);
  ctx.lineTo(ex - s * size * 1.05, bottom);
  ctx.lineTo(ex, bottom - size * 1.05);
  ctx.closePath();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.16 * a})`;
  ctx.filter = 'blur(2px)';
  ctx.fill();
  ctx.filter = 'none';

  // Mặt sau tờ giấy đang cuộn lên.
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
