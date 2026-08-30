import { useCallback, useEffect, useRef } from 'react';

/**
 * Tạo tiếng lật trang bằng Web Audio API (noise burst + band-pass sweep).
 * Không cần file âm thanh nên không phát sinh request mạng.
 */
export function useFlipSound(enabled: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;

    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;

    const ctx = new Ctor();
    ctxRef.current = ctx;

    // Tạo buffer nhiễu trắng 0.35s dùng chung cho mọi lần lật
    const length = Math.floor(ctx.sampleRate * 0.35);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const t = i / length;
      // Nhiễu giảm dần, tạo cảm giác giấy cọ vào nhau
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
    }
    bufferRef.current = buffer;

    return ctx;
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;

    const ctx = ensureContext();
    const buffer = bufferRef.current;
    if (!ctx || !buffer) return;

    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);

    const now = ctx.currentTime;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 0.9 + Math.random() * 0.25;

    // Band-pass quét từ cao xuống thấp: mô phỏng tờ giấy trượt qua
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + 0.35);
  }, [enabled, ensureContext]);

  useEffect(
    () => () => {
      ctxRef.current?.close().catch(() => undefined);
      ctxRef.current = null;
    },
    []
  );

  return play;
}

const BOOKMARK_PREFIX = 'flipbook:bookmarks:';

/** Đọc danh sách trang đã đánh dấu từ localStorage. */
export function loadBookmarks(bookKey: string): number[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_PREFIX + bookKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'number') : [];
  } catch {
    return [];
  }
}

/** Lưu danh sách trang đã đánh dấu. */
export function saveBookmarks(bookKey: string, pages: number[]): void {
  try {
    localStorage.setItem(BOOKMARK_PREFIX + bookKey, JSON.stringify(pages));
  } catch {
    /* localStorage bị chặn: bỏ qua */
  }
}