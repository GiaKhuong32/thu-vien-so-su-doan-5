import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import InfoPane from '../components/InfoPane/InfoPane';
import { aboutBanner } from '../data/library';
import './AboutLibraryPage.css';

export default function AboutLibraryPage() {
  return (
    <>
      <PageBanner
        img={aboutBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giới thiệu', href: '/gioi-thieu/' },
          { label: 'Thư viện số Sư đoàn bộ binh 5' },
        ]}
      />

      <div className="container about-title-wrap">
        <h1 className="tt-center about-title-wrap__tt">Thư viện số Sư đoàn 5</h1>
      </div>

      <main>
        <PageLayout sidebar={null}>
          <div className="container about-page">
          

            <InfoPane title="1. Đôi nét về thư viện số Sư Đoàn 5">
              <div className="about-content">
                <p>
                  <span className="highlight-text">Thư viện số Sư đoàn 5</span> được xây dựng nhằm từng bước chuyển đổi phương thức lưu trữ, quản lý và khai thác tài liệu từ truyền thống sang môi trường số. Hệ thống tập trung các nguồn tài liệu phục vụ học tập, nghiên cứu, huấn luyện, giáo dục chính trị và nhu cầu đọc của cán bộ, chiến sĩ.
Không chỉ là nơi lưu giữ tài liệu, Thư viện số còn tạo điều kiện để người dùng tiếp cận tri thức thuận tiện hơn thông qua đọc sách trực tuyến và nghe sách nói, góp phần hình thành môi trường học tập và khai thác thông tin hiện đại trong đơn vị. Thư viện số mang đến những giá trị và tiện ích nổi bật như:
                </p>
                <ul className="about-list">
                  <li>Số hóa và bảo tồn nguồn tài liệu của đơn vị</li>
                  <li>Tra cứu, tìm kiếm và khai thác tài liệu thuận tiện.</li>
                  <li>Đọc sách, tài liệu trực tuyến ngay trên hệ thống.</li>
                  <li>Nghe sách nói, tài liệu âm thanh mọi lúc, thuận tiện trong quá trình học tập.</li>
                  <li>Phục vụ công tác giáo dục chính trị, tư tưởng và truyền thống.</li>
                </ul>
              </div>
            </InfoPane>

            <InfoPane title="2. Giá trị của Thư viện số đối với cán bộ, chiến sĩ">
              <div className="about-content">
                <p>
                  Thư viện số không chỉ là nơi lưu trữ tài liệu mà còn là không gian tri thức số, hỗ trợ cán bộ, chiến sĩ học tập, nghiên cứu và nâng cao đời sống văn hóa tinh thần. Thông qua các hình thức đọc sách và nghe sách nói trực tuyến, người dùng có thể tiếp cận nguồn tri thức một cách linh hoạt và thuận tiện hơn.
                </p>
                <p>
                  Qua đó, Thư viện số góp phần gìn giữ truyền thống, kết nối tri thức, phục vụ học tập và thúc đẩy chuyển đổi số trong Sư đoàn 5, hướng tới xây dựng một môi trường khai thác tài liệu hiện đại, khoa học và hiệu quả.
              </p>
              </div>
            </InfoPane>

            <div className="about-members-section">
              <h2 className="about-section-title">CÁC THÀNH VIÊN SÁNG LẬP RA THƯ VIỆN SỐ SƯ ĐOÀN 5</h2>
              <div className="members-grid">
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member1.jpg" alt="Thành viên 1" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Ngô Văn Nghĩa</h3>
                    <p className="member-title">Quản lý trạm bdkt</p>
                    <p className="member-affiliation">Sư đoàn 5/QK7</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member2.jpg" alt="Thành viên 2" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Trần Thanh Hải</h3>
                    <p className="member-title">Trợ lý thông tin</p>
                    <p className="member-affiliation">Sư đoàn 5/QK7</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member3.jpg" alt="Thành viên 3" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Phạm Thành Phát</h3>
                    <p className="member-title">Nhân viên trạm bdkt</p>
                    <p className="member-affiliation">Sư đoàn 5/QK7</p>
                  </div>
                </div>
          
              </div>
            </div>
          </div>
        </PageLayout>
      </main>
    </>
  );
}