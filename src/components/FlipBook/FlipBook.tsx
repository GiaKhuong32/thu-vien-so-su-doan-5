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
    /** Trang mở đầu (1-based). Bị ghi đè bởi hash #page/N nếu có. */
    initialPage?: number;
    /** Bật đồng bộ số trang vào URL hash (#page/N) như bản gốc. */
    syncHash?: boolean;
    /** Khoá lưu bookmark trong localStorage. Mặc định lấy theo `src`. */
    bookKey?: string;
    className?: string;
  };

const ZOOM_STEPS = [1, 1.25, 1.5, 2, 3];
const MAX_ZOOM = 3;
const MIN_ZOOM = 0.5;

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
  const { numPages, aspect, loading, progress, error, outline } = book;

  /**
   * Tách riêng các hàm của hook ra biến ổn định.
   * `book` đổi identity mỗi lần có trang render xong (revision tăng), nên nếu
   * đưa cả `book` vào dependency của effect thì debounce tìm kiếm sẽ bị reset
   * liên tục và timer nạp thumbnail sẽ bị tạo trùng lặp.
   */
  const { requestPage, requestThumb, searchText } = book;

  /* ------------------------------- Trạng thái ---------------------------- */
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
  const [flip, setFlip] = useState<{
    dir: FlipDirection;
    from: number;
    to: number;
    id: number;
  } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flipTimer = useRef<number | null>(null);
  const flipSeq = useRef(0);

  const playFlip = useFlipSound(soundOn);

  /** Chế độ hai trang chỉ dùng khi khung đủ rộng. */
  const [wide, setWide] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 820
  );
  const spread = viewMode === 'spread' && wide;

  const storageKey = bookKey || src || 'flipbook';

  /* ---- Kích thước trang tính theo khung chứa (đặt ở phần layout bên dưới) ---- */
  const [leafSize, setLeafSize] = useState({ w: 0, h: 0 });

  /* ------------------------------ Giá trị dẫn xuất ----------------------- */

  /**
   * Quy ước dàn trang giống bản gốc: trang 1 là bìa đứng một mình,
   * sau đó ghép cặp (2,3), (4,5)… Nên trang bên trái của một spread
   * luôn là số chẵn.
   */
  const leftPage = useMemo(() => {
    if (!spread) return page;
    if (page <= 1) return 0; // 0 = không có trang (chỗ trống cạnh bìa)
    return page % 2 === 0 ? page : page - 1;
  }, [spread, page]);

  const rightPage = spread ? (leftPage === 0 ? 1 : leftPage + 1) : page;

  const canPrev = page > 1;
  const canNext = numPages > 0 && (spread ? rightPage < numPages : page < numPages);

  /** Bước nhảy khi lật: 2 trang ở chế độ spread (trừ lúc rời bìa). */
  const step = useCallback(
    (dir: FlipDirection) => {
      if (!spread) return 1;
      if (dir === 'next') return leftPage === 0 ? 1 : 2;
      return page <= 2 ? 1 : 2;
    },
    [spread, leftPage, page]
  );

  /* ------------------------------ Điều hướng ----------------------------- */

  const clamp = useCallback(
    (n: number) => Math.min(Math.max(Math.round(n), 1), Math.max(numPages, 1)),
    [numPages]
  );

  /** Helper lấy các trang sẽ hiển thị */
  const getVisiblePages = useCallback(
    (target: number) => {
      const next = clamp(target);

      if (!spread) return [next];

      const left = next <= 1 ? 0 : next % 2 === 0 ? next : next - 1;
      const right = left === 0 ? 1 : left + 1;

      return [left, right].filter((p) => p >= 1 && p <= numPages);
    },
    [clamp, spread, numPages]
  );

  /** Đi tới trang bất kỳ. `animate` = false để nhảy tức thì (slider, mục lục). */
  const goTo = useCallback(
    (target: number, animate = false) => {
      const next = clamp(target);

      // Ưu tiên render ngay các trang sẽ nhìn thấy.
      getVisiblePages(next).forEach((p) => requestPage(p));

      // Nạp thêm vài trang lân cận để quay lại / đọc tiếp không bị trống.
      for (let p = next - 2; p <= next + 2; p += 1) {
        if (p >= 1 && p <= numPages) requestPage(p);
      }

      setPage((current) => {
        if (next === current) return current;

        if (animate) {
          const dir: FlipDirection = next > current ? 'next' : 'prev';
          flipSeq.current += 1;
          setFlip({ dir, from: current, to: next, id: flipSeq.current });
          playFlip();
        }

        return next;
      });
    },
    [clamp, getVisiblePages, numPages, playFlip, requestPage]
  );

  const flipTo = useCallback(
    (dir: FlipDirection) => {
      if (flip) return; // đang lật: bỏ qua để tránh chồng animation

      const delta = step(dir);
      const target = dir === 'next' ? page + delta : page - delta;

      if (target < 1 || target > numPages) return;

      getVisiblePages(target).forEach((p) => requestPage(p));

      flipSeq.current += 1;
      setFlip({ dir, from: page, to: target, id: flipSeq.current });
      playFlip();
      setPage(target);
    },
    [flip, step, page, numPages, playFlip, getVisiblePages, requestPage]
  );

  const goNext = useCallback(() => flipTo('next'), [flipTo]);
  const goPrev = useCallback(() => flipTo('prev'), [flipTo]);
  const goFirst = useCallback(() => goTo(1), [goTo]);
  const goLast = useCallback(() => goTo(numPages), [goTo, numPages]);
  /* ------------------------------ Hiệu ứng phụ --------------------------- */

  /** Dọn animation lật sau khi chạy xong. */
  useEffect(() => {
    if (!flip) return;

    if (flipTimer.current) window.clearTimeout(flipTimer.current);
    flipTimer.current = window.setTimeout(() => setFlip(null), 800);

    return () => {
      if (flipTimer.current) window.clearTimeout(flipTimer.current);
    };
  }, [flip]);

  /** Theo dõi bề rộng khung để tự chuyển giữa 1 và 2 trang. */
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 820);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Đo khung chứa và tính kích thước mỗi trang sao cho sách vừa khít. */
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
      // Giới hạn theo chiều cao
      let h = availH;
      let w = h * aspect;

      // Nếu tràn ngang thì giới hạn lại theo chiều rộng
      if (w * leaves > availW) {
        w = availW / leaves;
        h = w / aspect;
      }

      setLeafSize({ w: Math.floor(w), h: Math.floor(h) });
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [aspect, spread]);

  /** Đọc hash #page/N khi mở và khi người dùng bấm back/forward. */
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

  /** Ghi số trang hiện tại vào hash. */
  useEffect(() => {
    if (!syncHash || numPages === 0) return;

    const desired = `#page/${page}`;
    if (window.location.hash !== desired) {
      window.history.replaceState(null, '', desired);
    }
  }, [page, syncHash, numPages]);

  /** Kẹp lại số trang khi biết tổng số trang. */
  useEffect(() => {
    if (numPages > 0) setPage((cur) => Math.min(Math.max(cur, 1), numPages));
  }, [numPages]);

  /** Render trước các trang quanh vị trí hiện tại để lật không bị trống. */
  useEffect(() => {
    if (numPages === 0) return;

    const visible = getVisiblePages(page);

    // Render trang đang nhìn trước, tránh trường hợp nhảy tới trang cuối bị spinner mãi.
    visible.forEach((p) => requestPage(p));

    const wanted = new Set<number>();
    const from = spread ? leftPage : page;
    const to = spread ? rightPage : page;

    for (let p = from - 4; p <= to + 8; p += 1) {
      if (p >= 1 && p <= numPages) wanted.add(p);
    }

    wanted.add(1);
    wanted.add(numPages);

    // Các trang nền request sau trang visible.
    wanted.forEach((p) => {
      if (!visible.includes(p)) requestPage(p);
    });
  }, [
    page,
    leftPage,
    rightPage,
    spread,
    numPages,
    requestPage,
    getVisiblePages,
  ]);

  /** Bàn phím: mũi tên, Home/End, +/-, F, Esc. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      // Không chiếm phím khi người dùng đang gõ vào input
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, goFirst, goLast, searchOpen, shareOpen, panelOpen, zoom]);

  /** Theo dõi trạng thái fullscreen thật của trình duyệt. */
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /** Nạp bookmark đã lưu. */
  useEffect(() => {
    setBookmarks(loadBookmarks(storageKey));
  }, [storageKey]);

  /** Reset pan khi thu về zoom 1. */
  useEffect(() => {
    if (zoom === 1) setPan({ x: 0, y: 0 });
  }, [zoom]);

  /** Tự ẩn toast. */
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(t);
  }, [toast]);
  /* -------------------------------- Thao tác ----------------------------- */

  /** Nút Zoom chính: xoay vòng qua các mức 1 → 1.5 → 2 → 3 → 1. */
  const cycleZoom = useCallback(() => {
    setZoom((z) => {
      const idx = ZOOM_STEPS.findIndex((s) => s > z + 0.01);
      return idx === -1 ? ZOOM_STEPS[0] : ZOOM_STEPS[idx];
    });
  }, []);

  const zoomIn = useCallback(
    () => setZoom((z) => Math.min(z + 0.5, MAX_ZOOM)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((z) => Math.max(z - 0.5, MIN_ZOOM)),
    []
  );

  function toggleFullscreen() {
    const el = rootRef.current;
    if (!el) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => setFullscreen(false));
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // Trình duyệt chặn: dùng chế độ phủ toàn trang bằng CSS
        setFullscreen(true);
      });
    } else {
      setFullscreen((f) => !f);
    }
  }

  /** In: mở file gốc ở tab mới rồi gọi hộp thoại in của trình duyệt. */
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
        /* PDF viewer nội bộ tự có nút in */
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

  /* ------------------------------- Bookmark ------------------------------ */

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

  /* --------------------------- Kéo (pan) khi zoom ------------------------ */

  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);

  const [panning, setPanning] = useState(false);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;

      dragRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        originX: pan.x,
        originY: pan.y,
        moved: false,
      };
      if (zoom > 1) setPanning(true);
    },
    [pan.x, pan.y, zoom]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag?.active) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.moved = true;

      if (zoom > 1) {
        setPan({ x: drag.originX + dx, y: drag.originY + dy });
      }
    },
    [zoom]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      setPanning(false);

      if (!drag?.active) return;

      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;

      // Quét ngang để lật trang (chỉ khi chưa zoom)
      if (zoom === 1 && Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) goNext();
        else goPrev();
        return;
      }

      // Nhấp vào nửa trái / nửa phải để lật, giống bản gốc
      if (!drag.moved && zoom === 1) {
        const stage = stageRef.current;
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const rel = (e.clientX - rect.left) / rect.width;

        if (rel > 0.55) goNext();
        else if (rel < 0.45) goPrev();
      }
    },
    [zoom, goNext, goPrev]
  );

  /** Con lăn: Ctrl+wheel để zoom, wheel thường để lật trang. */
  const wheelLock = useRef(0);

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn();
        else zoomOut();
        return;
      }

      if (zoom > 1) return; // đang zoom: để người dùng cuộn xem trang

      const now = Date.now();
      if (now - wheelLock.current < 420) return;
      wheelLock.current = now;

      if (e.deltaY > 12) goNext();
      else if (e.deltaY < -12) goPrev();
    },
    [zoom, zoomIn, zoomOut, goNext, goPrev]
  );

  /* -------------------------------- Chia sẻ ------------------------------ */

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

  /* ------------------------------- Tìm kiếm ------------------------------ */

  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    // Chờ transition xong mới focus để không bị giật
    const t = window.setTimeout(() => searchInput.current?.focus(), 120);
    return () => window.clearTimeout(t);
  }, [searchOpen]);

  /** Tìm kiếm có debounce để không quét lại liên tục khi đang gõ. */
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

  /* --------------------------- Ô nhập số trang --------------------------- */

  const [pageInput, setPageInput] = useState(String(page));

  useEffect(() => setPageInput(String(page)), [page]);

  const commitPageInput = useCallback(() => {
    const n = parseInt(pageInput, 10);
    if (Number.isFinite(n)) goTo(n);
    else setPageInput(String(page));
  }, [pageInput, goTo, page]);

  /* --------------------------- Kéo thanh trượt --------------------------- */

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

  /** Nạp thumbnail khi mở bảng thumbnail. */
  useEffect(() => {
    if (!panelOpen || panelTab !== 'thumbnails' || numPages === 0) return;

    // Nạp dần để không nghẽn luồng chính
    let i = 1;
    const tick = () => {
      const end = Math.min(i + 5, numPages + 1);
      for (; i < end; i += 1) requestThumb(i);
      if (i <= numPages) window.setTimeout(tick, 160);
    };
    tick();
  }, [panelOpen, panelTab, numPages, requestThumb]);
  /* --------------------------------- Render ------------------------------ */

  const { w: leafW, h: leafH } = leafSize;
  const ready = leafW > 0 && numPages > 0;

  /** Vẽ một mặt trang. `side` quyết định bóng gáy sách. */
  const renderLeaf = (
    pageNumber: number,
    side: 'left' | 'right' | 'single',
    key: string
  ) => {
    const blank = pageNumber < 1 || pageNumber > numPages;
    const bitmap = blank ? undefined : book.getPage(pageNumber);

    return (
      <div
        key={key}
        className={`fb-leaf fb-leaf--${side}${blank ? ' fb-leaf--blank' : ''}`}
        style={{ width: leafW, height: leafH }}
      >
        {!blank && bitmap && (
          <img
            className="fb-leaf__img"
            src={bitmap.url}
            alt={`Trang ${pageNumber}`}
            draggable={false}
          />
        )}

        {!blank && !bitmap && (
          <div className="fb-leaf__skeleton">
            <div className="fb-leaf__spinner" />
          </div>
        )}

        {!blank && side !== 'single' && (
          <span className="fb-leaf__num">{pageNumber}</span>
        )}
      </div>
    );
  };

  /**
   * Tờ giấy đang lật.
   * - Lật tiếp (next): mặt trước = trang phải hiện tại, mặt sau = trang trái mới.
   * - Lật lui (prev): mặt trước = trang trái hiện tại, mặt sau = trang phải mới.
   */
  const renderFlipper = () => {
    if (!flip || !ready) return null;

    const { dir, from, to } = flip;

    let frontPage: number;
    let backPage: number;

    if (spread) {
      if (dir === 'next') {
        frontPage = from <= 1 ? 1 : from % 2 === 0 ? from + 1 : from;
        backPage = to % 2 === 0 ? to : to - 1;
      } else {
        frontPage = from % 2 === 0 ? from : from - 1;
        backPage = to <= 1 ? 1 : to % 2 === 0 ? to + 1 : to;
      }
    } else {
      frontPage = from;
      backPage = to;
    }

    const single = !spread;
    const leftOffset = single ? 0 : dir === 'next' ? leafW : 0;

    return (
      <>
        <div
          className="fb-underShadow"
          style={{
            width: leafW,
            left: single ? 0 : dir === 'next' ? leafW : 0,
            background:
              dir === 'next'
                ? 'linear-gradient(to right, rgba(0,0,0,.34), rgba(0,0,0,0) 62%)'
                : 'linear-gradient(to left, rgba(0,0,0,.34), rgba(0,0,0,0) 62%)',
          }}
        />

        <div
          key={flip.id}
          className={`fb-flipper fb-flipper--${dir}`}
          style={{ width: leafW, height: leafH, left: leftOffset }}
        >
          <div className="fb-flipper__face fb-flipper__face--front">
            {renderLeaf(
              frontPage,
              single ? 'single' : dir === 'next' ? 'right' : 'left',
              `f-front-${flip.id}`
            )}
            <span className="fb-flipper__gloss" />
          </div>

          <div className="fb-flipper__face fb-flipper__face--back">
            {renderLeaf(
              backPage,
              single ? 'single' : dir === 'next' ? 'left' : 'right',
              `f-back-${flip.id}`
            )}
            <span className="fb-flipper__gloss" />
          </div>
        </div>
      </>
    );
  };

  /**
   * Khi đang lật, hai mặt của tờ giấy đã hiển thị nội dung chuyển tiếp,
   * nên spread nền phải ẩn đúng ô tương ứng để không nhìn thấy trang trùng.
   */
  const hideLeft = flip !== null && (spread ? flip.dir === 'prev' : true);
  const hideRight = flip !== null && (spread ? flip.dir === 'next' : true);

  const sliderRatio =
    numPages > 1 ? ((dragPage ?? page) - 1) / (numPages - 1) : 0;
  const previewPage = dragPage ?? page;
  const uiHidden = zoom > 1;

  return (
    <div
      ref={rootRef}
      className={`fb-root${fullscreen ? ' is-fullscreen' : ''} ${className}`.trim()}
    >
      {/* ------------------------- Thông tin sách ------------------------- */}
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

      {/* -------------------------- Thanh công cụ ------------------------- */}
      <div className={`fb-toolbar${uiHidden ? '' : ''}`}>
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
          onClick={() =>
            setViewMode((m) => (m === 'spread' ? 'single' : 'spread'))
          }
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

      {/* ---------------------------- Sân khấu --------------------------- */}
      <div
        ref={stageRef}
        className={`fb-stage${panning ? ' is-panning' : ''}${
          zoom > 1 ? ' is-zoomed' : ''
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          dragRef.current = null;
          setPanning(false);
        }}
        onWheel={onWheel}
      >
        <div
          className={`fb-viewport${panning ? ' no-anim' : ''}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          <div className="fb-book">
            {ready ? (
              <div className="fb-spread">
                {spread ? (
                  <>
                    <div style={{ opacity: hideLeft ? 0 : 1 }}>
                      {renderLeaf(leftPage, 'left', `L-${leftPage}`)}
                    </div>
                    <div style={{ opacity: hideRight ? 0 : 1 }}>
                      {renderLeaf(rightPage, 'right', `R-${rightPage}`)}
                    </div>
                  </>
                ) : (
                  <div style={{ opacity: flip ? 0 : 1 }}>
                    {renderLeaf(page, 'single', `S-${page}`)}
                  </div>
                )}

                {renderFlipper()}
              </div>
            ) : (
              <div style={{ width: 300, height: 420 }} />
            )}
          </div>
        </div>
      </div>

      {/* ------------------------ Mũi tên hai bên ------------------------ */}
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
                style={{
                  width: 74,
                  aspectRatio: '3 / 4',
                  background: '#efeae1',
                }}
              />
            )}
            <span>Trang {previewPage}</span>
          </div>
        </div>
      </div>

      {/* -------------------- Bảng mục lục / thumbnail ------------------- */}
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
                const thumb = book.getThumb(p);
                const current = spread ? p === leftPage || p === rightPage : p === page;

                return (
                  <button
                    key={p}
                    type="button"
                    className={`fb-thumb${current ? ' is-current' : ''}`}
                    onClick={() => goTo(p)}
                  >
                    {thumb ? (
                      <img className="fb-thumb__img" src={thumb} alt={`Trang ${p}`} />
                    ) : (
                      <span className="fb-thumb__ph" />
                    )}
                    <span className="fb-thumb__num">{p}</span>
                  </button>
                );
              })}
            </div>
          )}

          {panelTab === 'index' && (
            outline.length ? (
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
            )
          )}

          {panelTab === 'bookmarks' && (
            bookmarks.length ? (
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
            )
          )}
        </div>
      </aside>

      {/* ----------------------------- Tìm kiếm ------------------------- */}
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
                  <mark>{hit.excerpt.slice(hit.start, hit.start + hit.length)}</mark>
                  {hit.excerpt.slice(hit.start + hit.length)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ------------------------------ Chia sẻ ------------------------- */}
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

      {/* -------------------------- Nạp / lỗi --------------------------- */}
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
