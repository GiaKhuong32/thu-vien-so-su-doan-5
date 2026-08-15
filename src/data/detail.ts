import type { BookDetail } from '../components/BookBrief/BookBrief';
import vietNamPhongTucCover from '../assets/books/test_viet-nam-phong-tuc-980-2026525162322.jpeg';

export const sampleBook: BookDetail = {
  title: 'Việt Nam phong tục',
  author: 'Phan Kế Bính',
  img: vietNamPhongTucCover,
  href: '/sach/viet-nam-phong-tuc.html',
  rating: 0,
  format: 'Sách giấy',
  formatHref: '/sach/?type=paperbooks',
  categories: [
    { label: 'Văn hoá nghệ thuật', href: '/sach/?type=ebooks' },
    { label: 'Văn hóa', href: '/sach/?type=ebooks' },
    { label: 'Phong tục', href: '/sach/?type=ebooks' },
  ],
  action: 'Đọc sách',
};

export const sampleCatalog: string[] = [
  'Ký hiệu xếp giá: 390.09597 - V308N - 2014(1)',
  'Vị trí kệ: TT2A_VHH',
  'Số thứ tự: 513',
  'Nhà xuất bản: NXB Nhã Nam',
  'Năm xuất bản: 2014',
  'Mô tả vật lý: 295 trang, khổ 15 x 24, số lượng 1',
  'Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, phong tục, Việt Nam',
];

export const sampleSummary =
  'Sách nghiên cứu toàn diện về phong tục, tập quán của người Việt, từ phong tục trong gia đình, gia tộc, làng xã đến phong tục quốc gia, xã hội.';