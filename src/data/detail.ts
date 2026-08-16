import type { Book } from '../components/BookCard';
import { bookImage } from './assets';

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
};

export const FORMAT_HREF: Record<string, string> = {
  "Sách số": "/sach/?type=ebooks",
  "Sách giấy": "/sach/?type=paperbooks",
  "Sách nói": "/sach/?type=audiobooks",
  "Phim tài liệu": "/sach/?type=videobooks",
};

export const bookDetails: BookDetail[] = [
  {
    slug: "anh-huong-cua-tu-tuong-phan-chau-trinh-den-chi-si-nguyen-an-ninh",
    title: "Ảnh Hưởng Của Tư Tưởng Phan Châu Trinh Đến Chí Sĩ Nguyễn An Ninh",
    author: "TS. Bùi Thị Hà và ThS. Nguyễn Thị Liên",
    img: bookImage('test_anh-huong-cua-tu-tuong-phan-chau-trinh-toi-tri-thuc-nam-ky-qua-truong-hop-nguyen-an-ninh-937-202647203028.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/anh-huong-cua-tu-tuong-phan-chau-trinh-den-chi-si-nguyen-an-ninh/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Chí sĩ Phan Châu Trinh là một trong những người khởi xướng và là nhân vật trọng yếu của phong trào Duy Tân hồi đầu thế kỷ XX. Với tư tưởng đấu tranh bất bạo động khi chưa đủ thực lực, chủ trương “khai dân trí, chấn dân khí, hậu dân sinh” và lối “khẩu xướng vô bằng” kích động nhân tâm. Và tư tưởng đó của ông cũng đã ảnh hưởng đến một bộ phần tri thức Nam Kỳ thời bấy giờ trong đó có người trí thức trẻ tiêu biểu Nguyễn An Ninh.",
      "Tiếp bước cụ Phan Châu Trinh, người trí thức trẻ Nam Kỳ Nguyễn An Ninh khi trở về nước hoạt động,đã hô hào chấm dứt chế độ quân chủ, công kích Nho giáo - nền tảng tư tưởng của chế độ này. Trong bài diễn thuyết thứ hai vào ngày 15-10-1923, Nguyễn An Ninh “là nhà Tây học đầu tiên đã dấm Không giáo mấy quả đấm kinh hồn\" khi chỉ ra những quan điểm hẹp hòi, bó buộc của Khổng giáo, cho rằng Nho giáo đã được truyền sang nước ta dưới dạng thức như một món hàng xuất khẩu; đồng thời chỉ ra sự lỗi thời của đạo Nho: “Cái gọi là giới tỉnh hoa Nho học đã được đào tạo theo sách vở Tàu đã chẳng có bám vào đạo Khổng như những con người chết đuối có bám vào khúc gỗ mục đó sao\". Đối với chế độ quân chủ chuyên chế, Nguyễn An Ninh dứt khoát tuyên bố “Chúng tôi muốn loại bỏ tận gốc cái triều đình An Nam thối nát đang dùng làm bình phong cho những người có trách nhiệm của chế độ dã man mà người An Nam ở Trung Kỳ đang phải chịu đau khổ\"...",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "chan-lap-phong-tho-ky",
    title: "Chân Lạp phong thổ ký",
    author: "Châu Đạt Quan (Lê Hương dịch)",
    img: bookImage('test_chan-lap-phong-tho-ky-844-2025912211216.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/chan-lap-phong-tho-ky/PDF.html" },
    ],
    catalog: [
      "Năm xuất bản: 1973",
      "Mô tả vật lý: 175 trang",
    ],
    summary: [
      "Quyền sách duy nhất mô tả vùng Angkor, để đô nước Cao Miên ngày xưa giữa thời cực thịnh là tập ký ức «Chân Lạp Phong Thổ Ký» của ông Châu-Đạt-Quan.Đối với các nhà khảo cồ, tập ký ức của họ Châu là một tài liệu vô cùng quý giá đề tìm hiều về Cao-Miên, một quốc gia không có đề lại lịch sử trên giấy mực, còn đối với người Miên thì chính họ phải nhờ nhĩừng dòng chữ vàng ngọc kia đề biết tồ-tiên họ trong khoảng thời gian ấy.",
      "Thư viện xin được cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "chanh-tri-nguyen-an-ninh",
    title: "Chánh trị - Nguyễn An Ninh",
    author: "Vân Đẩu",
    img: bookImage('test_chanh-tri-nguyen-an-ninh-861-2025912233326.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/chanh-tri-nguyen-an-ninh/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Quyền sách nầy viết ra đễ hưởng ứng cuộc Toàn-xả bên chánh-quốc nước Pháp sắp ban hành qua thuộc địa. Nó có thể dùng làm tài-liệu nghiên cứu về vấn-đề chánh-trị ở Đông-dương và có thề chĩ rỏ những cái tội của anh chị em chánh-trị coi nhà cầm quyền dáng tha hay dáng cầm tù những người có chức vụ ấy.",
      "Tủ chánh-trị có phải là những kẻ trộm cướp hay là những tội thưởng-nhân không? Họ là những người thợ, những người trí thức deo duỗi một cao-vọng tự do độc lập, những tù chánh-trị, theo lời ông Moutet đả nói, dầu nhà cầm quyền có thể lên án những sự bạo - động họ đã dùng đề đi tới mục-dích đó, dầu nhà cầm quyền có thể trừng trị họ cách nào đi nữa thì đó là những tư tưởng khoan-hồng cao-thượng mà thôi.",
      "(Trích lời nói đầu)",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho thư viện phục vụ bạn đọc!",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "chuyen-khao-ve-tinh-sa-dec",
    title: "Chuyên khảo về tỉnh Sa Đéc",
    author: "Hội nghiên cứu Đông Dương",
    img: bookImage('test_chuyen-khao-ve-tinh-sa-dec-983-2026525164552.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Địa lý", href: "/sach/dia-ly/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 915.9789 - NH556N - 2016(1)",
      "Vị trí kệ: TT3B_ĐLH",
      "Số thứ tự: 324",
      "Nhà xuất bản: NXB Trẻ",
      "Năm xuất bản: 2016",
      "Mô tả vật lý: 45 trang, khổ 15,5 x 23, số lượng 1",
      "Thể loại/ chủ đề: Địa lý, Sa Đéc, chuyên khảo",
    ],
    summary: [
      "Tập chuyên khảo giới thiệu Sa Đéc đầu thế kỷ XX qua hệ thống tư liệu về địa lý tự nhiên, kinh tế, lịch sử và hành chánh. Nội dung bao gồm mô tả đường sông, rạch, khí hậu, phong cảnh; hoạt động nông nghiệp và chăn nuôi; các đặc điểm lịch sử – chính trị; cùng thống kê về tín ngưỡng và tổ chức hành chánh. Cấu trúc rõ ràng giúp người đọc hình dung diện mạo một tỉnh Nam Kỳ xưa trong quá trình hình thành và phát triển, đồng thời cung cấp tư liệu giá trị cho việc nghiên cứu vùng Đồng bằng sông Cửu Long.",
    ],
    related: [],
  },
  {
    slug: "cung-anh-di-suot-cuoc-doi-phan-10-cung-anh-di-suot-cuoc-doi",
    title: "Cùng anh đi suốt cuộc đời (Phần 10: Cùng anh đi suốt cuộc đời)",
    author: "Trương Thị Sáu",
    img: bookImage('test_cung-anh-di-suot-cuoc-doi-phan-10-cung-anh-di-suot-cuoc-doi-2026525181731.jpeg'),
    rating: 0,
    formats: ["Sách nói"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/cung-anh-di-suot-cuoc-doi-phan-10-cung-anh-di-suot-cuoc-doi/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Cùng anh đi suốt cuộc đời (Phần 10: Cùng anh đi suốt cuộc đời)",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "cung-anh-di-suot-cuoc-doi-phan-9-tren-dat-khong-minh-va-lao-thai-thai",
    title: "Cùng anh đi suốt cuộc đời (Phần 9: Trên đất Khổng Minh và Lão thái thái )",
    author: "Trương Thị Sáu",
    img: bookImage('test_cung-anh-di-suot-cuoc-doi-phan-9-tren-dat-khong-minh-va-lao-thai-thai -2026525181718.jpeg'),
    rating: 0,
    formats: ["Sách nói"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/cung-anh-di-suot-cuoc-doi-phan-9-tren-dat-khong-minh-va-lao-thai-thai&#xA0;/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Cùng anh đi suốt cuộc đời (Phần 9: Trên đất Khổng Minh và Lão thái thái )",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "dang-thanh-nien-cao-vong-trong-cao-trao-cac-to-chuc-cach-mang-ra-doi-va-su-xuat-hien-ba-to-chuc-cong-san",
    title: "Đảng thanh niên cao vọng trong cao trào các tổ chức cách mạng ra đời và sự xuất hiện ba tổ chức cộng sản",
    author: "Nguyễn An Tịnh",
    img: bookImage('test_dang-thanh-nien-cao-vong-trong-cao-trao-cac-to-chuc-cach-mang-ra-doi-va-su-xuat-hien-ba-to-chuc-cong-san-2025916142021.jpeg'),
    rating: 0,
    formats: ["Sách nói"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/dang-thanh-nien-cao-vong-trong-cao-trao-cac-to-chuc-cach-mang-ra-doi-va-su-xuat-hien-ba-to-chuc-cong-san/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Đảng thanh niên cao vọng trong cao trào các tổ chức cách mạng ra đời và sự xuất hiện ba tổ chức cộng sản. Sự ra đời một Đảng Cộng Sản Việt Nam thống nhất rồi đổi tên thành ĐCS Đông Dương",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su",
    title: "Di tích khảo cổ và dấu ấn Gốm Sài Gòn trong dòng chảy lịch sử",
    author: "TS. Nguyễn Thị Hậu",
    img: bookImage('test_di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su-418-2025524204612.jpeg'),
    rating: 0,
    formats: ["Phim tài liệu"],
    category: { label: "Phim tài liệu", href: "/sach/phim-tai-lieu/" },
    actions: [
      { label: "Video", kind: "video", primary: false, href: "/sach/di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su/Video.html" },
    ],
    catalog: [],
    summary: [
      "Gốm Sài Gòn không chỉ là sản phẩm của kỹ thuật chế tác thủ công mà còn là minh chứng sống động cho sự giao thoa giữa quá khứ và hiện tại. Những họa tiết cổ xưa được \"hồi sinh\" và phát triển thành các đường nét mới, hiện đại, thể hiện tư duy thẩm mỹ tinh tế của nghệ nhân đương thời. Từ những nét vẽ phủ kín khắp thân bình, ta cảm nhận được sự hòa quyện đồng điệu, nơi cái đẹp không nằm ở sự phô trương mà ở cách bố cục đầy tiết chế và duyên dáng.",
      "TS. Nguyễn Thị Hậu chia sẻ: “Mỗi tác phẩm gốm là một câu chuyện – được kể bằng đường nét, màu men, họa tiết – phản ánh khát vọng vươn tới cái đẹp và cái thiện của con người. Từ hình ảnh phong cảnh, hoa lá, thú vật mang những ý nghĩa cát tường, tất cả đều được chọn lọc và thể hiện bằng tâm ý sâu sắc”.",
      "Qua mỗi hiện vật, ta không chỉ thấy được một sản phẩm mỹ nghệ, mà còn là cả một kho tàng di sản đang đợi được nhìn nhận, trân trọng và phát huy.",
    ],
    related: ["le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long", "dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu", "gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi", "gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai"],
  },
  {
    slug: "di-tich-lich-su-khu-luu-niem-luat-su-nguyen-huu-tho",
    title: "Di tích lịch sử: Khu lưu niệm Luật sư Nguyễn Hữu Thọ",
    author: "",
    img: bookImage('di-tich-lich-su-khu-luu-niem-luat-su-nguyen-huu-tho-254-202422181518.jpeg'),
    rating: 0,
    formats: [],
    category: { label: "Tham quan thực tế ảo VR", href: "/sach/tham-quan-thuc-te-ao-vr/" },
    actions: [
      { label: "Xem VR", kind: "vr", primary: false, href: "" },
    ],
    catalog: [
      "Tour tham quan gồm hai nhà lưu niệm: Nhà lưu niệm Luật sư Nguyễn Hữu Thọ tại Long An và Phòng trưng bày tại nhà riêng",
      "Di tích là nơi lưu niệm Luật sư Nguyễn Hữu Thọ (10/7/1910-24/12/1996), nguyên quyền Chủ tịch nước, Chủ tịch Quốc hội, Chủ tịch Ðoàn Chủ tịch Ủy ban Trung ương Mặt trận Tổ quốc Việt Nam; nguyên Chủ tịch Ủy ban Trung ương Mặt trận Dân tộc giải phóng miền Nam Việt Nam, Chủ tịch Hội đồng cố vấn Chính phủ cách mạng lâm thời cộng hòa miền Nam Việt Nam… một nhà hoạt động chính trị - xã hội có uy tín và tài năng; người chiến sĩ cộng sản kiên định, tận trung với nước, tận hiếu với dân. Di tích gồm ngôi nhà thời niên thiếu của Luật Sư Nguyễn Hữu Thọ và Khu tưởng niệm.",
      "Ngôi nhà tọa lạc tại số 10/3, 11/3, 12/3, 13/3 đường Huỳnh Châu Sổ, hẻm 3, khu phố 1, thị trấn Bến Lức, phía sau đình thần Long Phú. Nhà được xây cất theo kiểu xuyên trính, ba gian hai chái, kết cấu khung sườn bằng gỗ, cột tròn đặt trên tán đá xanh. Mái nhà được lợp bằng ngói âm dương, nền lát gạch tàu màu đỏ, vách ván bổ kho[1]. Bên trong nhà bố cục theo kiểu “ngoại khách nội tự”, gian thờ cúng và gian tiếp khách phía trước, gian buồng phía sau, được phân biệt với nhau bằng tấm vách lụa[2]. Phía sau nhà có khoảng sân rộng trồng các loại cây ăn trái như xoài, lê ki ma, chuối già… ở góc sân có hòn non bộ. Phía sau khoảng sân là nhà bếp khá rộng. Cách bố trí vật dụng sinh hoạt trong nhà được tuân thủ theo phong cách nhà truyền thống Nam bộ.",
      "Ngoài các hiện vật cùng thời như tủ thờ, tủ áo, bàn ghế… hiện ngôi nhà vẫn còn lưu giữ được tấm hoành phi “Trung hiếu” và một họa tiết trang trí vốn là hiện vật gốc rất có giá trị. Ngôi nhà thời niên thiếu là một trong những điểm di tích quan trọng, gắn liền với thời thơ ấu của Luật sư Nguyễn Hữu Thọ nên đã được Sở Văn hóa, Thể thao và Du lịch Long An tiến hành hoàn thiện hồ sơ phục hồi.",
      "Điểm di tích thứ hai là Khu lưu niệm Luật sư Nguyễn Hữu Thọ, đây là công trình tôn tạo có diện tích 10.000m2, gồm các hạng mục như nhà tưởng niệm, khối phòng họp - khu trưng bày - thư viện, khu công viên cây xanh, thảm cỏ, nơi trồng cây lưu niệm và các hạng mục phụ trợ khác. …",
      "Đền tưởng niệm là nơi thể hiện lòng tôn kính, tưởng nhớ đến Luật sư Nguyễn Hữu Thọ. Không gian được thiết kế mang đậm bản sắc văn hóa phương Nam, toát lên sự tôn nghiêm với những màu thâm trầm làm chủ đạo như nâu, vàng kem, màu gỗ và màu của những bức sơn mài, hoành phi câu đối được sơn son thiếp vàng. Tượng Luật sư Nguyễn Hữu Thọ với chất liệu đồng được đặt trang trọng ở vị trí trung tâm trong đền cùng với hai bàn thờ được chạm trổ công phu.",
      "Không gian trưng bày tại Khu lưu niệm gồm có hai phần: phần một giới thiệu sơ lược về tỉnh Long An, Thành phố Tân An; phần hai giới thiệu về huyện Bến Lức xưa – quê hương Luật sư Nguễn Hữu Thọ. Với những hiện vật, hình ảnh tư liệu, bản đồ, tranh, mô hình, biểu bảng… một không gian về Tân An, Bến Lức xưa được tái hiện một cách sinh động. Khách tham quan sẽ có trải nghiệm thú vị và biết thêm một Bến Lức những năm 60 - 70 của thế kỷ 20 cũng như những địa điểm gắn liền với tuổi thơ Luật sư Nguyễn Hữu Thọ như dòng sông An Thạnh, ngôi nhà Luật sư sống lúc nhỏ, khu mộ song thân và ông bà nội Luật sư….",
      "Với những giá trị lịch sử, văn hóa tiêu biểu trên, di tích Khu lưu niệm Luật sư Nguyễn Hữu Thọ được Bộ Văn hóa, Thể thao và Du lịch xếp hạng là di tích lịch sử theo Quyết định số 2244/QĐ-BVHTTDL ngày 29/6/2015",
    ],
    summary: [],
    related: [],
  },
  {
    slug: "dia-chi-van-hoa-thanh-pho-ho-chi-minh-tap-3-nghe-thuat-phan-1",
    title: "Địa Chí Văn Hóa Thành Phố Hồ Chí Minh Tập 3: Nghệ Thuật (Phần 1)",
    author: "Hội đồng KHXH TP.HCM",
    img: bookImage('test_dia-chi-van-hoa-thanh-pho-ho-chi-minh-tap-3-nghe-thuat-phan-1-2025725155742.jpeg'),
    rating: 0,
    formats: ["Sách giấy", "Sách số"],
    category: { label: "Sài Gòn - Gia Định - TPHCM", href: "/sach/sai-gon-gia-dinh-tphcm/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/dia-chi-van-hoa-thanh-pho-ho-chi-minh-tap-3-nghe-thuat-phan-1/PDF.html" },
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 959.779 - Đ301CH - 2018(1)- Vị trí kệ: TT2B_HCM- Số thứ tự: 398- Nhà xuất bản: NXB Tổng hợp TPHCM- Năm xuất bản: 2018- Mô tả vật lý: 653 trang, khổ 19 x 27, số lượng 1- Thể loại/ chủ đề: Địa lý, nghệ thuật, Địa chí TPHCM",
    ],
    summary: [
      "Có thể nói đây là bộ Địa chí Văn hóa đầu tiên trong lịch sử Sài Gòn - Thành phố Hồ Chí Minh, được Hội đồng Khoa học Xã hội Thành phố chỉ đạo biên soạn một cách nghiêm túc, khái quát đầy đủ và có hệ thống diện mạo văn hóa của Thành phố qua ba thế kỷ hình thành và phát triển.",
      "Sau khi ra đời, bộ sách được giới nghiên cứu khoa học và bạn đọc hoan nghênh, đánh giá cao và nhiệt tình đóng góp nhiều ý kiến và phát triển.",
    ],
    related: [],
  },
  {
    slug: "dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu",
    title: "Điều gì khiến nhiều bạn trẻ Gen Z tìm về làng gốm Lái Thiêu?",
    author: "VTV24",
    img: bookImage('test_dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu-421-2025527235756.jpeg'),
    rating: 0,
    formats: ["Phim tài liệu"],
    category: { label: "Phim tài liệu", href: "/sach/phim-tai-lieu/" },
    actions: [
      { label: "Video", kind: "video", primary: false, href: "/sach/dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu/Video.html" },
    ],
    catalog: [],
    summary: [
      "Bình Dương được thiên nhiên ưu đãi có nguồn khoáng sản đất sét và cao lanh rất phù hợp cho nghề làm gốm. Trong những làng gốm ở Bình Dương thì làng gốm Lái Thiêu đã nổi danh trong và ngoài nước bởi sự mộc mạc nhưng không kém phần tinh tế và đậm chất Nam bộ.",
    ],
    related: ["le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long", "gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi", "gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai", "di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su"],
  },
  {
    slug: "dong-dao-va-tro-choi-truyen-thong",
    title: "Đồng dao và trò chơi truyền thống",
    author: "Huỳnh Ngọc Trảng",
    img: bookImage('test_dong-dao-va-tro-choi-truyen-thong-976-202652516316.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 398.809597 - Đ455D - 2019(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 409",
      "Nhà xuất bản: NXB Tổng hợp TPHCM",
      "Năm xuất bản: 2019",
      "Mô tả vật lý: 523 trang, khổ 16x24, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, văn hóa dân gian",
    ],
    summary: [
      "Sách tập hợp bài đồng dao, trò chơi dân gian Việt Nam, phân tích giá trị văn hóa, kết nối cộng đồng, giúp người đọc khám phá nét đẹp tuổi thơ qua những trò chơi truyền thống.",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "viet-nam-phong-tuc", "than-dat-ong-dia-than-tai", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo"],
  },
  {
    slug: "duc-giao-tong-phan-van-tong-mot-tam-guong-tot-doi-dep-dao",
    title: "Đức Giáo Tông Phan Văn Tòng: Một Tấm Gương Tốt Đời, Đẹp Đạo",
    author: "Nhiều tác giả",
    img: bookImage('test_duc-giao-tong-phan-van-tong-mot-tam-guong-tot-doi-dep-dao-982-2026525163956.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Nhân vật", href: "/sach/nhan-vat/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 299.592 - Đ552GI - 2020(1)- Vị trí kệ: TT7A_TS- Số thứ tự: 350- Nhà xuất bản: NXB Tổng hợp TPHCM- Năm xuất bản: 2020- Mô tả vật lý: 488 trang, khổ 16 x 24, số lượng 1- Thể loại/ chủ đề: Nhân vật, Phan Văn Tòng, Đức Giáo tông, cuộc đời, sự nghiệp cách mạng, tôn giáo",
    ],
    summary: [
      "Sách là kỷ yếu toạ đàm do Ban Tuyên giáo Tỉnh uỷ Vĩnh Long chủ trì, tập hợp các bài viết về Đức Giáo tông Phan Văn Tòng, người sáng lập Hội thánh Cao Đài Tiên Thiên. Sách khái quát thân thế, sự nghiệp cách mạng và hoạt động tôn giáo của ông. Nội dung làm rõ cống hiến của Đức Giáo tông đối với phong trào yêu nước, cách mạng và sự phát triển của Hội thánh. Đây là minh chứng về một nhân sĩ yêu nước, liệt sĩ, và chức sắc tôn giáo có uy tín, đã sống trọn vẹn tinh thần \"tốt đời đẹp đạo\".",
    ],
    related: ["thu-tuong-vo-van-kiet-chan-dung-mot-con-nguoi"],
  },
  {
    slug: "gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam",
    title: "Giá trị tinh thần truyền thống của dân tộc Việt Nam",
    author: "GS. Trần Văn Giàu",
    img: bookImage('test_gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam-973-2026517113044.jpeg'),
    rating: 0,
    formats: ["Sách giấy", "Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam/PDF.html" },
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 305.89592 - GI100TR - 1993(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 513",
      "Nhà xuất bản: NXB TPHCM",
      "Năm xuất bản: 1993",
      "Mô tả vật lý: 356 trang, khổ 13x19, số lượng 1",
      "Thể loại/ chủ đề: Việt Nam, văn minh",
    ],
    summary: [
      "Sách phân tích các giá trị cốt lõi như yêu nước, cần cù, anh hùng, sáng tạo, lạc quan, thương người, vì nghĩa, từ góc độ sử học, triết học, đạo đức học.",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "viet-nam-phong-tuc", "than-dat-ong-dia-than-tai", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo"],
  },
  {
    slug: "gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai",
    title: "Gốm Lái Thiêu trong dòng chảy xã hội đương đại",
    author: "Nhà sưu tập Nguyễn Hữu Phúc",
    img: bookImage('test_gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai-419-2025526231910.jpeg'),
    rating: 0,
    formats: ["Phim tài liệu"],
    category: { label: "Phim tài liệu", href: "/sach/phim-tai-lieu/" },
    actions: [
      { label: "Video", kind: "video", primary: false, href: "/sach/gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai/Video.html" },
    ],
    catalog: [],
    summary: [
      "Từ những món đồ gia dụng thường thấy của người dân Nam Bộ, gốm Lái Thiêu nay đã trở thành nơi gửi gắm những ẩn dụ văn hóa, tín ngưỡng và tâm hồn vùng đất phương Nam.",
      "Gốm Lái Thiêu gồm 3 dòng chính: Quảng Đông chuyên dùng cho các đồ vật thờ tự (chậu hoa, các tượng lưỡng long,...) Triều Châu và Phúc Kiến chuyên dùng cho các đồ gia dụng như lu, khạp, cối,... Tùy thuộc vào từng lò, từng thời kỳ mà từng dòng gốm cũng sẽ khác nhau về cách phối màu, trang trí,...",
      "Dưới góc nhìn là một nhà sưu tập, ông Nguyễn Hữu Phúc, Hội trưởng Hội cổ vật Thuận An chia sẻ: Nếu người nghệ nhân lấy “Nhất liệu, nhì nung, tam hình, tứ trí” làm nền tảng, thì những người “chơi gốm” lại lấy “Nhất dáng, nhì da, tam toàn, tứ mỹ” là tiêu chuẩn. Và khi sưu tầm, các sản phẩm chính là tâm huyết của người thợ, là những món đồ có một không hai,... nên người sưu tầm cũng cần phải tìm hiểu về các món cổ vật để càng thêm trân quý những sản phẩm gốm này.",
      "Trong cuộc trò chuyện, ông cũng giải thích về một số họa tiết thường thấy trong gốm Lái Thiêu như: con gà, hình hoa, chữ viết... Những họa tiết này không chỉ thể hiện lối sống, tính cách của người dân mà còn mang những ý nghĩa, lời chúc tốt đẹp. Với những vẻ đẹp mộc mạc ấy, gốm Lái Thiêu luôn là những sản phẩm gia dụng gần gũi với bà con miền Nam.",
      "Nhưng qua nhiều năm từ cực thịnh đến khi mai một, nỗi trăn trở về việc phục dựng, tạo điều kiện cho các làng nghề gốm Lái Thiêu luôn đau đáu trong lòng của nhiều người yêu thích, say mê gốm truyền thống như ông Phúc.",
    ],
    related: ["le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long", "dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu", "gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi", "di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su"],
  },
  {
    slug: "gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi",
    title: "Gốm Nam Bộ – Dấu ấn trăm năm hồi sinh giữa lòng đô thị",
    author: "HTV9",
    img: bookImage('test_gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi-420-2025527235444.jpeg'),
    rating: 0,
    formats: ["Phim tài liệu"],
    category: { label: "Phim tài liệu", href: "/sach/phim-tai-lieu/" },
    actions: [
      { label: "Video", kind: "video", primary: false, href: "/sach/gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi/Video.html" },
    ],
    catalog: [],
    summary: [
      "Từ ngày 24 đến 31/5, Thư viện số Nguyễn An Ninh phối hợp cùng Đường sách TP.HCM tổ chức chuỗi sự kiện \"Gốm Nam Bộ – Dấu ấn trăm năm\", nhằm tôn vinh di sản gốm truyền thống qua cả hai không gian vật lý và trực tuyến.",
    ],
    related: ["le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long", "dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu", "gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai", "di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su"],
  },
  {
    slug: "hoi-kin-nguyen-an-ninh-tua-cua-to-nguyet-dinh",
    title: "Hội kín Nguyễn An Ninh - Tựa của Tô Nguyệt Đình",
    author: "Việt Tha, Lê Văn Thử",
    img: bookImage('test_hoi-kin-nguyen-an-ninh-tua-cua-to-nguyet-dinh-841-2025912204544.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/hoi-kin-nguyen-an-ninh-tua-cua-to-nguyet-dinh/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Mê Linh",
      "Năm xuất bản: 1961",
      "Mô tả vật lý: 124 trang",
    ],
    summary: [
      "Có một thười kỳ Việt Tha, Lê Văn Thử hoạt động chính trị bên cạnh các chiến sĩ cách mạng Phan Văn Hùm, Tạ Thu Thâu, Nguyễn An Ninh...Chính từ địa hạt này anh bước sang làng văn, làng báo. Cho nên những sự kiện mà anh ký thác trong tập sách ít nhất cũng phản ánh một cách trung thực những sự việc đã xảy ra chung quanh một phong trào cách mạng Việt Nam mà lịch sử đã mệnh danh là \"Hội kín Nguyễn An Ninh\".Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp cho Thư viện tài liệu này để phục vụ bạn đọc!",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "hoi-kin-xu-an-nam",
    title: "Hội kín xứ An Nam",
    author: "Georges Coulet",
    img: bookImage('test_hoi-kin-xu-an-nam-842-2025912205756.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/hoi-kin-xu-an-nam/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Hội nhà văn",
      "Năm xuất bản: 2019",
      "Mô tả vật lý: 398 trang, khổ 16x24cm",
      "Thể loại: Lịch sử",
    ],
    summary: [
      "Bởi tính chất đặc biệt của hội kín chính là sự bí mật, mà ở đây thiếu bằng chứng trực tiếp ghi nhận lại nên toàn bộ khảo sát tức thời (cũng như văn bản về chủ để này) không thể thực hiện, sự tồn tại đặc hữu của hội kín trên đất An Nam có thể được mô tả gián tiếp hoặc bởi nghiên cứu về những luật lệ An Nam đã hay vẫn còn chi phối đất nước này, hoặc bởi sự gia tăng của những biến loạn đã xáo động xã hội An Nam kể từ khi chính quyền người Pháp được xác lập ở Đông Dương.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp bản số hóa cho Thư viện làm tư liệu phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "kich-dong-long-yeu-nuoc-truyen-ba-tu-tuong-tien-bo",
    title: "Kích động lòng yêu nước, truyền bá tư tưởng tiến bộ",
    author: "Nguyễn An Tịnh",
    img: bookImage('test_kich-dong-long-yeu-nuoc-truyen-ba-tu-tuong-phap-2025916141427.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/kich-dong-long-yeu-nuoc-truyen-ba-tu-tuong-tien-bo/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Quá trình kích động lòng yêu nước, truyền bá tư tưởng Pháp: Tự do - Bình đẳng - Bác ái, tư tưởng nhân văn, tư tưởng Mác - Ăng ghen - Lê Nin, những quan điểm tư tưởng và phương pháp tiến hành một cuộc cách mạng nhằm chuẩn bị cho sự ra đời của Đảng Thanh niên cao vọng (1923 -1929)",
      "Nguyễn An Ninh (bìa trái) và Nguyễn Thế Truyền (bìa phải) năm 1927 tại Pháp (Nguồn: Ảnh gia đình cung cấp).",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long",
    title: "Lễ Khai Mạc Chuỗi Sự Kiện “Văn Minh Lúa Nước Đồng Bằng Sông Cửu Long”",
    author: "Thư viện số Nguyễn An Ninh",
    img: bookImage('test_le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long-909-202512514532.jpeg'),
    rating: 0,
    formats: ["Phim tài liệu"],
    category: { label: "Phim tài liệu", href: "/sach/phim-tai-lieu/" },
    actions: [
      { label: "Video", kind: "video", primary: false, href: "/sach/le-khai-mac-chuoi-su-kien-van-minh-lua-nuoc-dong-bang-song-cuu-long/Video.html" },
    ],
    catalog: [
      "Chuỗi sự kiện “Văn minh lúa nước Đồng bằng sông Cửu Long” (ĐBSCL) đã chính thức khai mạc tại Đường sách TPHCM. Đây là hoạt động được tổ chức bởi Không gian Thư viện số Nguyễn An Ninh, phối hợp cùng các đơn vị Hiệp hội ngành hàng lúa gạo Việt Nam, TIM Corp, Mekong Hub, Đường Sách TP.HCM. TS. Quách Thu Nguyệt (Chủ tịch Hội đồng quản lý Quỹ Hoa Sen) chia sẻ, chuỗi sự kiện mong muốn phác thảo một bức tranh, một lát cắt của Đồng bằng Sông Cửu Long về văn hóa và con người của mảnh đất này. Buổi khai mạc còn giới thiệu đến khán giả nghệ thuật sân khấu Rô Băm độc đáo của cộng đồng dân tộc Khmer qua tiết mục Giai điệu Ream kêr. Đây là thành quả của đề tài nghiên cứu khoa học đầy tâm huyết được thực hiện bởi TS. Sơn Cao Thắng (Phó trưởng Khoa Ngôn ngữ - Văn hóa - Nghệ thuật Khmer Nam Bộ, Trường Đại học Trà Vinh) cùng các bạn sinh viên của trường.",
      "Tiếp nối các hoạt động chủ đề trong năm 2025 của Thư viện số Nguyễn An Ninh, sự kiện lần này tập trung vào chủ đề chính là cây lúa và sự phát triển của nông nghiệp ĐBSCL trước những thách thức tự nhiên, đồng thời mở ra hành trình khởi nghiệp và phát triển nông nghiệp thuận thiên. Trước những thách thức khắc nghiệt của biến đổi khí hậu, xâm nhập mặn và di cư lao động, sự kiện nhấn mạnh việc nhìn nhận những giá trị văn hóa và kinh tế của vùng ĐBSCL như một di sản quý báu cần được bảo tồn và tiếp nối. Chương trình không chỉ tái hiện hành trình cây lúa từ quá khứ đến hiện tại mà còn là lời mời gọi thế hệ trẻ khai mở “hành trình khẩn hoang mới” bằng tri thức, công nghệ và sáng tạo. Mục tiêu là để ĐBSCL tiếp tục là vựa lúa, vựa văn hóa và là niềm tự hào trong tương lai.",
      "Chương trình kỳ vọng sẽ được tiếp nối thông qua dự án Sách cho ĐBSCL, giúp bảo tồn tri thức bản địa và đưa tri thức khoa học tiếp cận người nông dân một cách trực tiếp.",
    ],
    summary: [],
    related: ["dieu-gi-khien-nhieu-ban-tre-gen-z-tim-ve-lang-gom-lai-thieu", "gom-nam-bo-dau-an-tram-nam-hoi-sinh-giua-long-do-thi", "gom-lai-thieu-trong-dong-chay-xa-hoi-duong-dai", "di-tich-khao-co-va-dau-an-gom-sai-gon-trong-dong-chay-lich-su"],
  },
  {
    slug: "lich-su-nam-tien-cua-dan-toc-viet-nam",
    title: "Lịch sử Nam tiến của dân tộc Việt Nam",
    author: "Trúc Khê",
    img: bookImage('test_lich-su-nam-tien-cua-dan-toc-viet-nam-845-202591221195.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/lich-su-nam-tien-cua-dan-toc-viet-nam/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Ngày Mai",
      "Mô tả vật lý: 48 trang",
    ],
    summary: [
      "Viên-tản cao xanh, Mé-công rộng lớn, sông một đải, đất nước ba phần, vui về thay anh em chị em ta hai mươi nhăm triệu đồng bào ta ngày nay, được cùng nhau sinh tụ ở trên một cõi nước non hoa gắm, kẻ đi săn sẵn rừng, kẻ đi cầy sẵn ruộng, kë lâm thợ sẵn đồ nguyên liệu, kẻ đi buôn sẵn đường bề sông, thực là một cõi rất thích nghi cho sự sinh hoạt của dân tộc ta, tựa như ông giời kia có ý vì dân tộc ta mà riêng dành cho vậy.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "lich-su-noi-chien-o-viet-nam-1771-1802",
    title: "Lịch sử nội chiến ở Việt Nam 1771 - 1802",
    author: "Tạ Chí Đại Trường",
    img: bookImage('test_lich-su-noi-chien-o-viet-nam-1771-1802-846-2025912213913.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/lich-su-noi-chien-o-viet-nam-1771-1802/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Hậu bán thế kỷ 18 là một trong những giai doạn rối ren nhứt và cũng là một trong những giai đoạn hiếm hoi mà người Việt sau khi chịu được cơn chuyển mình, thấy đất nước lớn mạnh hơn, dồi dào sinh lực hơn ngày trước. Cuộc khởi nghĩa Tây sơn, biến cố tàn Lè, mạt Trịnh, sự phục hồi của họ Nguyễn, tất cả đầy sinh động, hấp dẫn, khiến cho người đương thời vội vã kiên nhẫn lục lọi làm nên tổng hợp chuyên biệt mà người đời sau khoa học mà chúng ta chú ý ở đây.",
      "Thư viện xin được cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "luc-van-tien-tho-in-lan-thu-3",
    title: "Lục Vân Tiên thơ - in lần thứ 3",
    author: "Nguyễn Đình Chiểu",
    img: bookImage('luc-van-tien-tho-in-lan-thu-3-237-202421111619.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Văn học", href: "/sach/van-hoc/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/luc-van-tien-tho-in-lan-thu-3/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Truyện thơ Lục Vân Tiên 蓼雲仙 của Nguyễn Đình Chiểu là một tác phẩm được phổ biến rất sâu rộng ở Miền Nam, là một truyện thơ sáng tác theo thể lục bát vào đầu những năm 1850, và được Trương Vĩnh Ký phiên âm chữ quốc ngữ và cho xuất bản lần đầu tiên vào năm 1889. Đây là một cuốn tiểu thuyết về luân lý, cốt bàn đạo làm người với quan niệm văn dĩ tải đạo. Tác giả muốn đem gương người xưa mà khuyên người ta về cương thường – đạo nghĩa.",
    ],
    related: [],
  },
  {
    slug: "nam-bac-tranh-hung",
    title: "Nam Bắc tranh hùng",
    author: "Hùng Phong",
    img: bookImage('test_nam-bac-tranh-hung-855-2025912224954.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Văn học", href: "/sach/van-hoc/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nam-bac-tranh-hung/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Yên Sơn",
      "Năm xuất bản: 1953",
      "Chủ đề: Văn học, Lịch sử",
    ],
    summary: [
      "Trong Lịch sử Việt Nam ta, có lẽ kầu hết mọi người đều công nhận rằng thời kỳ Nam Bắc phân tranh giữa Chúa Trịnh và Chúa Nguyền là một thời kỳ đau thương nhất của giống noì. Trải qua mắy ngàn năm lịch sử, dân Việt Nam tuy đã phải chìm đắm trong bao cảnh chinh chiến lầm than, nhưng phần nhiều đó chỉ là vì nghĩa-vụ, phải bảo tồn lấy giang sơn, chống lại kẻ cường xâm. Bởi vậy cho nên lòng người vần thấy có một nguồn tin tưởng ở tâm hồn.",
      "Thư viện xin được cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: [],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-an-giang-phan-1",
    title: "Nghiên cứu địa bạ Triều Nguyễn - tỉnh An Giang (Phần 1)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-an-giang-phan-1-847-202591221521.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-an-giang-phan-1/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Tổng Hợp TP. HCM",
      "Năm xuất bản: 1995",
      "Mô tả vật lý: trang, khổ",
      "Chủ đề: :Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-1",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Gia Định (Phần 1)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-1-848-202591222446.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-1/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Tổng Hợp TP. Hồ Chí Minh",
      "Năm xuất bản: 1995",
      "Chủ đề: Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Gia Định (Phần 2)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2-849-2025912221039.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nghiên cứu địa bạ - khảo cổ", href: "/sach/nghien-cuu-dia-ba-khao-co/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Tổng Hợp TP. HCM",
      "Năm xuất bản: 1995",
      "Chủ đề: Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1", "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Hà Tiên (Phần 1)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1-852-202591222259.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nghiên cứu địa bạ - khảo cổ", href: "/sach/nghien-cuu-dia-ba-khao-co/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1/PDF.html" },
    ],
    catalog: [
      "Nhà xuât bản: Tổng Hợp TP. HCM",
      "Năm xuất bản: 1994",
      "Chủ đề: Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Hà Tiên (Phần 2)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-853-202591222281.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nghiên cứu địa bạ - khảo cổ", href: "/sach/nghien-cuu-dia-ba-khao-co/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2/PDF.html" },
    ],
    catalog: [
      "Nhà xuât bản: Tổng Hợp TP. HCM",
      "Năm xuất bản: 1994",
      "Chủ đề: Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1", "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Vĩnh Long (Phần 1)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1-851-2025912221649.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nghiên cứu địa bạ - khảo cổ", href: "/sach/nghien-cuu-dia-ba-khao-co/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1"],
  },
  {
    slug: "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2",
    title: "Nghiên cứu địa bạ triều Nguyễn - tỉnh Vĩnh Long (Phần 2)",
    author: "Nguyễn Đình Đầu",
    img: bookImage('test_nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2-850-2025912221340.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nghiên cứu địa bạ - khảo cổ", href: "/sach/nghien-cuu-dia-ba-khao-co/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-2/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Tổng Hợp TP. HCM",
      "Năm xuất bản: 1994",
      "Chủ đề: Lịch sử, nghiên cứu địa bạ",
    ],
    summary: [
      "Với tầm nhìn khái quát và sâu sắc qua nghiên cứu Địa bạ, nhà sử học Nguyễn Đình Đấu đã làm nổi bật những nét chính yếu của chế độ sở hữu ruộng đất nói riêng và của nền hành chính nói chung. Như các chính sách : quân cấp công điền cho người thiếu ruộng, ngụ binh ư nông, cấm quan chức tậu ruộng ở nơi trị nhậm, thuế khóa biệt đãi dân cư thổ và nghĩa trang, v.v... Chế độ sở hữu ruộng đất, được chia ra 3 quyền: a) Quyền sở hữu tối thượng của nhà vua (tức Nhà nước); b) Quyền sở hữu của tư nhân và tập thể; c) Quyền sử dụng (trong thời gian nhất định và không được mua đi bán lại). Nhà nước xua luôn khuyên điền, và còn lập ra các định diễn, đồn điền và trang trại (khi ấy gọi là quan điển). Sau khi thành tựu, Nhà nước đem quan diễn chia cho dân có công khai phá làm từ điển và giữ lại một phần làm công điền. Nhà nước quan tâm đến hoạt động chính trị, cai trị, quốc phòng và thu thuế, còn kinh tế thì để dân làm.",
      "Phải chăng tất cả những chính sách trên cùng với dẫn chứng Địa ba sẽ cho ta thấy đạo lý và tư tường truyền thống Việt Nam đã được pháp chế hóa và cụ thể hóa thế nào trong đời sống nhân dân ta. Tư tưởng yêu đất nước quê hương, hiếu thảo trong gia đình, thương đồng bào ruột thịt đã được biện minh hùng hồn qua những phán mô tả, thống kê, phân tích Địa bạ.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["nghien-cuu-dia-ba-trieu-nguyen-tinh-gia-dinh-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-2", "nghien-cuu-dia-ba-trieu-nguyen-tinh-ha-tien-phan-1", "nghien-cuu-dia-ba-trieu-nguyen-tinh-vinh-long-phan-1"],
  },
  {
    slug: "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo",
    title: "Nghìn năm bia miệng T1: Sự tích và giai thoại dân gian Nam Bộ",
    author: "Huỳnh Ngọc Trảng, Trương Ngọc Tường",
    img: bookImage('test_nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo-977-202652516630.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 398.2095977 - NGH311N - 2018(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 405",
      "Nhà xuất bản: NXB Tổng hợp TPHCM",
      "Năm xuất bản: 2018",
      "Mô tả vật lý: 320 trang, khổ 16 x 24, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, Nam Bộ, sự tích, giai thoại, sưu tầm",
    ],
    summary: [
      "Sách sưu tập công phu các sự tích, giai thoại Nam Bộ, ghi lại câu chuyện từ thời khai phá, kháng Pháp đến những giai thoại nhân văn, hài hước, phản ánh khí chất anh hùng, bản sắc văn hóa độc đáo.",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "viet-nam-phong-tuc", "than-dat-ong-dia-than-tai", "dong-dao-va-tro-choi-truyen-thong"],
  },
  {
    slug: "nguoi-viet-dat-viet",
    title: "Người Việt đất Việt",
    author: "Cửu Long Giang - Toan Ánh",
    img: bookImage('test_nguoi-viet-dat-viet-854-2025912224315.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nguoi-viet-dat-viet/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Kim Lai Ấn Quán",
      "Năm xuất bản: 1967",
      "Chủ đề: Văn hóa, phong tục, tập quán",
    ],
    summary: [
      "Tác phẩm \"NGƯỜI VIỆT... ĐẤT VIỆT...\" giới thiệu đời sống và văn hóa người Việt trên các vùng đất, tập trung vào phong tục, tập quán, nghề nghiệp, lễ hội và sinh hoạt cộng đồng; phân tích mối quan hệ giữa con người với thiên nhiên, xã hội và lịch sử dân tộc; đồng thời làm nổi bật tinh thần yêu nước, đạo đức và bản sắc văn hóa.",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện để phục vụ bạn đọc!",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "viet-nam-phong-tuc", "than-dat-ong-dia-than-tai", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo"],
  },
  {
    slug: "nguyen-an-ninh-chuong-re-keu-khap-dong-tay",
    title: "Nguyễn An Ninh \"Chuông Rè kêu khắp Đông Tây\"",
    author: "Hoàng Văn Quang",
    img: bookImage('test_nguyen-an-ninh-chuong-re-keu-khap-dong-tay-863-202591551936.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nguyen-an-ninh-chuong-re-keu-khap-dong-tay/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Đến nay, nhiều bậc lão niên Nam Bộ vẫn còn nhớ như in hình ảnh một chàng trai thấp đậm, mắt một mí mơ màng, gợn buồn, mái tóc dài bù xù đầy vẻ triết gia, vận chiếc áo dài thâm ôm chồng báo Chuông rè (Laclochefêleé) tới những con hẻm bán dạo. Anh ta đi tới đâu là mật thám bu tới đó. Nhiều người bị mất việc, bị đuổi học, tù tội chỉ vì đọc Chuông rè. Điều này vẫn không ngăn cản được độc giả tìm đến với tờ báo ngày càng đông hơn. Có thanh niên đứng nấp sau bờ tường cả buổi chờ người bán báo đặc biệt đó đi qua là nhảy xô ra, giật lấy tờ báo, giúi vào tay chủ nhân nắm tiền rồi chạy vút vào ngõ thông sang phố khác. Mấy tay mật thám chỉ còn nước giậm chân, lắc đầu, tức tối nhìn theo. Người chủ báo, kiêm kí giả, biên tập và tự mình đi bán báo đó chính là Nguyễn An Ninh, thần tượng của người dân Nam kì lúc bấy giờ",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than",
    title: "Nguyễn An Ninh: Qua Hồi Ức Của Những Người Thân",
    author: "Trung tâm nghiên cứu quốc học",
    img: bookImage('nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than-90-202310415566.jpeg'),
    rating: 0,
    formats: ["Sách giấy", "Sách số", "Sách nói"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than/PDF.html" },
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
      { label: "Audio", kind: "audio", primary: false, href: "/sach/nguyen-an-ninh-qua-hoi-uc-cua-nhung-nguoi-than/Audio.html" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 959.704092 - NG527A - 2009(3)- Vị trí kệ: TT8A_NAN- Số thứ tự: 42- Nhà xuất bản: NXB Văn học- Năm xuất bản: 2009- Mô tả vật lý: 475 trang, khổ 16x24, số lượng 3- Thể loại/ chủ đề: Nguyễn An Ninh, hồi ức, gia đình, tổng hợp",
    ],
    summary: [
      "Người trí thức Nguyễn An Ninh, nhà văn - nhà báo - nhà bác học Nguyễn An Ninh… tất cả thống nhất trong một con người suốt đời hy sinh, tận tụy vì nghĩa lớn để làm một “hoa tiêu trong cơn bão táp” của dân tộc, làm một lãnh tụ, người dẫn dắt dân tộc. Ông đã 5 lần qua Pháp, gặp Nguyễn Ái Quốc, gặp Phan Châu Trinh, gặp Phan Văn Trường và rất nhiều người, trong nhiều giới để thảo luận và cùng nhau vận động cách mạng. Ông tình nguyện là người gieo hạt giống yêu nước - cách mạng trong giới thanh niên, trí thức, điền chủ, doanh nghiệp yêu nước, để dọn đường cho Cách mạng do Đảng Cộng sản lãnh đạo. Cho nên, ông tự nhận mình là người “chỉ làm cơn gió thổi” - thổi bùng lên ngọn lửa yêu nước để chờ thời cơ. Ông là người mác xít, là người dịch và truyền bá Tuyên ngôn Cộng Sản trên báo chí thời đó. Ông và người có cái nhìn với tầm mắt xa rộng trước những vấn đề lớn của đất nước và thế giới. Quần chúng đông đảo tập hợp quanh ông, bảo vệ ông, yêu mến ông và tôn vinh ông như một chí sĩ ngang tầm Phan Bội Châu, Phan Châu Trinh…",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935",
    title: "Nguyễn An Ninh trước thoái trào cách mạng 1931 - 1935",
    author: "Nguyễn An Tịnh",
    img: bookImage('test_nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935-202511275952.jpeg'),
    rating: 0,
    formats: ["Sách nói"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Nguyễn An Ninh trước thoái trào cách mạng 1931 - 1935, với ĐCS Pháp, QTCS, với ĐCS Đông Dương: sự gầy dựng tổ chức cách mạng cao trào chuẩn bị cơ sở cho cuộc thử nghiệm tổng diễn tập rộng rãi lần thứ nhất “Đông Dương Đại hội năm 1936”.",
    ],
    related: [],
  },
  {
    slug: "phong-trao-dai-dong-du",
    title: "Phong trào đại Đông Du",
    author: "Phương Hữu",
    img: bookImage('test_phong-trao-dai-dong-du-856-2025912225853.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/phong-trao-dai-dong-du/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Nam Việt",
      "Năm xuất bản: 1950",
      "Chủ đề: Lịch sử",
    ],
    summary: [
      "Tài liệu về phong trào của các nhà ái quốc như Phan Bội Châu, Tăng Bạt Hồ, Nguyễn Thuật...xảy ra cách đây 40 năm Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "sai-gon-gia-dinh-ky-uc-lich-su-van-hoa",
    title: "Sài Gòn Gia Định: Ký ức Lịch sử - Văn hóa",
    author: "Huỳnh Ngọc Trảng",
    img: bookImage('test_sai-gon-gia-dinh-ky-uc-lich-su-van-hoa-979-202652516128.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Hồ Chí Minh", href: "/sach/ho-chi-minh/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 959.779 - S103G - 2018(1)",
      "Vị trí kệ: TT2B_HCM",
      "Số thứ tự: 403",
      "Nhà xuất bản: NXB Tổng hợp TPHCM",
      "Năm xuất bản: 2018",
      "Mô tả vật lý: 407 trang, khổ 16 x 24, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, lịch sử, Sài Gòn Gia Định",
    ],
    summary: [
      "Sách nghiên cứu di sản văn hóa, lịch sử Sài Gòn - Gia Định từ thế kỷ XVII đến nay, phân tích sự giao thoa văn hóa, tín ngưỡng, phong tục, cùng những thách thức toàn cầu hóa, phản ánh bản sắc độc đáo vùng đất này.",
    ],
    related: [],
  },
  {
    slug: "so-khao-nghien-cuu-van-hoa-gia-dinh",
    title: "Sơ khảo nghiên cứu Văn hóa gia đình",
    author: "Nguyễn Thanh Bền",
    img: bookImage('test_so-khao-nghien-cuu-van-hoa-gia-dinh-984-2026525165050.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 306.85 - S460KH - 2020(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 305",
      "Nhà xuất bản: NXB Văn hóa văn nghệ",
      "Năm xuất bản: 2020",
      "Mô tả vật lý: 200 trang, khổ 14,5 x 20,5, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, văn hóa gia đình, sơ khảo",
    ],
    summary: [
      "Cuốn sách phân tích văn hóa gia đình Việt Nam, làm rõ giá trị truyền thống, sự biến đổi qua thời gian và những thách thức trong bối cảnh hội nhập, nhằm bảo tồn bản sắc dân tộc.",
    ],
    related: ["viet-nam-phong-tuc", "than-dat-ong-dia-than-tai", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo", "dong-dao-va-tro-choi-truyen-thong"],
  },
  {
    slug: "su-ky-dai-nam-viet",
    title: "Sử ký Đại Nam Việt",
    author: "Quốc Triều",
    img: bookImage('test_su-ky-dai-nam-viet-857-202591223249.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/su-ky-dai-nam-viet/PDF.html" },
    ],
    catalog: [
      "Năm xuất bản: 1903",
      "Chủ đề: Lịch sử",
    ],
    summary: [
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho Thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-1",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 1)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-1-879-2025929111555.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-1/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-2",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 2)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-2-880-2025929111834.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-2/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-3",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 3)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-3-881-2025929112234.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-3/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-4",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 4)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-4-882-2025929112352.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-4/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-5",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 5)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-5-883-2025929112459.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-5/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-6",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 6)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-6-884-2025929112614.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-6/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-7",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 7)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-7-885-2025929112714.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-7/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-8",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần 8)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-8-886-2025929112823.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-8/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2010-phan-cuoi",
    title: "Tạp chí Xưa và Nay năm 2010 (Phần cuối)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2010-phan-cuoi-887-2025929112936.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2010-phan-cuoi/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2011-phan-1"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2011-phan-1",
    title: "Tạp chí Xưa và Nay năm 2011 (Phần 1)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2011-phan-1-888-2025929114857.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2011-phan-1/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-2", "tap-chi-xua-va-nay-nam-2010-phan-cuoi"],
  },
  {
    slug: "tap-chi-xua-va-nay-nam-2011-phan-2",
    title: "Tạp chí Xưa và Nay năm 2011 (Phần 2)",
    author: "Nhiều tác giả",
    img: bookImage('test_tap-chi-xua-va-nay-nam-2011-phan-2-889-2025929115024.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Tạp chí - Báo", href: "/sach/tap-chi-bao/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/tap-chi-xua-va-nay-nam-2011-phan-2/PDF.html" },
    ],
    catalog: [],
    summary: [
      "Tạp chí Xưa và Nay là cơ quan ngôn luận của Hội Khoa học Lịch sử Việt Nam. Đây là một trong những tạp chí chuyên ngành lịch sử có uy tín tại Việt Nam, tập trung vào việc nghiên cứu, phố biến kiến thức lịch sử và thúc đấy nhận thức về giá trị lịch sử trong xã hội.",
      "Thư viện xin gửi lời cảm ơn đến Tạp chí Xưa và Nay đã cho phép Thư viện khai thác, số hóa và sử dụng tài liệu liên quan đến mảnh đất và con người Nam Bộ phục vụ bạn đọc.",
    ],
    related: ["tap-chi-xua-va-nay-nam-2011-phan-1", "tap-chi-xua-va-nay-nam-2010-phan-cuoi"],
  },
  {
    slug: "than-dat-ong-dia-than-tai",
    title: "Thần Đất. Ông Địa. Thần Tài",
    author: "Huỳnh Ngọc Trảng",
    img: bookImage('test_than-dat-ong-dia-than-tai-978-202652516918.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 202.11 - TH121Đ - 2020(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 404",
      "Nhà xuất bản: NXB Tổng hợp TPHCM",
      "Năm xuất bản: 2020",
      "Mô tả vật lý: 144 trang, khổ 16 x 24, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, tín ngưỡng, thờ cúng",
    ],
    summary: [
      "Sách nghiên cứu tín ngưỡng thờ Thần Đất, Ông Địa, Thần Tài trong văn hóa Việt Nam, phân tích vai trò của đất trong thần thoại, tín ngưỡng dân gian, sự kết nối với đời sống cộng đồng.",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "viet-nam-phong-tuc", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo", "dong-dao-va-tro-choi-truyen-thong"],
  },
  {
    slug: "than-the-va-su-nghiep-nha-cach-mang-nguyen-an-ninh",
    title: "Thân thế và sự nghiệp Nhà Cách mạng Nguyễn An Ninh",
    author: "Phương Lan, Bùi Thế Mỹ (sưu khảo)",
    img: bookImage('test_than-the-va-su-nghiep-nha-cach-mang-nguyen-an-ninh-843-202591221516.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/than-the-va-su-nghiep-nha-cach-mang-nguyen-an-ninh/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: in tại An Quán Thúy Phương",
      "Mô tả vật lý: 264 trang",
    ],
    summary: [
      "Sưu khảo thiên tài liệu này, đề gọi là. tưởng niệm, ghi ân những bậc tiền bồi cách mana, danh nhân, sao cho những nhân vật xứng đáng là hữudanh trong lỊch sử đấu tranh dân tộc, đừng trở thành vô danh, mai một với. hậu lai. Như chúng ta nhận thấy, biết bao nhà cách mạng, bao áng văn hạy, bài báo có giá trị, hạp thời của những danh nhân, ái quốc tiền nhân, thường, bị thất truyền, lạc mắt, không ai được biết tỉnh tường sự nghiệp cách mạng, được đọc, được nhắc nhở tới công trạng tiền phong lót đường của các bậc tiền nhân cao cả ấy.",
      "Thư viện xin được cảm ơn nhà văn Hà Thanh Vân đã cũng cấp tư liệu trên cho Thư viện để phục vụ bạn đọc!",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "the-luc-khach-tru-va-van-de-di-dan-vao-nam-ky",
    title: "Thế lực khách trú và vấn đề di dân vào Nam Kỳ",
    author: "Đào Trinh Nhất",
    img: bookImage('test_the-luc-khach-tru-va-van-de-di-dan-vao-nam-ky-858-202591223853.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/the-luc-khach-tru-va-van-de-di-dan-vao-nam-ky/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản Hà Nội: Nhà In Thụy Ký Năm xuất bản: 1924 Ngôn ngữ: Tiếng Việt Thể loại: Văn học; Lịch sử",
    ],
    summary: [
      "Đã từng có một làn sóng tẩy chay hàng Tàu diễn ra rất sớm vào những năm đầu thế kỷ trước, bắt đầu từ Sài Gòn và lan rộng ra trên cả nước ta. Điều gì đã làm người dân Việt Nam lúc ấy làm nên phong trào này? Ấy là bởi thế lực của của các Chú Khách Tàu ở Nam kỳ.",
      "Dân tàu di dân sang nước ta, làm kinh tế, làm thương mại, làm nông dân, làm ngư dân, làm tất cả những ngành nghề chân lấm tay bùn và cả làm tội phạm nữa. Họ lập bang hội, họ cưới vợ bản xứ, họ sinh con đẻ cái, phát triển tư bản, không gì là các Chú Khách không làm. Như tằm ăn rỗi, các Chú Khách đã thao túng gần như được toàn bộ nền kinh tế Nam kỳ những năm đầu thế kỷ 20. Dân Việt mất toàn bộ thị phần kinh tế ngay trên chính xứ sở của mình.",
      "Vậy làm thế nào để xử lý được vấn đề này? Học giả Đào Trinh Nhất đã đưa ra được giải pháp xác đáng để vãn hồi nền kinh tế trong nước lúc ấy và làm thế nào nào để Nam Trung Bắc chung tay chống lại được thế lực các Chú: đó là di dân vào Nam và phát triển nền kinh tế.",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "theo-dong-lich-su-nhung-vung-dat-than-va-tam-thuc-nguoi-viet",
    title: "Theo dòng lịch sử (những vùng đất, thần và tâm thức người Việt)",
    author: "Trần Quốc Vượng",
    img: bookImage('test_theo-dong-lich-su-nhung-vung-dat-than-va-tam-thuc-nguoi-viet-859-2025912231949.jpeg'),
    rating: 0,
    formats: ["Sách số"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/theo-dong-lich-su-nhung-vung-dat-than-va-tam-thuc-nguoi-viet/PDF.html" },
    ],
    catalog: [
      "Nhà xuất bản: Văn hóa",
      "Năm xuất bản: 1996",
      "Chủ đề: Lịch sử - Văn hóa",
    ],
    summary: [
      "Cuốn sách giống như một cuốn hồi ký ghi lại chặng đường lịch sử nghiên cứu của GS. Trần Quốc Vượng, những mảnh đất nơi ông đã từng đến và đi qua trên mọi miền tổ quốc, cùng với những quan điểm, suy nghĩ, nghiên cứu của ông về lịch sử, văn hóa và tâm thức người Việt. Đặc biệt là khảo cổ học.Các vấn đề lịch sử văn hóa, các vùng đất được đề cập đến trong quyển sách như: đất tổ Đền Hùng, trống đồng và tâm thức Việt cổ, mảnh đất Vĩnh Phú, Cổ Loa, Làng Bùng, Trạng Bùng, khảo cổ học khu vực Hương Sơn, Mê Linh, Đông Anh, Gia Lâm, Hà Bắc, Sông Châu - Núi Đọ, Xứ Thanh, Hà Tĩnh ...",
      "Thư viện xin cảm ơn nhà văn Hà Thanh Vân đã cung cấp tư liệu cho thư viện phục vụ bạn đọc!",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
  {
    slug: "thu-tuong-vo-van-kiet-chan-dung-mot-con-nguoi",
    title: "Thủ Tướng Võ Văn Kiệt: Chân Dung Một Con Người",
    author: "Minh Đạo",
    img: bookImage('test_thu-tuong-vo-van-kiet-chan-dung-mot-con-nguoi-981-2026525163425.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Nhân vật", href: "/sach/nhan-vat/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 342.597068 - TH500T - 2008(1)- Vị trí kệ: TT7B_TS- Số thứ tự: 351- Nhà xuất bản: NXB Chính trị Quốc gia- Năm xuất bản: 2008- Mô tả vật lý: 87 trang, khổ 25 x 25, số lượng 1- Thể loại/ chủ đề: Nhân vật, Võ Văn Kiệt, thủ tương, chân dung, cuộc đời, sự nghiệp cách mạng",
    ],
    summary: [
      "Sách ảnh tài liệu và nghệ thuật của nhà báo, nhiếp ảnh Minh Đạo ghi lại những khoảnh khắc chân thực, quý giá về cố Thủ tướng Võ Văn Kiệt. Sách phác hoạ sinh động chân dung Thủ tướng trong công việc, đời thường, các chuyến công tác trong và ngoài nước, thể hiện phong cách lãnh đạo quyết đoán nhưng gần gũi, suốt đời vì dân.",
    ],
    related: ["duc-giao-tong-phan-van-tong-mot-tam-guong-tot-doi-dep-dao"],
  },
  {
    slug: "ton-giao",
    title: "Tôn Giáo",
    author: "Nguyễn An Ninh",
    img: bookImage('test_ton-giao-860-2025912232621.jpeg'),
    rating: 0,
    formats: ["Sách giấy", "Sách số"],
    category: { label: "Nguyễn An Ninh", href: "/sach/nguyen-an-ninh/" },
    actions: [
      { label: "Mượn sách", kind: "pdf", primary: true, href: "/sach/ton-giao/PDF.html" },
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 200 - T454GI - 2024(1)- Vị trí kệ: TT8C_PG- Số thứ tự: 433- Nhà xuất bản: NXB Tổng hợp TPHCM- Năm xuất bản: 2024- Mô tả vật lý: 105 trang, khổ 13 x 19, số lượng 1- Thể loại/ chủ đề: Tôn giáo học, Nguyễn An Ninh, tín ngưỡng, quan điểm, thế kỷ 20",
    ],
    summary: [
      "\"Trong một thời kỳ mà nhơn-loại đâu đâu cũng bị khổ sở, bị thất nghiệp, bị chết đói, chết lạnh, chết lụt, chết vì làm con thịt để nạp cho cuộc chiến tranh như cuộc của đế-quốc Nhựt xâm lược xứ Tàu kia : trong một thời-kỳ rất bối-rối, mắc trong bao nhiêu vấn đề cần phải giải-quyết cần cấp kia, mà lại đem vấn-đề tôn giáo ra mà bàn, chắc sao cũng không khỏi trong đảm bàn-quan có người lấy làm lạ. Cũng có người mỉn cười...\"",
      "Sách phản ánh quan điểm của Nguyễn An Ninh về tín ngưỡng, triết học, xã hội, phân tích cách tiếp cận duy vật biện chứng và vai trò tôn giáo trong đời sống Việt Nam đầu thế kỷ XX.",
    ],
    related: ["nguyen-an-ninh-truoc-thoai-trao-cach-mang-1931-1935"],
  },
  {
    slug: "tuyen-tap-phong-su-ky-su-mien-tay-mien-tay-qua-goc-nhin-cua-nguoi-lam-bao",
    title: "Tuyển tập phóng sự ký sự miền Tây - miền Tây qua góc nhìn của người làm báo",
    author: "Dương Thế Hùng",
    img: bookImage('test_tuyen-tap-phong-su-ky-su-mien-tay-mien-tay-qua-goc-nhin-cua-nguoi-lam-bao-1075-2026731165743.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Hồi ký", href: "/sach/hoi-ky/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 070.44995978 - T527T - 2025(2)",
      "Vị trí kệ: TP3A_HK",
      "Số thứ tự: 621",
      "Nhà xuất bản: NXB Lao Động",
      "Năm xuất bản: 2025",
      "Mô tả vật lý: 246 trang, khổ 15x20, số lượng 2",
      "Thể loại/ chủ đề: Lịch sử, báo chí, miền Tây, Việt Nam, phóng sự, ký sự",
    ],
    summary: [
      "Sách ghi lại chân thực đời sống, con người và văn hóa vùng Đồng bằng sông Cửu Long qua các bài ký sự; khắc họa những câu chuyện dân gian và phong tục đặc sắc nhiều địa danh như: Bến Tre, Trà Vinh, Sóc Trăng...; giải thích nguồn gốc địa danh và ngôn ngữ địa phương, qua đó thể hiện tình yêu quê hương và góp phần gìn giữ bản sắc Nam Bộ.",
      "Thư viện xin cảm ơn tác giả Dương Thế Hùng đã cung cấp tư liệu để Thư viện phục vụ bạn đọc!",
    ],
    related: [],
  },
  {
    slug: "viet-nam-phong-tuc",
    title: "Việt Nam phong tục",
    author: "Phan Kế Bính",
    img: bookImage('test_viet-nam-phong-tuc-980-2026525162322.jpeg'),
    rating: 0,
    formats: ["Sách giấy"],
    category: { label: "Văn hóa", href: "/sach/van-hoa/" },
    actions: [
      { label: "Sách giấy", kind: "paper", primary: false, href: "" },
    ],
    catalog: [
      "Ký hiệu xếp giá: 390.09597 - V308N - 2014(1)",
      "Vị trí kệ: TT2A_VHH",
      "Số thứ tự: 513",
      "Nhà xuất bản: NXB Nhã Nam",
      "Năm xuất bản: 2014",
      "Mô tả vật lý: 295 trang, khổ 15 x 24, số lượng 1",
      "Thể loại/ chủ đề: Văn hóa nghệ thuật, văn hóa học, phong tục, Việt Nam",
    ],
    summary: [
      "Sách nghiên cứu toàn diện về phong tục, tập quán của người Việt, từ phong tục trong gia đình, gia tộc, làng xã đến phong tục quốc gia, xã hội.",
    ],
    related: ["so-khao-nghien-cuu-van-hoa-gia-dinh", "than-dat-ong-dia-than-tai", "nghin-nam-bia-mieng-t1-su-tich-va-giai-thoai-dan-gian-nam-bo", "dong-dao-va-tro-choi-truyen-thong"],
  },
  {
    slug: "xuat-than-trong-mot-dong-toc-tri-thuc-yeu-nuoc-nhieu-doi-hoat-dong-cach-mang-va-van-tho",
    title: "Xuất thân trong một dòng tộc tri thức yêu nước, nhiều đời hoạt động cách mạng và văn thơ",
    author: "Nguyễn An Tịnh",
    img: bookImage('test_xuat-than-trong-mot-dong-toc-tri-thuc-yeu-nuoc-nhieu-doi-hoat-dong-cach-mang-va-van-tho-877-2025917194023.jpeg'),
    rating: 0,
    formats: ["Sách nói"],
    category: { label: "Lịch sử", href: "/sach/lich-su/" },
    actions: [
      { label: "Audio", kind: "audio", primary: false, href: "/sach/xuat-than-trong-mot-dong-toc-tri-thuc-yeu-nuoc-nhieu-doi-hoat-dong-cach-mang-va-van-tho/Audio.html" },
    ],
    catalog: [],
    summary: [
      "Xuất thân trong một dòng tộc tri thức yêu nước, nhiều đời hoạt động cách mạng và văn thơ",
    ],
    related: ["gia-tri-tinh-than-truyen-thong-cua-dan-toc-viet-nam"],
  },
];

/** slug → record, for O(1) route lookups */
export const bookBySlug: Record<string, BookDetail> = Object.fromEntries(
  bookDetails.map((b) => [b.slug, b]),
);

/** detail record → BookCard shape, for the related-books row */
export function toCard(b: BookDetail): Book {
  return {
    title: b.title,
    author: b.author,
    img: b.img,
    href: `/sach/${b.slug}.html`,
    rating: b.rating,
  };
}

/**
 * "Sách/ Tài liệu cùng thể loại": the scraped list first, then same-category
 * books as filler so every page shows a full row like the original.
 */
export function relatedBooks(b: BookDetail, limit = 5): Book[] {
  const seen = new Set([b.slug]);
  const out: BookDetail[] = [];

  for (const slug of b.related) {
    const r = bookBySlug[slug];
    if (r && !seen.has(slug)) {
      seen.add(slug);
      out.push(r);
    }
  }

  if (out.length < limit && b.category) {
    for (const r of bookDetails) {
      if (out.length >= limit) break;
      if (!seen.has(r.slug) && r.category?.href === b.category.href) {
        seen.add(r.slug);
        out.push(r);
      }
    }
  }

  for (const r of bookDetails) {
    if (out.length >= limit) break;
    if (!seen.has(r.slug)) {
      seen.add(r.slug);
      out.push(r);
    }
  }
    return out.slice(0, limit).map(toCard);
}
