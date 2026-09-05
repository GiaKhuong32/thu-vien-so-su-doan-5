import type { Book } from '../components/BookCard';

export type BookAction = {
  label: string;
  kind: 'pdf' | 'paper' | 'audio' | 'video' | 'vr';
  primary: boolean;
  href: string;
};

export type BookDetail = {
  slug: string;
  title: string;
  author: string;
  img: string;
  rating: number;
  formats: string[];
  category?: { label: string; href: string };
  actions: BookAction[];
  catalog: string[];
  summary: string[];
  related: string[];
  idDocument?: string;
  qrCode?: string;
  publishYear?: number;
};

export const FORMAT_HREF: Record<string, string> = {
  'Sách số': '/sach/?type=ebooks',
  'Sách giấy': '/sach/?type=paperbooks',
  'Sách nói': '/sach/?type=audiobooks',
  'Phim tài liệu': '/sach/?type=videobooks',
};

export function toCard(b: BookDetail): Book {
  return {
    title: b.title,
    author: b.author,
    img: b.img,
    href: `/sach/${b.slug}.html`,
    rating: b.rating,
    publishYear: b.publishYear,
  };
}
