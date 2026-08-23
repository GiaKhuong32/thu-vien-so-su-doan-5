import { assetImage } from './assets';

export type Category = {
  label: string;
  href: string;
};

export type Topic = {
  label: string;
  href: string;
};

export const bookCategories: Category[] = [
  { label: 'Tất cả', href: '/sach/' },
  { label: 'Lịch sử', href: '/sach/lich-su/' },
  { label: 'Văn học', href: '/sach/van-hoc/' },
  { label: 'Văn hóa', href: '/sach/van-hoa/' },
  { label: 'Nguyễn An Ninh', href: '/sach/nguyen-an-ninh/' },
  { label: 'Sài Gòn - Gia Định - TPHCM', href: '/sach/sai-gon-gia-dinh-tphcm/' },
  { label: 'Nhân vật', href: '/sach/nhan-vat/' },
  { label: 'Hồ Chí Minh', href: '/sach/ho-chi-minh/' },
  { label: 'Phim tài liệu', href: '/sach/phim-tai-lieu/' },
  { label: 'Tạp chí - Báo', href: '/sach/tap-chi-bao/' },
  { label: 'Nghiên cứu địa bạ - khảo cổ', href: '/sach/nghien-cuu-dia-ba-khao-co/' },
  { label: 'Hồi ký', href: '/sach/hoi-ky/' },
];

export const bookTopics: Topic[] = [
  { label: 'Sách số', href: '/sach/?type=ebooks' },
  { label: 'Sách giấy', href: '/sach/?type=paperbooks' },
  { label: 'Sách nói', href: '/sach/?type=audiobooks' },
  { label: 'Phim tài liệu', href: '/sach/?type=videobooks' },
];

export const libraryBanner = assetImage('banner/full_sach-0-2023925182051.jpeg');
