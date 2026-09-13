export type DriveSection = 'cloud' | 'recent' | 'favourite' | 'trash';

export type DriveNodeType = 'folder' | 'file';

export type DriveViewMode = 'list' | 'grid';

export type DriveSortKey = 'name' | 'size' | 'type' | 'updatedAt';

export type DriveSortOrder = 'asc' | 'desc';

export type DriveSort = {
  key: DriveSortKey;
  order: DriveSortOrder;
};

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
  parentId: string | null;
  name: string;
  type: DriveNodeType;
  size: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
  favourite: boolean;
  trashed: boolean;
  trashedAt?: string | null;
  openedAt?: string | null;
  previewUrl?: string | null;
  visibility?: 'private' | 'public';
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
