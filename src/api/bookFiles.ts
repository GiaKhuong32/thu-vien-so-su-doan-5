import { API_BASE_URL } from '../config/api';

export interface BookFile {
  bookFile?: string;
  fileName?: string;
  idFile?: string;
  partFile?: string;
  thumbnail?: string;
  typeFile?: string;
  fileUrl?: string;
  filePath?: string;
}

export async function getDocumentFiles(idDocument?: string): Promise<BookFile[]> {
  if (!idDocument) return [];

  const response = await fetch(`${API_BASE_URL}/files/document/${idDocument}`, {
    method: 'GET',
    headers: { Accept: '*/*' },
  });

  if (!response.ok) return [];

  const data = await response.json();

  return Array.isArray(data?.Result)
    ? data.Result
    : Array.isArray(data?.result)
      ? data.result
      : [];
}

export function normalizeBookFile(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('_', ' ')
    .trim();
}

export function isPdfFile(file: BookFile): boolean {
  const bookFile = normalizeBookFile(file.bookFile);
  const typeFile = (file.typeFile || '').toLowerCase();
  const fileName = (file.fileName || '').toLowerCase();
  const partFile = (file.partFile || '').toLowerCase();
  const fileUrl = (file.fileUrl || '').toLowerCase();
  const filePath = (file.filePath || '').toLowerCase();

  return (
    bookFile.includes('sach so') ||
    typeFile === 'pdf' ||
    fileName.endsWith('.pdf') ||
    partFile.endsWith('.pdf') ||
    fileUrl.endsWith('.pdf') ||
    filePath.endsWith('.pdf')
  );
}

export function isAudioFile(file: BookFile): boolean {
  const bookFile = normalizeBookFile(file.bookFile);
  const typeFile = (file.typeFile || '').toLowerCase();
  const fileName = (file.fileName || '').toLowerCase();
  const partFile = (file.partFile || '').toLowerCase();
  const fileUrl = (file.fileUrl || '').toLowerCase();
  const filePath = (file.filePath || '').toLowerCase();

  return (
    bookFile.includes('sach noi') ||
    typeFile === 'mp3' ||
    typeFile.includes('audio') ||
    fileName.endsWith('.mp3') ||
    fileName.endsWith('.wav') ||
    partFile.endsWith('.mp3') ||
    partFile.endsWith('.wav') ||
    fileUrl.endsWith('.mp3') ||
    fileUrl.endsWith('.wav') ||
    filePath.endsWith('.mp3') ||
    filePath.endsWith('.wav')
  );
}

export function isThumbnailFile(file: BookFile): boolean {
  return normalizeBookFile(file.bookFile).includes('thumbnail');
}

export function findPdfFile(files: BookFile[]): BookFile | undefined {
  return files.find(isPdfFile);
}

export function hasAudioFile(files: BookFile[]): boolean {
  return files.some(isAudioFile);
}

export function getBookFileUrl(file?: BookFile): string | null {
  if (!file) return null;

  return (
    file.partFile ||
    file.fileUrl ||
    file.filePath ||
    (file.idFile ? `${API_BASE_URL}/files/download/${file.idFile}` : null)
  );
}

export function getReadableFormats(files: BookFile[]): string[] {
  const formats: string[] = [];

  if (files.some(isPdfFile)) {
    formats.push('Sách số');
  }

  if (files.some(isAudioFile)) {
    formats.push('Sách nói');
  }

  return formats;
}
