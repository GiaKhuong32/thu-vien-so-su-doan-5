export type DriveSection = 'cloud' | 'recent' | 'favourite' | 'trash';

export type DriveNodeType = 'folder' | 'file';

export type DriveViewMode = 'list' | 'grid';

export type DriveSortKey = 'name' | 'size' | 'type' | 'updatedAt';

export type DriveSortOrder = 'asc' | 'desc';

export type DriveSort = {
  key: DriveSortKey;
  order: DriveSortOrder;
};

/** Nhóm kiểu tệp tin dùng để chọn icon + màu hiển thị. */
export type DriveFileKind =
  | 'folder'
  | 'pdf'
  | 'doc'
  | 'sheet'
  | 'slide'
  | 'image'
  | 'audio'
  | 'video'
  | 'archive'
  | 'text'
  | 'other';

export type DriveNode = {
  id: string;
  /** null = đang nằm ở gốc "Ổ Mây". */
  parentId: string | null;
  name: string;
  type: DriveNodeType;
  /** Byte. Với thư mục là tổng dung lượng các phần tử bên trong. */
  size: number;
  /** MIME type, chỉ có ở tệp tin. */
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  favourite: boolean;
  /** true = đang ở Thùng rác. */
  trashed: boolean;
  /** Thời điểm bị xoá, dùng để hiển thị trong Thùng rác. */
  trashedAt?: string | null;
  /** Mốc thời gian mở gần nhất, dùng cho mục "Gần Đây". */
  openedAt?: string | null;
  /** URL xem trước (ảnh) nếu backend có trả về. */
  previewUrl?: string | null;
};

export type DriveStorage = {
  used: number;
  total: number;
  planName: string;
};

export type DriveBreadcrumb = {
  id: string | null;
  name: string;
};

/** Tệp tin đang được tải lên, dùng để vẽ khay tiến trình. */
export type DriveUploadTask = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
};

export type DriveClipboard = {
  mode: 'copy' | 'cut';
  ids: string[];
} | null;

export type CreateFolderInput = {
  parentId: string | null;
  name: string;
};

export type UploadFileInput = {
  parentId: string | null;
  file: File;
  onProgress?: (percent: number) => void;
};
