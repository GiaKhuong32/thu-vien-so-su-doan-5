import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import './FlipBook.css';
import { usePdfBook } from './usePdfBook';
import PageThumbnail from './PageThumbnail';
import PageCanvas from './PageCanvas';
import FlipCanvas from './FlipCanvas';
import type { FlipRequest } from './FlipCanvas';
import { useFlipSound, loadBookmarks, saveBookmarks } from './useFlipSound';
import type {
  BookMeta,
  FlipBookSource,
  FlipDirection,
  PanelTab,
  SearchHit,
  ViewMode,
} from './types';
import {
  IcBack,
  IcBookmark,
  IcBookmarkFill,
  IcClose,
  IcCopy,
  IcDownload,
  IcFirst,
  IcFullscreen,
  IcFullscreenExit,
  IcLast,
  IcNav,
  IcNext,
  IcPrev,
  IcPrint,
  IcSearch,
  IcShare,
  IcSingle,
  IcSoundOff,
  IcSoundOn,
  IcSpread,
  IcZoomIn,
  IcZoomOut,
} from './Icons';

export type FlipBookProps = FlipBookSource &
  BookMeta & {
   
    initialPage?: number;
  
    syncHash?: boolean;

    bookKey?: string;
    className?: string;
  };

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 3];
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;
const FLIP_MS = 820;
const CURL_PAD = 90;
const CORNER_ZONE = 130;

export default function FlipBook({
  src,
  pages,
  title,
  author,
  category,
  downloadUrl,
  shareUrl,
  backUrl,
  initialPage = 1,
  syncHash = true,
  bookKey,
  className = '',
}: FlipBookProps) {
  const book = usePdfBook(src, pages);
  const { numPages, aspect, loading, progress, error, outline, docId } = book;
  const { requestPage, requestThumb, searchText, setTargetWidth, markHot } = book;

  const [page, setPage] = useState(initialPage);
  const [viewMode, setViewMode] = useState<ViewMode>('spread');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreen, setFullscreen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>('thumbnails');
  const [searchOpen, setSearchOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flipSeq = useRef(0);

  const playFlip = useFlipSound(soundOn);

  const [wide, setWide] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 820
  );
  const spread = viewMode === 'spread' && wide;

  const storageKey = bookKey || src || 'flipbook';

  const [leafSize, setLeafSize] = useState({ w: 0, h: 0 });

  const clamp = useCallback(
    (n: number) => Math.min(Math.max(Math.round(n), 1), Math.max(numPages, 1)),
    [numPages]
  );

  const leftOf = useCallback(
    (n: number) => {
      if (!spread) return n;
      if (n <= 1) return 0;
      return n % 2 === 0 ? n : n - 1;
    },
    [spread]
  );

  const rightOf = useCallback(
    (n: number) => {
      if (!spread) return n;
      const left = leftOf(n);
      return left === 0 ? 1 : left + 1;
    },
    [spread, leftOf]
  );

  const leftPage = leftOf(page);
  const rightPage = rightOf(page);


  const coverMode = spread && leftPage === 0;
  const backCoverMode =
    spread && numPages > 1 && leftPage === numPages && rightPage > numPages;

  const canPrev = page > 1;
  const canNext = numPages > 0 && (spread ? rightPage < numPages : page < numPages);

  const step = useCallback(
    (dir: FlipDirection) => {
      if (!spread) return 1;
      if (dir === 'next') return leftPage === 0 ? 1 : 2;
      return page <= 2 ? 1 : 2;
    },
    [spread, leftPage, page]
  );

  const getVisiblePages = useCallback(
    (target: number) => {
      const next = clamp(target);
      if (!spread) return [next];

      return [leftOf(next), rightOf(next)].filter((p) => p >= 1 && p <= numPages);
    },
    [clamp, spread, numPages, leftOf, rightOf]
  );

  const [flip, setFlip] = useState<
    | (FlipRequest & {
        underLeft: number;
        underRight: number;
      })
    | null
  >(null);

  const [drag, setDrag] = useState<{
    dir: FlipDirection;
    progress: number;
    front?: ReturnType<typeof book.getPage>;
    back?: ReturnType<typeof book.getPage>;
    underLeft: number;
    underRight: number;
    target: number;
  } | null>(null);

  const [hint, setHint] = useState<{ side: FlipDirection; amount: number } | null>(
    null
  );

  /** Tính hai mặt của tờ giấy sẽ quay, và hai trang nằm dưới nó. */
  const buildFlipFaces = useCallback(
    (from: number, to: number, dir: FlipDirection) => {
      if (!spread) {
        return {
          frontPage: from,
          backPage: to,
          underLeft: to,
          underRight: to,
        };
      }

      if (dir === 'next') {
        return {
          frontPage: rightOf(from),
          backPage: leftOf(to),
          // Trong lúc lật, nửa trái vẫn là trang cũ, nửa phải đã là trang mới.
          underLeft: leftOf(from),
          underRight: rightOf(to),
        };
      }

      return {
        frontPage: leftOf(from),
        backPage: rightOf(to),
        underLeft: leftOf(to),
        underRight: rightOf(from),
      };
    },
    [spread, leftOf, rightOf]
  );

  const goTo = useCallback(
    (target: number) => {
      const next = clamp(target);
      getVisiblePages(next).forEach((p) => requestPage(p, 100));
      setPage(next);
    },
    [clamp, getVisiblePages, requestPage]
  );

  const startFlip = useCallback(
    (dir: FlipDirection, target: number, from = 0) => {
      const faces = buildFlipFaces(page, target, dir);

      // Cần ảnh của cả hai mặt trước khi quay, nếu không sẽ thấy tờ giấy trắng.
      requestPage(faces.frontPage, 200);
      requestPage(faces.backPage, 200);
      requestPage(faces.underLeft, 150);
      requestPage(faces.underRight, 150);

      flipSeq.current += 1;

      setFlip({
        id: flipSeq.current,
        dir,
        front: book.getPage(faces.frontPage),
        back: book.getPage(faces.backPage),
        underLeft: faces.underLeft,
        underRight: faces.underRight,
        from,
        duration: FLIP_MS,
      });

      playFlip();
      setPage(target);
    },
    [page, buildFlipFaces, requestPage, book, playFlip]
  );

  const flipTo = useCallback(
    (dir: FlipDirection) => {
      if (flip || drag) return;

      const delta = step(dir);
      const target = dir === 'next' ? page + delta : page - delta;
      if (target < 1 || target > numPages) return;

      startFlip(dir, target);
    },
    [flip, drag, step, page, numPages, startFlip]
  );

  const goNext = useCallback(() => flipTo('next'), [flipTo]);
  const goPrev = useCallback(() => flipTo('prev'), [flipTo]);
  const goFirst = useCallback(() => goTo(1), [goTo]);
  const goLast = useCallback(() => goTo(numPages), [goTo, numPages]);

  const onFlipEnd = useCallback((id: number) => {
    setFlip((cur) => (cur && cur.id === id ? null : cur));
  }, []);

  // ---- Đo kích thước trang ------------------------------------------------
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 820);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      const style = getComputedStyle(stage);
      const availW =
        stage.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight);
      const availH =
        stage.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom);

      if (availW <= 0 || availH <= 0) return;
      const leaves = spread ? 2 : 1;

      let h = availH;
      let w = h * aspect;

      if (w * leaves > availW) {
        w = availW / leaves;
        h = w / aspect;
      }

      setLeafSize((cur) => {
        const nw = Math.floor(w);
        const nh = Math.floor(h);
        return cur.w === nw && cur.h === nh ? cur : { w: nw, h: nh };
      });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [aspect, spread]);

  /** Báo cho hook biết cần render trang ở độ nét nào. */
  useEffect(() => {
    if (leafSize.w <= 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    setTargetWidth(leafSize.w * dpr * zoom);
  }, [leafSize.w, zoom, setTargetWidth]);

  // ---- Đồng bộ hash ------------------------------------------------------
  useEffect(() => {
    if (!syncHash) return;

    const readHash = () => {
      const match = /#page\/(\d+)/.exec(window.location.hash);
      if (match) {
        const n = parseInt(match[1], 10);
        if (Number.isFinite(n)) setPage((cur) => (n === cur ? cur : clamp(n)));
      }
    };

    readHash();
    window.addEventListener('hashchange', readHash);
    return () => window.removeEventListener('hashchange', readHash);
  }, [syncHash, clamp]);

  useEffect(() => {
    if (!syncHash || numPages === 0) return;

    const desired = `#page/${page}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired);
    }
  }, [page, syncHash, numPages]);

  useEffect(() => {
    if (numPages > 0) setPage((cur) => Math.min(Math.max(cur, 1), numPages));
  }, [numPages]);

  // ---- Nạp trước ---------------------------------------------------------
  useEffect(() => {
    if (numPages === 0) return;

    const visible = getVisiblePages(page);
    visible.forEach((p) => requestPage(p, 100));

    // Ghim trang đang xem + hai khổ liền kề để không bị dọn khỏi cache.
    markHot([
      ...visible,
      leftPage - 2,
      leftPage - 1,
      rightPage + 1,
      rightPage + 2,
    ].filter((p) => p >= 1 && p <= numPages));

    // Nạp trước theo hướng đọc: phía sau nhiều hơn phía trước.
    const ahead: number[] = [];
    for (let p = rightPage + 1; p <= Math.min(rightPage + 4, numPages); p += 1) {
      ahead.push(p);
    }
    for (let p = leftPage - 1; p >= Math.max(leftPage - 2, 1); p -= 1) {
      ahead.push(p);
    }

    ahead.forEach((p, i) => {
      if (!visible.includes(p)) requestPage(p, -10 - i);
    });
  }, [
    page,
    leftPage,
    rightPage,
    numPages,
    requestPage,
    getVisiblePages,
    markHot,
  ]);

  // ---- Bàn phím ----------------------------------------------------------
  const toggleFullscreen = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => setFullscreen(false));
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => setFullscreen(true));
    } else {
      setFullscreen((f) => !f);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;

      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        if (e.key === 'Escape') target.blur();
        return;
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goNext();
          break;
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          goPrev();
          break;
        case 'Home':
          e.preventDefault();
          goFirst();
          break;
        case 'End':
          e.preventDefault();
          goLast();
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom((z) => Math.min(z + 0.5, MAX_ZOOM));
          break;
        case '-':
        case '_':
          e.preventDefault();
          setZoom((z) => Math.max(z - 0.5, MIN_ZOOM));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (searchOpen) setSearchOpen(false);
          else if (shareOpen) setShareOpen(false);
          else if (panelOpen) setPanelOpen(false);
          else if (zoom > 1) {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    goNext,
    goPrev,
    goFirst,
    goLast,
    searchOpen,
    shareOpen,
    panelOpen,
    zoom,
    toggleFullscreen,
  ]);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => {
    setBookmarks(loadBookmarks(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const cycleZoom = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.findIndex((s) => s > z + 0.01);
      return idx === -1 ? ZOOM_STEPS[0] : ZOOM_STEPS[idx];
    });
  }, []);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.5, MAX_ZOOM)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.5, MIN_ZOOM)), []);

  const handlePrint = useCallback(() => {
    const url = downloadUrl || src;
    if (!url) {
      setToast('Chưa có tệp để in');
      return;
    }

    const win = window.open(url, '_blank', 'noopener,noreferrer');
    if (!win) {
      setToast('Trình duyệt đã chặn cửa sổ in');
      return;
    }
    win.addEventListener('load', () => {
      try {
        win.print();
      } catch {
        /* trình duyệt chặn */
      }
    });
  }, [downloadUrl, src]);

  const handleDownload = useCallback(() => {
    const url = downloadUrl || src;
    if (!url) {
      setToast('Chưa có tệp để tải');
      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'sach').replace(/[\\/:*?"<>|]+/g, '-')}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [downloadUrl, src, title]);

  const isBookmarked = bookmarks.includes(page);

  const toggleBookmark = useCallback(() => {
    setBookmarks((list) => {
      const next = list.includes(page)
        ? list.filter((p) => p !== page)
        : [...list, page].sort((a, b) => a - b);

      saveBookmarks(storageKey, next);
      setToast(
        list.includes(page)
          ? `Đã bỏ đánh dấu trang ${page}`
          : `Đã đánh dấu trang ${page}`
      );
      return next;
    });
  }, [page, storageKey]);

  const removeBookmark = useCallback(
    (target: number) => {
      setBookmarks((list) => {
        const next = list.filter((p) => p !== target);
        saveBookmarks(storageKey, next);
        return next;
      });
    },
    [storageKey]
  );

  const { w: leafW, h: leafH } = leafSize;
  const ready = leafW > 0 && numPages > 0;

  /**
   * Bìa canh giữa khung.
   *
   * Khổ đôi rộng 2 trang và được canh giữa, nên ô bên phải (chứa bìa trước)
   * lệch sang phải nửa trang so với tâm → phải dịch trái nửa trang để bìa
   * nằm đúng giữa. Bìa sau nằm ở ô bên trái nên dịch ngược lại.
   */
  const spreadShift = coverMode ? -leafW / 2 : backCoverMode ? leafW / 2 : 0;

  // ---- Cử chỉ chuột / cảm ứng --------------------------------------------
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
    /** Kéo góc giấy để lật, thay vì kéo để pan. */
    corner: FlipDirection | null;
    target: number;
    faces: {
      frontPage: number;
      backPage: number;
      underLeft: number;
      underRight: number;
    } | null;
  } | null>(null);

  const [panning, setPanning] = useState(false);

  /**
   * Hình học của sách trên màn hình — một nguồn duy nhất cho cả vùng nhận góc
   * giấy và phép quy đổi vị trí con trỏ thành mức lật.
   *
   * Phải suy ra từ đúng `spreadShift` mà phần render đang dùng. Trước đây hai
   * hàm dưới tự tính lại khung sách và bỏ sót chế độ bìa sau, nên vùng bấm lệch
   * nửa trang so với trang đang thấy.
   */
  const bookBox = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || leafW <= 0) return null;

    const rect = stage.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Khổ đôi luôn rộng 2 trang, canh giữa khung rồi dịch ngang spreadShift.
    const spreadLeft = cx - (spread ? leafW : leafW / 2) + spreadShift;

    // Bìa trước nằm ở ô phải, bìa sau ở ô trái; cả hai đứng một mình.
    const alone = !spread || coverMode || backCoverMode;
    const left = coverMode ? spreadLeft + leafW : spreadLeft;
    const right = left + (alone ? leafW : leafW * 2);

    /** Gáy sách — trục quay của tờ giấy đang lật. */
    const spineOf = (dir: FlipDirection) => {
      if (!spread) return dir === 'next' ? left : right;
      if (coverMode) return left; // gáy ở mép trái của bìa trước
      if (backCoverMode) return right; // gáy ở mép phải của bìa sau
      return spreadLeft + leafW;
    };

    return { left, right, bottom: cy + leafH / 2, spineOf };
  }, [leafW, leafH, spread, spreadShift, coverMode, backCoverMode]);

  /** Xác định con trỏ có đang ở vùng góc dưới của trang hay không. */
  const cornerAt = useCallback(
    (clientX: number, clientY: number): FlipDirection | null => {
      if (!ready || zoom > 1) return null;

      const box = bookBox();
      if (!box) return null;

      // Chỉ nhận ở dải sát mép dưới.
      if (clientY < box.bottom - CORNER_ZONE || clientY > box.bottom + 24) return null;

      if (clientX > box.right - CORNER_ZONE && clientX < box.right + 24) {
        return canNext ? 'next' : null;
      }
      if (clientX < box.left + CORNER_ZONE && clientX > box.left - 24) {
        return canPrev ? 'prev' : null;
      }
      return null;
    },
    [ready, zoom, bookBox, canNext, canPrev]
  );

  /** Quy đổi vị trí con trỏ thành mức lật 0 → 1. */
  const progressFromPointer = useCallback(
    (clientX: number, dir: FlipDirection) => {
      const box = bookBox();
      if (!box) return 0;

      // Mép ngoài của tờ giấy đi từ cách gáy 1 trang sang phía đối diện 1 trang.
      const spineX = box.spineOf(dir);
      const travelled =
        dir === 'next' ? spineX + leafW - clientX : clientX - (spineX - leafW);

      return Math.min(Math.max(travelled / (leafW * 2), 0), 1);
    },
    [bookBox, leafW]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (flip) return;

      const corner = cornerAt(e.clientX, e.clientY);

      let faces = null as
        | null
        | { frontPage: number; backPage: number; underLeft: number; underRight: number };
      let target = page;

      if (corner) {
        const delta = step(corner);
        target = corner === 'next' ? page + delta : page - delta;

        if (target < 1 || target > numPages) {
          faces = null;
        } else {
          faces = buildFlipFaces(page, target, corner);
          requestPage(faces.frontPage, 200);
          requestPage(faces.backPage, 200);
          requestPage(faces.underLeft, 150);
          requestPage(faces.underRight, 150);
        }
      }

      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: pan.x,
        originY: pan.y,
        moved: false,
        corner: faces ? corner : null,
        target,
        faces,
      };

      if (zoom > 1) setPanning(true);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [
      flip,
      cornerAt,
      page,
      step,
      numPages,
      buildFlipFaces,
      requestPage,
      pan.x,
      pan.y,
      zoom,
    ]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;

      // Không kéo: chỉ hiện gợi ý góc giấy khi rê chuột tới góc.
      if (!d?.active) {
        if (flip || zoom > 1) {
          if (hint) setHint(null);
          return;
        }

        const side = cornerAt(e.clientX, e.clientY);
        if (side) {
          if (hint?.side !== side) setHint({ side, amount: 1 });
        } else if (hint) {
          setHint(null);
        }
        return;
      }

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) d.moved = true;

      // Kéo góc giấy → lật theo tay.
      if (d.corner && d.faces && zoom === 1) {
        const p = progressFromPointer(e.clientX, d.corner);

        setDrag({
          dir: d.corner,
          progress: p,
          front: book.getPage(d.faces.frontPage),
          back: book.getPage(d.faces.backPage),
          underLeft: d.faces.underLeft,
          underRight: d.faces.underRight,
          target: d.target,
        });
        return;
      }

      if (zoom > 1) setPan({ x: d.originX + dx, y: d.originY + dy });
    },
    [flip, zoom, hint, cornerAt, progressFromPointer, book]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      setPanning(false);

      if (!d?.active) return;

      // Kết thúc cú kéo góc giấy.
      if (d.corner && d.faces) {
        const p = progressFromPointer(e.clientX, d.corner);
        setDrag(null);

        // Kéo quá nửa → lật tiếp cho xong; chưa tới → nhả về chỗ cũ.
        if (p > 0.42) {
          startFlip(d.corner, d.target, p);
        } else if (p > 0.02) {
          flipSeq.current += 1;
          setFlip({
            id: flipSeq.current,
            dir: d.corner === 'next' ? 'prev' : 'next',
            front: book.getPage(d.faces.backPage),
            back: book.getPage(d.faces.frontPage),
            underLeft: leftPage,
            underRight: rightPage,
            from: 1 - p,
            duration: Math.round(FLIP_MS * 0.55),
          });
        }
        return;
      }

      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;

      if (zoom === 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) goNext();
        else goPrev();
        return;
      }

      if (!d.moved && zoom === 1) {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const rel = (e.clientX - rect.left) / rect.width;

        if (rel > 0.55) goNext();
        else if (rel < 0.45) goPrev();
      }
    },
    [
      progressFromPointer,
      startFlip,
      book,
      leftPage,
      rightPage,
      zoom,
      goNext,
      goPrev,
    ]
  );

  const wheelLock = useRef(0);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
        return;
      }

      if (zoom > 1) return;

      const now = Date.now();
      if (now - wheelLock.current < 420) return;
      wheelLock.current = now;

      if (e.deltaY > 12) goNext();
      else if (e.deltaY < -12) goPrev();
    },
    [zoom, zoomIn, zoomOut, goNext, goPrev]
  );

  // ---- Chia sẻ / tìm kiếm / slider ----------------------------------------
  const shareLink = useMemo(() => {
    if (shareUrl) return shareUrl;
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}#page/${page}`;
  }, [shareUrl, page]);

  const [copied, setCopied] = useState(false);

  const copyShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setToast('Không thể sao chép, vui lòng copy thủ công');
    }
  }, [shareLink]);

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    const t = window.setTimeout(() => searchInput.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setSearching(false);
      return;
    }

    let cancelled = false;
    setSearching(true);

    const timer = window.setTimeout(() => {
      searchText(q)
        .then((result) => {
          if (!cancelled) setHits(result);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, searchOpen, searchText]);

  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => setPageInput(String(page)), [page]);

  const commitPageInput = useCallback(() => {
    const n = parseInt(pageInput, 10);
    if (Number.isFinite(n)) goTo(n);
    else setPageInput(String(page));
  }, [pageInput, goTo, page]);

  const trackRef = useRef<HTMLDivElement>(null);
  const [dragPage, setDragPage] = useState<number | null>(null);

  const pageFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || numPages === 0) return 1;

      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
      return clamp(1 + ratio * (numPages - 1));
    },
    [numPages, clamp]
  );

  const onTrackDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      const target = pageFromClientX(e.clientX);
      setDragPage(target);
      requestThumb(target);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pageFromClientX, requestThumb]
  );

  const onTrackMove = useCallback(
    (e: React.PointerEvent) => {
      if (dragPage === null) return;
      e.stopPropagation();
      const target = pageFromClientX(e.clientX);
      setDragPage(target);
      requestThumb(target);
    },
    [dragPage, pageFromClientX, requestThumb]
  );

  const onTrackUp = useCallback(
    (e: React.PointerEvent) => {
      if (dragPage === null) return;
      e.stopPropagation();
      goTo(dragPage);
      setDragPage(null);
    },
    [dragPage, goTo]
  );

  const sliderRatio =
    numPages > 1 ? ((dragPage ?? page) - 1) / (numPages - 1) : 0;
  const previewPage = dragPage ?? page;
  const uiHidden = zoom > 1;

  // ---- Trang nào hiện dưới lớp lật ---------------------------------------
  const active = flip ?? drag;

  const underLeft = active ? active.underLeft : leftPage;
  const underRight = active ? active.underRight : rightPage;

  /**
   * Hai trang nằm dưới luôn được vẽ, kể cả trong lúc lật: tờ giấy đang quay
   * (vẽ trên canvas, z-index cao hơn) chỉ che một nửa khung, nửa còn lại
   * chính là trang mới đang dần lộ ra. Nhờ vậy không còn khoảng trống xám
   * giữa cú lật như bản cũ.
   */
  const renderLeaf = (pageNumber: number, side: 'left' | 'right' | 'single') => {
    if (pageNumber < 1 || pageNumber > numPages) {
      return (
        <div
          className="fb-leaf fb-leaf--void"
          style={{ width: leafW, height: leafH }}
        />
      );
    }

    const drawable = book.getPage(pageNumber);

    return (
      <div
        className={`fb-leaf fb-leaf--${side}`}
        style={{ width: leafW, height: leafH }}
      >
        <PageCanvas
          page={drawable}
          width={leafW}
          height={leafH}
          className="fb-leaf__canvas"
        />

        {!drawable && (
          <div className="fb-leaf__skeleton">
            <div className="fb-leaf__spinner" />
          </div>
        )}

        {side !== 'single' && <span className="fb-leaf__num">{pageNumber}</span>}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`fb-root${fullscreen ? ' is-fullscreen' : ''} ${className}`.trim()}
    >
      <div className={`fb-meta${uiHidden ? ' is-hidden' : ''}`}>
        {title && <h1 className="fb-meta__title">{title}</h1>}
        {author && <h2 className="fb-meta__author">{author}</h2>}
        {category && <p className="fb-meta__cat">{category}</p>}
        {backUrl && (
          <a className="fb-meta__back" href={backUrl}>
            <IcBack />
            Quay lại
          </a>
        )}
      </div>

      <div className={`fb-toolbar${uiHidden ? ' is-hidden' : ''}`}>
        <button
          type="button"
          className={`fb-btn${panelOpen ? ' is-active' : ''}`}
          data-tip="Mục lục"
          aria-label="Mục lục"
          onClick={() => {
            setPanelOpen((o) => !o);
            setSearchOpen(false);
          }}
        >
          <IcNav />
        </button>

        <button
          type="button"
          className="fb-btn"
          data-tip="Trang đầu"
          aria-label="Trang đầu"
          disabled={!canPrev}
          onClick={goFirst}
        >
          <IcFirst />
        </button>

        <button
          type="button"
          className="fb-btn"
          data-tip="Trang trước"
          aria-label="Trang trước"
          disabled={!canPrev}
          onClick={goPrev}
        >
          <IcPrev />
        </button>

        <button
          type="button"
          className="fb-btn"
          data-tip="Trang sau"
          aria-label="Trang sau"
          disabled={!canNext}
          onClick={goNext}
        >
          <IcNext />
        </button>

        <button
          type="button"
          className="fb-btn"
          data-tip="Trang cuối"
          aria-label="Trang cuối"
          disabled={!canNext}
          onClick={goLast}
        >
          <IcLast />
        </button>

        <span className="fb-toolbar__sep" />

        <button
          type="button"
          className={`fb-btn${zoom > 1 ? ' is-active' : ''}`}
          data-tip={`Thu phóng ${zoom.toFixed(1)}x`}
          aria-label="Thu phóng"
          onClick={cycleZoom}
        >
          <IcZoomIn />
        </button>

        <button
          type="button"
          className="fb-btn fb-btn--optional"
          data-tip="Thu nhỏ"
          aria-label="Thu nhỏ"
          disabled={zoom <= MIN_ZOOM}
          onClick={zoomOut}
        >
          <IcZoomOut />
        </button>

        <button
          type="button"
          className="fb-btn fb-btn--optional"
          data-tip={spread ? 'Xem một trang' : 'Xem hai trang'}
          aria-label="Đổi cách xem"
          disabled={!wide}
          onClick={() => setViewMode((m) => (m === 'spread' ? 'single' : 'spread'))}
        >
          {spread ? <IcSingle /> : <IcSpread />}
        </button>

        <button
          type="button"
          className={`fb-btn${searchOpen ? ' is-active' : ''}`}
          data-tip="Tìm trong sách"
          aria-label="Tìm trong sách"
          onClick={() => {
            setSearchOpen((o) => !o);
            setPanelOpen(false);
          }}
        >
          <IcSearch />
        </button>

        <button
          type="button"
          className={`fb-btn${isBookmarked ? ' is-active' : ''}`}
          data-tip={isBookmarked ? 'Bỏ đánh dấu' : 'Đánh dấu trang'}
          aria-label="Đánh dấu trang"
          onClick={toggleBookmark}
        >
          {isBookmarked ? <IcBookmarkFill /> : <IcBookmark />}
        </button>

        <span className="fb-toolbar__sep" />

        <button
          type="button"
          className="fb-btn fb-btn--optional"
          data-tip="Chia sẻ"
          aria-label="Chia sẻ"
          onClick={() => setShareOpen(true)}
        >
          <IcShare />
        </button>

        {(downloadUrl || src) && (
          <button
            type="button"
            className="fb-btn fb-btn--optional"
            data-tip="Tải xuống"
            aria-label="Tải xuống"
            onClick={handleDownload}
          >
            <IcDownload />
          </button>
        )}

        <button
          type="button"
          className="fb-btn fb-btn--optional"
          data-tip="In"
          aria-label="In"
          onClick={handlePrint}
        >
          <IcPrint />
        </button>

        <button
          type="button"
          className="fb-btn fb-btn--optional"
          data-tip={soundOn ? 'Tắt âm lật trang' : 'Bật âm lật trang'}
          aria-label="Âm thanh"
          onClick={() => setSoundOn((s) => !s)}
        >
          {soundOn ? <IcSoundOn /> : <IcSoundOff />}
        </button>

        <button
          type="button"
          className="fb-btn"
          data-tip={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
          aria-label="Toàn màn hình"
          onClick={toggleFullscreen}
        >
          {fullscreen ? <IcFullscreenExit /> : <IcFullscreen />}
        </button>
      </div>

      <div
        ref={stageRef}
        className={`fb-stage${panning ? ' is-panning' : ''}${
          zoom > 1 ? ' is-zoomed' : ''
        }${hint && !active ? ' is-corner' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setHint(null)}
        onPointerCancel={() => {
          dragRef.current = null;
          setPanning(false);
          setDrag(null);
        }}
        onWheel={onWheel}
      >
        <div
          className={`fb-viewport${panning ? ' no-anim' : ''}`}
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <div className="fb-book">
            {ready ? (
              <div
                className={`fb-spread${coverMode ? ' is-cover' : ''}`}
                style={{
                  width: spread ? leafW * 2 : leafW,
                  height: leafH,
                  transform: `translateX(${spreadShift}px)`,
                }}
              >
                {/* Mép giấy dày ở hai bên tạo cảm giác sách thật */}
                <span
                  className="fb-stack fb-stack--left"
                  style={{ opacity: coverMode ? 0 : 1 }}
                />
                <span
                  className="fb-stack fb-stack--right"
                  style={{ opacity: backCoverMode ? 0 : 1 }}
                />

                {spread ? (
                  <>
                    {renderLeaf(underLeft, 'left')}
                    {renderLeaf(underRight, 'right')}
                  </>
                ) : (
                  /*
                   * Xem một trang: trong lúc lật phải hiện trang ĐÍCH nằm dưới,
                   * tờ giấy quay ở trên mang nội dung trang cũ.
                   */
                  renderLeaf(active ? active.underRight : page, 'single')
                )}

                <FlipCanvas
                  leafW={leafW}
                  leafH={leafH}
                  spread={spread}
                  pad={CURL_PAD}
                  request={flip}
                  drag={drag}
                  hint={hint}
                  onFlipEnd={onFlipEnd}
                />
              </div>
            ) : (
              <div style={{ width: 300, height: 420 }} />
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="fb-edge fb-edge--prev"
        aria-label="Trang trước"
        disabled={!canPrev || zoom > 1}
        onClick={goPrev}
      >
        <IcPrev />
      </button>

      <button
        type="button"
        className="fb-edge fb-edge--next"
        aria-label="Trang sau"
        disabled={!canNext || zoom > 1}
        onClick={goNext}
      >
        <IcNext />
      </button>

      <div
        className={`fb-slider${dragPage !== null ? ' is-dragging' : ''}${
          uiHidden ? ' is-hidden' : ''
        }`}
      >
        <div className="fb-pageBox">
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            aria-label="Số trang"
            onChange={(e) => setPageInput(e.target.value.replace(/[^\d]/g, ''))}
            onBlur={commitPageInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitPageInput();
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <span>/ {numPages || '—'}</span>
        </div>

        <div
          ref={trackRef}
          className="fb-slider__track"
          onPointerDown={onTrackDown}
          onPointerMove={onTrackMove}
          onPointerUp={onTrackUp}
        >
          <span className="fb-slider__rail" />
          <span
            className="fb-slider__fill"
            style={{ width: `${sliderRatio * 100}%` }}
          />
          <span
            className="fb-slider__knob"
            style={{ left: `${sliderRatio * 100}%` }}
          />

          <div
            className="fb-slider__preview"
            style={{ left: `${sliderRatio * 100}%` }}
          >
            {book.getThumb(previewPage) ? (
              <img src={book.getThumb(previewPage)} alt="" />
            ) : (
              <div
                style={{ width: 74, aspectRatio: '3 / 4', background: '#efeae1' }}
              />
            )}
            <span>Trang {previewPage}</span>
          </div>
        </div>
      </div>

      <aside className={`fb-panel${panelOpen ? ' is-open' : ''}`}>
        <div className="fb-panel__head">
          <div className="fb-panel__tabs">
            {(
              [
                ['thumbnails', 'Trang'],
                ['index', 'Mục lục'],
                ['bookmarks', 'Đã lưu'],
              ] as [PanelTab, string][]
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`fb-tab${panelTab === id ? ' is-active' : ''}`}
                onClick={() => setPanelTab(id)}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="fb-panel__close"
            aria-label="Đóng"
            onClick={() => setPanelOpen(false)}
          >
            <IcClose />
          </button>
        </div>

        <div className="fb-panel__body">
          {panelTab === 'thumbnails' && (
            <div className="fb-thumbs">
              {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => {
                const current = spread ? p === leftPage || p === rightPage : p === page;

                return (
                  <PageThumbnail
                    key={p}
                    pdf={book.getDoc()}
                    docId={docId}
                    pageNumber={p}
                    current={current}
                    onClick={goTo}
                  />
                );
              })}
            </div>
          )}

          {panelTab === 'index' &&
            (outline.length ? (
              <ul className="fb-list">
                {outline.map((item, i) => (
                  <li key={`${i}-${item.title}`}>
                    <button
                      type="button"
                      className={`fb-list__btn${
                        item.page === page ? ' is-current' : ''
                      }`}
                      style={{ paddingLeft: 9 + item.level * 14 }}
                      disabled={item.page === null}
                      onClick={() => item.page && goTo(item.page)}
                    >
                      <span className="fb-list__label">{item.title}</span>
                      {item.page !== null && (
                        <span className="fb-list__page">{item.page}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fb-panel__empty">
                Tệp này không có mục lục.
                <br />
                Bạn có thể dùng tab “Trang” để xem toàn bộ.
              </p>
            ))}

          {panelTab === 'bookmarks' &&
            (bookmarks.length ? (
              <ul className="fb-list">
                {bookmarks.map((p) => (
                  <li key={p} className="fb-list__row">
                    <button
                      type="button"
                      className={`fb-list__btn${p === page ? ' is-current' : ''}`}
                      onClick={() => goTo(p)}
                    >
                      <IcBookmarkFill />
                      <span className="fb-list__label">Trang {p}</span>
                    </button>
                    <button
                      type="button"
                      className="fb-list__remove"
                      aria-label={`Bỏ đánh dấu trang ${p}`}
                      onClick={() => removeBookmark(p)}
                    >
                      <IcClose />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fb-panel__empty">
                Chưa có trang nào được đánh dấu.
                <br />
                Bấm biểu tượng cờ trên thanh công cụ để lưu trang đang đọc.
              </p>
            ))}
        </div>
      </aside>

      <div className={`fb-search${searchOpen ? ' is-open' : ''}`}>
        <div className="fb-search__bar">
          <IcSearch />
          <input
            ref={searchInput}
            type="text"
            placeholder="Tìm trong sách…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching ? (
            <span className="fb-search__spin" />
          ) : (
            query.trim().length >= 2 && (
              <span className="fb-search__count">{hits.length} kết quả</span>
            )
          )}
          <button
            type="button"
            className="fb-panel__close"
            aria-label="Đóng tìm kiếm"
            onClick={() => setSearchOpen(false)}
          >
            <IcClose />
          </button>
        </div>

        {query.trim().length < 2 ? (
          <p className="fb-search__note">Nhập từ 2 ký tự để bắt đầu tìm.</p>
        ) : searching ? (
          <p className="fb-search__note">Đang quét nội dung…</p>
        ) : hits.length === 0 ? (
          <p className="fb-search__note">Không tìm thấy kết quả phù hợp.</p>
        ) : (
          <ul className="fb-search__results">
            {hits.map((hit, i) => (
              <li key={`${hit.page}-${i}`}>
                <button
                  type="button"
                  className="fb-search__hit"
                  onClick={() => {
                    goTo(hit.page);
                    setSearchOpen(false);
                  }}
                >
                  <span className="fb-search__hitPage">Trang {hit.page}</span>
                  {hit.excerpt.slice(0, hit.start)}
                  <mark>
                    {hit.excerpt.slice(hit.start, hit.start + hit.length)}
                  </mark>
                  {hit.excerpt.slice(hit.start + hit.length)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {shareOpen && (
        <div
          className="fb-modalWrap"
          role="dialog"
          aria-modal="true"
          onClick={() => setShareOpen(false)}
        >
          <div className="fb-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fb-modal__head">
              <h3 className="fb-modal__title">Chia sẻ sách</h3>
              <button
                type="button"
                className="fb-panel__close"
                aria-label="Đóng"
                onClick={() => setShareOpen(false)}
              >
                <IcClose />
              </button>
            </div>

            <div className="fb-modal__row">
              <input readOnly value={shareLink} onFocus={(e) => e.target.select()} />
              <button
                type="button"
                className={`fb-copyBtn${copied ? ' is-done' : ''}`}
                onClick={copyShare}
              >
                <IcCopy />
                {copied ? 'Đã chép' : 'Sao chép'}
              </button>
            </div>

            <p className="fb-modal__hint">
              Liên kết đã gắn sẵn trang bạn đang đọc (trang {page}). Người nhận sẽ mở
              đúng vị trí này.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="fb-overlay">
          <div className="fb-overlay__ring" />
          <p className="fb-overlay__text">Đang tải sách…</p>
          <div className="fb-overlay__bar">
            <div
              className="fb-overlay__barFill"
              style={{ width: `${Math.max(progress * 100, 6)}%` }}
            />
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="fb-overlay">
          <h3 className="fb-overlay__title">Không mở được sách</h3>
          <p className="fb-overlay__text">{error}</p>
          <button
            type="button"
            className="fb-overlay__btn"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && numPages === 0 && !src && !pages?.length && (
        <div className="fb-overlay">
          <h3 className="fb-overlay__title">Chưa có dữ liệu sách</h3>
          <p className="fb-overlay__text">
            Truyền <code>src</code> (URL PDF) hoặc <code>pages</code> (danh sách ảnh)
            vào component để bắt đầu đọc.
          </p>
        </div>
      )}

      {toast && <div className="fb-toast">{toast}</div>}
    </div>
  );
}