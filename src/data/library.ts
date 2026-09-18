import { assetImage } from './assets';

export type Category = {
  label: string;
  href: string;
  count?: number;
};

export type Topic = {
  label: string;
  href: string;
  count?: number;
};

export type Author = {
  label: string;
  href: string;
  count?: number;
};



export const bookTopics: Topic[] = [
  { label: 'Sách số', href: '/sach/?type=ebooks' },
  { label: 'Sách nói', href: '/sach/?type=audiobooks' },
  { label: 'Phim tài liệu', href: '/sach/?type=videobooks' },
];

export const libraryBanner = assetImage('banner/full_sach-0-2023925182051.jpeg');
export const aboutBanner = assetImage('banner/giới thiệu.png');
export const historyBanner = assetImage('skin/bg-about.png');