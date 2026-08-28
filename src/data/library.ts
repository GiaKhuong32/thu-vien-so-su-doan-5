import { assetImage } from './assets';

export type Category = {
  label: string;
  href: string;
};

export type Topic = {
  label: string;
  href: string;
};

export type Author = {
  label: string;
  href: string;
};

export const bookCategories: Category[] = [
  { label: 'Tất cả', href: '/sach/' },
  { label: 'Tài liệu huấn luyện', href: '/sach/tai-lieu-huan-luyen/' },
  { label: 'Tài liệu chính trị', href: '/sach/tai-lieu-chinh-tri/' },
  { label: 'Lịch sử', href: '/sach/lich-su/' },
  { label: 'Văn học', href: '/sach/van-hoc/' },
  { label: 'Khoa học', href: '/sach/khoa-hoc/' },
  { label: 'Ngôn ngữ học', href: '/sach/ngon-ngu-hoc/' },
  { label: 'Phim tài liệu', href: '/sach/phim-tai-lieu/' },
  { label: 'Tài liệu khác', href: '/sach/tai-lieu-khac/' },
];

export const bookTopics: Topic[] = [
  { label: 'Sách số', href: '/sach/?type=ebooks' },
  { label: 'Sách nói', href: '/sach/?type=audiobooks' },
  { label: 'Phim tài liệu', href: '/sach/?type=videobooks' },
];

export const libraryBanner = assetImage('banner/full_sach-0-2023925182051.jpeg');
export const aboutBanner = assetImage('banner/giới thiệu.png');