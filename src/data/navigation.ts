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
    {
      label: 'Tài liệu huấn luyện',
      href: '/sach/tai-lieu-huan-luyen/',
    },
    {
      label: 'Tài liệu chính trị',
      href: '/sach/tai-lieu-chinh-tri/',
    },
    {
      label: 'Lịch sử',
      href: '/sach/lich-su/',
    },
    {
      label: 'Văn học',
      href: '/sach/van-hoc/',
    },
    {
      label: 'Khoa học',
      href: '/sach/khoa-hoc/',
    },
    {
      label: 'Ngôn ngữ học',
      href: '/sach/ngon-ngu-hoc/',
    },
        {
      label: 'Phim tài liệu',
      href: '/sach/phim-tai-lieu/',
    },
    {
      label: 'Tài liệu khác',
      href: '/sach/tai-lieu-khac/',
    },
  ],
},
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
