import type { CategoryNode, TopicTag } from '../components/Sidebar/Sidebar';
export const bookCategories: CategoryNode[] = [
  { label: 'Địa lý', href: '/sach/dia-ly/' },
  { label: 'Giáo dục', href: '/sach/giao-duc/' },
  {
    label: 'Lịch sử',
    href: '/sach/lich-su/',
    children: [
      { label: 'Sài Gòn - Gia Định - TPHCM', href: '/sach/sai-gon-gia-dinh-tphcm/' },
      { label: 'Nghiên cứu địa bạ - khảo cổ', href: '/sach/nghien-cuu-dia-ba-khao-co/' },
    ],
  },
  { label: 'Ngôn ngữ học', href: '/sach/ngon-ngu-hoc/' },
  {
    label: 'Nhân vật',
    href: '/sach/nhan-vat/',
    children: [
      { label: 'Nguyễn An Ninh', href: '/sach/nguyen-an-ninh/' },
      { label: 'Hồ Chí Minh', href: '/sach/ho-chi-minh/' },
    ],
  },
  { label: 'Tạp chí - Báo', href: '/sach/tap-chi-bao/' },
  {
    label: 'Tín ngưỡng - tôn giáo',
    href: '/sach/tin-nguong-ton-giao/',
    children: [
      { label: 'Tín ngưỡng - Tư tưởng', href: '/sach/tin-nguong-tu-tuong/' },
      { label: 'Tôn giáo', href: '/sach/ton-giao/' },
    ],
  },
  {
    label: 'Văn hoá nghệ thuật',
    href: '/sach/van-hoa-nghe-thuat/',
    children: [
      { label: 'Văn hóa', href: '/sach/van-hoa/' },
      { label: 'Nghệ thuật', href: '/sach/nghe-thuat/' },
    ],
  },
  {
    label: 'Văn học',
    href: '/sach/van-hoc/',
    children: [
      { label: 'Hồi ký', href: '/sach/hoi-ky/' },
      { label: 'Nghiên cứu văn học', href: '/sach/nghien-cuu-van-hoc/' },
    ],
  },
  {
    label: 'Tài liệu khác',
    href: '/sach/tai-lieu-khac/',
    children: [
      { label: 'Kỷ yếu Khoa học', href: '/sach/ky-yeu-khoa-hoc/' },
      { label: 'Đảng bộ - Văn kiện Đảng', href: '/sach/dang-bo-van-kien-dang/' },
    ],
  },
  { label: 'Phim tài liệu', href: '/sach/phim-tai-lieu/' },
  { label: 'Tham quan thực tế ảo VR', href: '/sach/tham-quan-thuc-te-ao-vr/' },
  { label: 'Tranh ảnh', href: '/thu-vien/tranh-anh/' },
  { label: 'Video Nam Bộ Quen Mà Lạ', href: '/thu-vien/video-nam-bo-quen-ma-la/' },
];

export const bookTopics: TopicTag[] = [
  { label: 'Hồ Biểu Chánh', href: '/tags/ho-bieu-chanh.html' },
  { label: 'Tiểu Thuyết', href: '/tags/tieu-thuyet.html' },
  { label: 'Tạ Thu Thâu', href: '/tags/ta-thu-thau.html' },
  { label: 'Nguyễn Thị Minh', href: '/tags/nguyen-thi-minh.html' },
  { label: 'Phỏng vấn', href: '/tags/phong-van.html' },
  { label: 'Tiểu sử', href: '/tags/tieu-su.html' },
  { label: 'Nguyễn An Ninh', href: '/tags/nguyen-an-ninh.html' },
  { label: 'Nguyễn Hữu Thọ', href: '/tags/nguyen-huu-tho.html' },
  { label: 'Tp. Hồ Chí Minh', href: '/tags/tp-ho-chi-minh.html' },
  { label: 'Văn hóa dân gian', href: '/tags/van-hoa-dan-gian.html' },
];

export const libraryBanner = '/assets/banner/full_sach-0-2023925182051.jpeg';
