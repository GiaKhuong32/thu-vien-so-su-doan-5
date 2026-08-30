export type FlipBookSource = {
  /** URL file PDF. Nếu có, reader sẽ render bằng pdf.js. */
  src?: string;
  /** Danh sách URL ảnh từng trang. Dùng khi backend trả ảnh thay vì PDF. */
  pages?: string[];
};

export type BookMeta = {
  title?: string;
  author?: string;
  category?: string;
  /** URL để tải file gốc. Nếu rỗng, nút Tải xuống bị ẩn. */
  downloadUrl?: string;
  /** Link chia sẻ. Mặc định là URL hiện tại. */
  shareUrl?: string;
  /** Link quay lại trang chi tiết sách. */
  backUrl?: string;
};

/** Một mục trong outline (Index / Mục lục) của PDF. */
export type OutlineItem = {
  title: string;
  page: number | null;
  level: number;
};

/** Một kết quả tìm kiếm văn bản. */
export type SearchHit = {
  page: number;
  /** Đoạn văn bản chứa từ khoá, đã cắt gọn. */
  excerpt: string;
  /** Vị trí từ khoá trong `excerpt` để highlight. */
  start: number;
  length: number;
};

/** Trạng thái render của một trang. */
export type RenderedPage = {
  pageNumber: number;
  url: string;
  width: number;
  height: number;
};

export type PanelTab = 'thumbnails' | 'index' | 'bookmarks';

/** Hướng lật trang. */
export type FlipDirection = 'next' | 'prev';

export type ViewMode = 'spread' | 'single';