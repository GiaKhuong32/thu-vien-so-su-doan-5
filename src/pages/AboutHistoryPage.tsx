import PageBanner from '../components/PageBanner/PageBanner';
import PlaceholderMedia from '../components/PlaceholderMedia/PlaceholderMedia';
import { aboutBanner } from '../data/library';
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
      '[Nội dung: mốc thời gian thành lập, đơn vị chủ quản, nhiệm vụ ban đầu được giao khi mới thành lập.]',
      '[Nội dung: các giai đoạn phát triển chính, những dấu mốc quan trọng trong quá trình xây dựng và trưởng thành.]',
    ],
  },
  {
    number: '02',
    title: 'TRUYỀN THỐNG ANH HÙNG',
    paragraphs: ['[Nội dung: khái quát về truyền thống được hun đúc qua nhiều thế hệ cán bộ, chiến sĩ.]'],
    list: [
      '[Nội dung: phẩm chất truyền thống 1]',
      '[Nội dung: phẩm chất truyền thống 2]',
      '[Nội dung: phẩm chất truyền thống 3]',
      '[Nội dung: phẩm chất truyền thống 4]',
    ],
  },
  {
    number: '03',
    title: 'NHỮNG DẤU ẤN TIÊU BIỂU',
    paragraphs: ['[Nội dung: các chiến công, sự kiện, cột mốc tiêu biểu trong quá trình xây dựng và chiến đấu.]'],
    list: [
      '[Nội dung: dấu ấn tiêu biểu 1]',
      '[Nội dung: dấu ấn tiêu biểu 2]',
      '[Nội dung: dấu ấn tiêu biểu 3]',
    ],
  },
  {
    number: '04',
    title: 'GIÁ TRỊ TRUYỀN THỐNG HÔM NAY',
    paragraphs: [
      '[Nội dung: truyền thống được kế thừa, phát huy trong công tác huấn luyện, xây dựng đơn vị hiện nay.]',
      '[Nội dung: định hướng, mục tiêu phát triển gắn với giá trị truyền thống trong giai đoạn mới.]',
    ],
  },
];

export default function AboutHistoryPage() {
  return (
    <>
      <PageBanner
        img={aboutBanner}
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
          <div className="history-intro">
            <p>
              [Nội dung mở đầu: giới thiệu khái quát về quá trình hình thành và bối cảnh ra đời của đơn vị.]
            </p>
            <p>
              [Nội dung: khái quát chặng đường xây dựng, chiến đấu và trưởng thành, gắn với truyền thống{' '}
              <span className="history-highlight">
                “[Khẩu hiệu truyền thống của đơn vị]”
              </span>
              .]
            </p>
          </div>

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
                  <PlaceholderMedia label={`Ảnh minh hoạ mục ${section.number}`} ratio="4 / 3" />
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}