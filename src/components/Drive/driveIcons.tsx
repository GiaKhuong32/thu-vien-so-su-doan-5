import {
  Folder,
  FileText,
  FileImage,
  FileArchive,
  FileAudio,
  FileVideo,
  FileSpreadsheet,
  File as FileIcon,
  type LucideIcon,
} from 'lucide-react';
import type { DriveFileKind, DriveNode } from '../../types/drive';

/** Suy ra "nhóm" tệp tin từ mimeType/đuôi file, dùng để chọn icon phù hợp. */
export function getFileKind(node: DriveNode): DriveFileKind {
  if (node.type === 'folder') return 'folder';
  const mime = node.mimeType ?? '';
  const name = node.name.toLowerCase();

  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.startsWith('video/')) return 'video';
  if (mime === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (/\.(xlsx?|csv)$/.test(name)) return 'sheet';
  if (/\.(pptx?|key)$/.test(name)) return 'slide';
  if (/\.(docx?|rtf|odt)$/.test(name)) return 'doc';
  if (/\.(zip|rar|7z|tar|gz)$/.test(name)) return 'archive';
  if (/\.(txt|md)$/.test(name)) return 'text';
  return 'other';
}

const KIND_ICON: Record<DriveFileKind, LucideIcon> = {
  folder: Folder,
  pdf: FileText,
  doc: FileText,
  sheet: FileSpreadsheet,
  slide: FileText,
  image: FileImage,
  audio: FileAudio,
  video: FileVideo,
  archive: FileArchive,
  text: FileText,
  other: FileIcon,
};

/** Màu icon theo tông thương hiệu (đỏ/vàng đồng) để mỗi loại tệp có sắc riêng nhưng vẫn hài hoà. */
const KIND_COLOR: Record<DriveFileKind, string> = {
  folder: 'var(--drive-gold)',
  pdf: 'var(--drive-accent)',
  doc: '#3a5fb0',
  sheet: '#2f7d4f',
  slide: 'var(--drive-accent)',
  image: 'var(--drive-accent)',
  audio: 'var(--drive-brown)',
  video: 'var(--drive-accent)',
  archive: 'var(--drive-brown)',
  text: 'var(--drive-text-muted)',
  other: 'var(--drive-text-muted)',
};

export function DriveNodeIcon({ node, size = 20 }: { node: DriveNode; size?: number }) {
  const kind = getFileKind(node);
  const Icon = KIND_ICON[kind];
  return <Icon size={size} color={KIND_COLOR[kind]} strokeWidth={1.8} aria-hidden="true" />;
}
