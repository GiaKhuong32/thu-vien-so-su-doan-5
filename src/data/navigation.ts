export type MenuItem = {
  label: string;
  href: string;
  children?: MenuItem[];
};

export const mainMenu: MenuItem[] = [
  { label: 'Trang chủ', href: '/' },
  {
    label: 'Giới thiệu',
    href: '/gioi-thieu/',
    children: [
      {
        label: 'Thư viện số Sư đoàn bộ binh 5',
        href: '/gioi-thieu/thu-vien-so-nguyen-an-ninh-chuyen-de-nam-bo.html',
      },
      { label: 'Lịch sử và truyền thống Sư đoàn 5', href: '/gioi-thieu/quy-hoa-sen.html' },
      { label: 'Chức năng và nhiệm vụ', href: '/gioi-thieu/chinh-sach-su-dung.html' },
    ],
  },
  {
    label: 'Thư viện',
    href: '/sach/',
    children: [
      { label: 'Địa lý', href: '/sach/dia-ly/' },
      { label: 'Giáo dục', href: '/sach/giao-duc/' },
      {
        label: 'Lịch sử',
        href: '/sach/lich-su/',
        children: [
          { label: 'Nghiên cứu địa bạ - khảo cổ', href: '/sach/nghien-cuu-dia-ba-khao-co/' },
          { label: 'Sài Gòn - Gia Định - TPHCM', href: '/sach/sai-gon-gia-dinh-tphcm/' },
        ],
      },
      { label: 'Ngôn ngữ học', href: '/sach/ngon-ngu-hoc/' },
      {
        label: 'Nhân vật',
        href: '/sach/nhan-vat/',
        children: [
          { label: 'Hồ Chí Minh', href: '/sach/ho-chi-minh/' },
          { label: 'Nguyễn An Ninh', href: '/sach/nguyen-an-ninh/' },
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
          { label: 'Đảng bộ - Văn kiện Đảng', href: '/sach/dang-bo-van-kien-dang/' },
          { label: 'Kỷ yếu Khoa học', href: '/sach/ky-yeu-khoa-hoc/' },
        ],
      },
      { label: 'Phim tài liệu', href: '/sach/phim-tai-lieu/' },
      { label: 'Tranh ảnh', href: '/thu-vien/tranh-anh/' },
    ],
  },
  { label: 'Liên hệ', href: '/lien-he.html' },
];

export const footerInfoLinks: MenuItem[] = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Giới thiệu', href: '/gioi-thieu/' },
  { label: 'Thư viện', href: '/sach/' },
  { label: 'Liên hệ', href: '/lien-he.html' },
];

export const footerAboutLinks: MenuItem[] = [
  {
    label: 'Thư viện số Sư đoàn bộ binh 5',
    href: '/gioi-thieu/thu-vien-so-nguyen-an-ninh-chuyen-de-nam-bo.html',
  },
  { label: 'Lịch sử và truyền thống Sư đoàn', href: '/gioi-thieu/quy-hoa-sen.html' },
  { label: 'Chức năng và nhiệm vụ', href: '/gioi-thieu/chinh-sach-su-dung.html' },
];
