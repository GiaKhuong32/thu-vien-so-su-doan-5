import { bookImage } from './assets';

export type AudioTrack = {
  title: string;
  url: string;
  time: string;
};

export type AudioBook = {
  slug: string;
  img: string;
  tracks: AudioTrack[];
};

export const AUDIO_HOST = 'https://thuviennguyenanninh.vn';

export function audioUrl(path: string) {
  return path.startsWith('http') ? path : `${AUDIO_HOST}${path}`;
}

export const audioBookList: AudioBook[] = [
  {
    slug: 'cung-anh-di-suot-cuoc-doi-phan-10-cung-anh-di-suot-cuoc-doi',
    img: bookImage('test_cung-anh-di-suot-cuoc-doi-phan-10-cung-anh-di-suot-cuoc-doi-2026525181731.jpeg'),
    tracks: [
      {
        title: '10. Cùng Anh Đi Suốt Cuộc Đời.mp3',
        url: '/files/book/test_2025915215429_dzhnhcwy02.mp3',
        time: '09:02',
      },
    ],
  },
  {
    slug: 'cung-anh-di-suot-cuoc-doi-phan-9-tren-dat-khong-minh-va-lao-thai-thai',
    img: bookImage(
      'test_cung-anh-di-suot-cuoc-doi-phan-9-tren-dat-khong-minh-va-lao-thai-thai -2026525181718.jpeg',
    ),
    tracks: [
      {
        title: '09. Trên Đất Khổng Minh và Lão Thái Thái.mp3',
        url: '/files/book/test_2025915215445_rylx7rsqb3.mp3',
        time: '10:53',
      },
    ],
  },
  {
    slug: 'dang-thanh-nien-cao-vong-trong-cao-trao-cac-to-chuc-cach-mang-ra-doi-va-su-xuat-hien-ba-to-chuc-cong-san',
    img: bookImage('test_dang-thanh-nien-cao-vong-trong-cao-trao-cac-to-chuc-cach-mang-ra-doi-va-su-xuat-hien-ba-to-chuc-cong-san-2025916142021.jpeg'),
    tracks: [
      {
        title: '40.4 full_mixdown.mp3',
        url: '/files/book/test_202591522564_86gg0ckc8e.mp3',
        time: '25:57',
      },
    ],
  },
  {
    slug: 'kich-dong-long-yeu-nuoc-truyen-ba-tu-tuong-tien-bo',
    img: bookImage('test_kich-dong-long-yeu-nuoc-truyen-ba-tu-tuong-phap-2025916141427.jpeg'),
    tracks: [
      {
        title: 'kichdonglongyeunuoc.mp3',
        url: '/files/book/test_2025915141416_efipuxwjvp.mp3',
        time: '25:17',
      },
    ],
  },
  {
    slug: 'nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than',
    img: bookImage('nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than-90-202310415566.jpeg'),
    tracks: [
      {
        title: '01. Phóng Sự Hồi Ký Của Nguyễn Ngọc Danh.mp3',
        url: '/files/book/202422211204_0som705iyu.mp3',
        time: '01:10:21',
      },
      {
        title: '02. Nguyễn An Ninh - Một Lãnh Tụ Cách Mạng Hùng.mp3',
        url: '/files/book/202422211206_8ctgsuz5kx.mp3',
        time: '09:11',
      },
      {
        title: '03. Một Số Việc Tôi Biết Về Nguyễn An Ninh.mp3',
        url: '/files/book/202422211206_hsawn31xwr.mp3',
        time: '19:23',
      },
      {
        title: '04. Nguyễn An Ninh Và Phong Trào Đại Hội Đông Dương.mp3',
        url: '/files/book/202422211206_gibmi3p3k4.mp3',
        time: '18:07',
      },
      {
        title: '05. Chí Sĩ Nguyễn An Ninh.mp3',
        url: '/files/book/202422211207_h6c4pp8g1t.mp3',
        time: '09:41',
      },
      {
        title: '06. Vài Ý Kiến Về Ông Nguyễn An Ninh.mp3',
        url: '/files/book/202422211207_otzxw97owm.mp3',
        time: '09:37',
      },
      {
        title: '07. Chú Ninh.mp3',
        url: '/files/book/202422211207_6auyzejkhp.mp3',
        time: '04:26',
      },
      {
        title: '08. “Người Bí Mật”.mp3',
        url: '/files/book/202422211207_1jmh67ljoo.mp3',
        time: '03:19',
      },
      {
        title: '09. Phong Độ Của Nhà Chí Sĩ Nguyễn An Ninh.mp3',
        url: '/files/book/202422211207_j5jv5n4e14.mp3',
        time: '15:37',
      },
    ],
  },
  {
    slug: 'nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935',
    img: bookImage('test_nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935-202511275952.jpeg'),
    tracks: [
      {
        title: 'Nguyễn An Ninh trước thoái trào cách mạng 1931 - 1935.mp3',
        url: '/files/book/test_2025918212345_7pb8o5hsnn.mp3',
        time: '48:00',
      },
    ],
  },
  {
    slug: 'xuat-than-trong-mot-dong-toc-tri-thuc-yeu-nuoc-nhieu-doi-hoat-dong-cach-mang-va-van-tho',
    img: bookImage('test_xuat-than-trong-mot-dong-toc-tri-thuc-yeu-nuoc-nhieu-doi-hoat-dong-cach-mang-va-van-tho-877-2025917194023.jpeg'),
    tracks: [
      {
        title: 'Cuộc đời - Tư Tưởng - Hành Động  (1) (1).mp3',
        url: '/files/book/test_2025917194024_w1w1jdzvl3.mp3',
        time: '00:00',
      },
    ],
  },
];

export const audioBookBySlug: Record<string, AudioBook> = Object.fromEntries(
  audioBookList.map((b) => [b.slug, b]),
);
