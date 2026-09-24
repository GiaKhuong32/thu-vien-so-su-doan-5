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

function extOf(name: string) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i + 1).toLowerCase() : '';
}

export function getFileKind(node: DriveNode): DriveFileKind {
  if (node.type === 'folder') return 'folder';
  const mime = (node.mimeType ?? '').toLowerCase().trim();
  const name = node.name.toLowerCase();
  const ext = extOf(name);

  const isVideo =
    mime.startsWith('video/') ||
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v', 'mpeg', 'mpg'].includes(mime) ||
    ['mp4', 'webm', 'mkv', 'mov', 'avi', 'm4v', 'mpeg', 'mpg'].includes(ext);

  const isAudio =
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(mime) ||
    ['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext);

  const isImage =
    mime.startsWith('image/') ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(mime) ||
    ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'].includes(ext);

  if (isImage) return 'image';
  if (isAudio) return 'audio';
  if (isVideo) return 'video';
  if (mime === 'application/pdf' || mime === 'pdf' || ext === 'pdf') return 'pdf';
  if (
    mime.includes('spreadsheet') ||
    mime.includes('excel') ||
    ['xls', 'xlsx', 'csv'].includes(mime) ||
    ['xls', 'xlsx', 'csv'].includes(ext)
  ) return 'sheet';
  if (
    mime.includes('word') ||
    mime.includes('officedocument.wordprocessing') ||
    ['doc', 'docx', 'rtf', 'odt'].includes(mime) ||
    ['doc', 'docx', 'rtf', 'odt'].includes(ext)
  ) return 'doc';

  const isSlide =
    mime.includes('presentation') ||
    mime.includes('powerpoint') ||
    ['ppt', 'pptx', 'key'].includes(mime) ||
    ['ppt', 'pptx', 'key'].includes(ext);

  if (isSlide) return 'slide';

  if (
    mime === 'application/zip' ||
    mime === 'application/x-zip-compressed' ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(mime) ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)
  ) return 'archive';
  if (['txt', 'md'].includes(ext)) return 'text';
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