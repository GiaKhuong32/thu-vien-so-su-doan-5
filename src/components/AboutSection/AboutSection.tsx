import './AboutSection.css';
import bgAbout from '../../assets/skin/bg-about.png';
const YOUTUBE_ID = 'IrnW4-kJUg4';

export default function AboutSection() {
  return (
     <section
      className="section-about"
      aria-labelledby="about-tt"
      style={{ backgroundImage: `url(${bgAbout})` }}
    >
      <div className="container section-about__inner">
        <div className="section-about__video reveal">
          <div className="video-frame">
           <iframe
  src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}`}
  title="Sư đoàn 5 | Sức bật từ xây dựng điểm vững mạnh toàn diện"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  loading="lazy"
/>
          </div>
        </div>

        <div className="section-about__text reveal">
          <h1 id="about-tt" className="tt-center section-about__tt">
            Về Thư viện số Sư đoàn 5 - Quả đấm thép miền Đông Nam Bộ
          </h1>
          <p className="section-about__desc">
            Thư viện số Sư đoàn 5 - Lực lượng Anh hùng là nền tảng lưu trữ và khai thác
  tài nguyên số, được xây dựng nhằm phục vụ công tác học tập, nghiên cứu,
  giáo dục chính trị và giáo dục truyền thống cho cán bộ, chiến sĩ trong đơn vị.
  Thư viện tập hợp và số hóa các nguồn tài liệu về lịch sử, truyền thống,
  quá trình xây dựng, chiến đấu và trưởng thành của Sư đoàn 5, cùng các tài liệu
  phục vụ hoạt động học tập và nghiên cứu. Qua đó, góp phần lưu giữ những giá trị
  lịch sử, phát huy truyền thống đơn vị và tạo điều kiện thuận lợi để cán bộ,
  chiến sĩ tiếp cận, tra cứu và khai thác tài liệu một cách nhanh chóng, hiệu quả.
          </p>
          <a
            className="btn btn-primary"
            href="/gioi-thieu/thu-vien-so-nguyen-an-ninh-chuyen-de-nam-bo.html"
            target="_blank"
            rel="noopener"
          >
            Tìm hiểu thêm
          </a>
        </div>
      </div>
    </section>
  );
}
