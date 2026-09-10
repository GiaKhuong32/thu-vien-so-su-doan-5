import type {
  DriveFileKind,
  DriveNode,
  DriveSort,
  DriveSortKey,
} from '../../types/drive';

const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** 0 B · 320 KB · 1.6 MB — cách viết dung lượng giống MEGA. */
export function formatSize(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';

  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit += 1;
  }

  const decimals = unit === 0 ? 0 : value < 10 ? 2 : value < 100 ? 1 : 0;
  return `${value.toFixed(decimals)} ${SIZE_UNITS[unit]}`;
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return `${formatDate(value)} ${date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;
}

export function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

const KIND_BY_EXTENSION: Record<string, DriveFileKind> = {
  pdf: 'pdf',
  doc: 'doc',
  docx: 'doc',
  rtf: 'doc',
  odt: 'doc',
  xls: 'sheet',
  xlsx: 'sheet',
  csv: 'sheet',
  ods: 'sheet',
  ppt: 'slide',
  pptx: 'slide',
  odp: 'slide',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  bmp: 'image',
  svg: 'image',
  heic: 'image',
  mp3: 'audio',
  wav: 'audio',
  flac: 'audio',
  m4a: 'audio',
  ogg: 'audio',
  mp4: 'video',
  mkv: 'video',
  mov: 'video',
  avi: 'video',
  webm: 'video',
  zip: 'archive',
  rar: 'archive',
  '7z': 'archive',
  tar: 'archive',
  gz: 'archive',
  txt: 'text',
  md: 'text',
  json: 'text',
  xml: 'text',
};

export function getFileKind(node: DriveNode): DriveFileKind {
  if (node.type === 'folder') return 'folder';

  const byExt = KIND_BY_EXTENSION[getExtension(node.name)];
  if (byExt) return byExt;

  const mime = node.mimeType || '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf') return 'pdf';
  if (mime.startsWith('text/')) return 'text';

  return 'other';
}

/** Nhãn kiểu tệp tin hiển thị ở cột "Loại" và bảng thông tin. */
export function getKindLabel(node: DriveNode): string {
  if (node.type === 'folder') return 'Thư mục';

  const labels: Record<DriveFileKind, string> = {
    folder: 'Thư mục',
    pdf: 'Tài liệu PDF',
    doc: 'Văn bản Word',
    sheet: 'Bảng tính',
    slide: 'Bản trình bày',
    image: 'Hình ảnh',
    audio: 'Âm thanh',
    video: 'Video',
    archive: 'Tệp nén',
    text: 'Văn bản thuần',
    other: 'Tệp tin',
  };

  const ext = getExtension(node.name);
  const label = labels[getFileKind(node)];

  return ext ? `${label} (.${ext})` : label;
}

/** Bỏ dấu tiếng Việt để tìm kiếm "tai lieu" vẫn khớp "Tài liệu". */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

export function matchesQuery(node: DriveNode, query: string): boolean {
  const q = normalizeText(query);
  if (!q) return true;
  return normalizeText(node.name).includes(q);
}

export const SORT_LABELS: Record<DriveSortKey, string> = {
  name: 'Tên',
  size: 'Dung lượng',
  type: 'Loại',
  updatedAt: 'Ngày sửa đổi',
};

/** Thư mục luôn nằm trên tệp tin, giống hành vi của MEGA. */
export function sortNodes(list: DriveNode[], sort: DriveSort): DriveNode[] {
  const direction = sort.order === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;

    switch (sort.key) {
      case 'size':
        return (a.size - b.size) * direction;
      case 'type':
        return getKindLabel(a).localeCompare(getKindLabel(b), 'vi') * direction;
      case 'updatedAt':
        return (
          (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction
        );
      case 'name':
      default:
        return a.name.localeCompare(b.name, 'vi', { numeric: true }) * direction;
    }
  });
}

/** Tổng dung lượng của một thư mục = tổng các tệp tin bên trong (đệ quy). */
export function computeFolderSize(all: DriveNode[], folderId: string): number {
  const children = all.filter((n) => n.parentId === folderId && !n.trashed);

  return children.reduce((sum, child) => {
    if (child.type === 'file') return sum + child.size;
    return sum + computeFolderSize(all, child.id);
  }, 0);
}

export function countFolderChildren(
  all: DriveNode[],
  folderId: string,
): { folders: number; files: number } {
  const children = all.filter((n) => n.parentId === folderId && !n.trashed);

  return {
    folders: children.filter((c) => c.type === 'folder').length,
    files: children.filter((c) => c.type === 'file').length,
  };
}

/** "3 thư mục, 12 tệp tin" — dòng mô tả dưới bảng thông tin. */
export function describeSelection(nodes: DriveNode[]): string {
  const folders = nodes.filter((n) => n.type === 'folder').length;
  const files = nodes.length - folders;
  const parts: string[] = [];

  if (folders) parts.push(`${folders} thư mục`);
  if (files) parts.push(`${files} tệp tin`);

  return parts.join(', ') || 'Chưa chọn mục nào';
}
