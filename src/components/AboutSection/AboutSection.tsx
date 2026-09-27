import './AboutSection.css';
import bgAbout from '../../assets/skin/bg-about.png';
import homeVideo from '../../assets/video/SƯ ĐOÀN 5 _ SỨC BẬT TỪ XÂY DỰNG ĐIỂM VỮNG MẠNH TOÀN DIỆN.mp4';

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
            <video
              className="home-about-video"
              controls
              preload="metadata"
              playsInline
              poster="/images/home-video-cover.jfif"
            >
              <source src={homeVideo} type="video/mp4" />
              Trình duyệt không hỗ trợ phát video.
            </video>
          </div>
        </div>

        <div className="section-about__text reveal">
          <h1 id="about-tt" className="tt-center section-about__tt">
            Về Thư viện số Sư đoàn 5 - Quả đấm thép miền Đông Nam Bộ
          </h1>

          <p className="section-about__desc">
            Thư viện số Sư đoàn 5 - Lực lượng Anh hùng là nền tảng lưu trữ và
            khai thác tài nguyên số, được xây dựng nhằm phục vụ công tác học
            tập, nghiên cứu, giáo dục chính trị và giáo dục truyền thống cho
            cán bộ, chiến sĩ trong đơn vị. Thư viện tập hợp và số hóa các
            nguồn tài liệu về lịch sử, truyền thống, quá trình xây dựng, chiến
            đấu và trưởng thành của Sư đoàn 5, cùng các tài liệu phục vụ hoạt
            động học tập và nghiên cứu.
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
