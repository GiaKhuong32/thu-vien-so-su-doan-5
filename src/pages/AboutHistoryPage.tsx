import PageBanner from '../components/PageBanner/PageBanner';
import PlaceholderMedia from '../components/PlaceholderMedia/PlaceholderMedia';
import { historyBanner } from '../data/library';
import img01 from '../assets/images/01.jpg';
import img02 from '../assets/images/02.jpg';
import img031 from '../assets/images/03.1.jpg';
import img032 from '../assets/images/03.2.jpg';
import img033 from '../assets/images/03.3.jpg';
import img034 from '../assets/images/03.4.jpg';
import img041 from '../assets/images/04.1.jpg';
import img042 from '../assets/images/04.2.jpg';
import img043 from '../assets/images/04.3.png';
import img044 from '../assets/images/04.4.png';
import './AboutHistoryPage.css';

type Section = {
  number: string;
  title: string;
  paragraphs: string[];
  list?: string[];
};

const sections: Section[] = [
  {
    number: '01',
    title: 'LỊCH SỬ HÌNH THÀNH',
    paragraphs: [
      'Sư đoàn 5 được thành lập trong năm 1965, giữa lúc cuộc kháng chiến chống Mỹ, cứu nước bước vào giai đoạn quyết liệt. Sư đoàn là một trong những đơn vị chủ lực ra đời sớm trên chiến trường Nam Bộ, thực hiện nhiệm vụ chiến đấu và bảo vệ địa bàn chiến lược miền Đông Nam Bộ. Ngày 23/11/1965 được xác định là Ngày truyền thống của Sư đoàn.',
      'Trải qua quá trình xây dựng và trưởng thành, Sư đoàn từng bước trở thành một trong những đơn vị chủ lực có vai trò quan trọng trên chiến trường Nam Bộ.',
    ],
  },
  {
    number: '02',
    title: 'TRUYỀN THỐNG ANH HÙNG',
    paragraphs: ['Trong những năm tháng chiến tranh, các thế hệ cán bộ, chiến sĩ Sư đoàn 5 đã vượt qua muôn vàn khó khăn, gian khổ và hy sinh, chiến đấu kiên cường, mưu trí, lập nhiều chiến công, góp phần vào sự nghiệp giải phóng miền Nam, thống nhất đất nước.',
      'Truyền thống của Sư đoàn được kết tinh trong phương châm:'
    ],
    list: [
      '“Đoàn kết, trung dũng, cơ động, linh hoạt, tự lực tự cường, đánh thắng mọi kẻ thù.”',
      
    ],
  },
  {
    number: '03',
    title: 'NHỮNG DẤU ẤN TIÊU BIỂU',
    paragraphs: ['Trong cuộc kháng chiến chống Mỹ, Sư đoàn 5 đã tham gia nhiều trận đánh và chiến dịch quan trọng, lập nhiều chiến công trên chiến trường Nam Bộ, góp phần vào thắng lợi của cuộc Tổng tiến công và nổi dậy mùa Xuân năm 1975.',
      'Sau năm 1975, Sư đoàn tiếp tục thực hiện nhiệm vụ bảo vệ biên giới Tây Nam của Tổ quốc và làm nghĩa vụ quốc tế tại Campuchia, tiếp tục khẳng định bản lĩnh, tinh thần trách nhiệm và truyền thống của đơn vị.'
    ],
   
  },
  {
    number: '04',
    title: 'PHÁT HUY TRUYỀN THỐNG TRONG THỜI KỲ MỚI',
    paragraphs: [
      'Trong thời bình, Sư đoàn 5 tiếp tục thực hiện nhiệm vụ huấn luyện, sẵn sàng chiến đấu, xây dựng chính quy, quản lý kỷ luật và bảo vệ Tổ quốc. Đơn vị đồng thời tham gia nhiều nhiệm vụ đột xuất, trong đó có hỗ trợ địa phương phòng, chống dịch Covid-19 năm 2021.',
      'Trải qua quá trình xây dựng, chiến đấu và trưởng thành, Sư đoàn 5 hai lần được tuyên dương danh hiệu Anh hùng Lực lượng vũ trang nhân dân cùng nhiều phần thưởng cao quý. Truyền thống của Sư đoàn được khái quát: “Đoàn kết, trung dũng, cơ động, linh hoạt, tự lực tự cường, đánh thắng mọi kẻ thù.”',
    ],
  },
];

export default function AboutHistoryPage() {
  return (
    <>
      <PageBanner
        img={historyBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giới thiệu', href: '/gioi-thieu/' },
          { label: 'Lịch sử và truyền thống Sư đoàn 5' },
        ]}
      />

      <div className="container history-title-wrap">
        <h1 className="tt-center history-title-wrap__tt">Lịch sử và truyền thống Sư đoàn 5</h1>
      </div>

      <main>
        <div className="history-page">
         

          <div className="history-card">
            {sections.map((section, index) => (
              <section
                key={section.number}
                className={`history-section${index % 2 === 1 ? ' history-section--reverse' : ''}`}
              >
                <div className="history-section__text">
                  <span className="history-section__number">{section.number}</span>
                  <h2 className="history-section__title">{section.title}</h2>
                  {section.paragraphs.map((p) => (
                    <p key={p} className="about-article__placeholder">
                      {p}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="history-section__list">
                      {section.list.map((item) => (
                        <li key={item} className="about-article__placeholder">
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="history-section__media">
                  {section.number === '01' ? (
                    <img src={img01} alt="01" className="history-section__image" />
                  ) : section.number === '02' ? (
                    <img src={img02} alt="02" className="history-section__image" />
                  ) : section.number === '03' ? (
                    <div className="history-section__image-grid">
                      <img src={img031} alt="03.1" className="history-section__grid-image" />
                      <img src={img032} alt="03.2" className="history-section__grid-image" />
                      <img src={img033} alt="03.3" className="history-section__grid-image" />
                      <img src={img034} alt="03.4" className="history-section__grid-image" />
                    </div>
                  ) : section.number === '04' ? (
                    <div className="history-section__image-grid">
                      <img src={img041} alt="04.1" className="history-section__grid-image" />
                      <img src={img042} alt="04.2" className="history-section__grid-image" />
                      <img src={img043} alt="04.3" className="history-section__grid-image" />
                      <img src={img044} alt="04.4" className="history-section__grid-image" />
                    </div>
                  ) : (
                    <PlaceholderMedia label={`Ảnh minh hoạ mục ${section.number}`} ratio="4 / 3" />
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}