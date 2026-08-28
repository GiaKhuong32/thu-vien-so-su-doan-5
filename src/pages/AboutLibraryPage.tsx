import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import InfoPane from '../components/InfoPane/InfoPane';
import { libraryBanner } from '../data/library';
import './AboutLibraryPage.css';

export default function AboutLibraryPage() {
  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giới thiệu', href: '/gioi-thieu/' },
          { label: 'Thư viện số Sư đoàn bộ binh 5' },
        ]}
      />

      <main>
        <PageLayout sidebar={null}>
          <div className="container about-page">
            <div className="about-header">
              <h1 className="about-title">Thư viện số Sư đoàn bộ binh 5 - Chuyên đề Nam Bộ</h1>
              <p className="about-subtitle">
                Thư viện số Sư đoàn bộ binh 5 được thành lập với mục tiêu lưu giữ và phát triển di sản văn hóa, lịch sử của khu vực Nam Bộ Việt Nam, đặc biệt là các tài liệu liên quan đến cuộc kháng chiến chống Pháp và Mỹ.
              </p>
            </div>

            <div className="about-banner">
              <img 
                src="/assets/images/about-library-banner.jpg" 
                alt="Thư viện số Sư đoàn bộ binh 5"
                className="about-banner-image"
              />
              <div className="about-banner-credit">
                <a href="https://thuviennguyenanninh.vn" target="_blank" rel="noopener noreferrer">
                  thuviennguyenanninh.vn
                </a>
              </div>
            </div>

            <InfoPane title="1. Vì sao là THƯ VIỆN SỐ?">
              <div className="about-content">
                <p>
                  Thư viện số Sư đoàn bộ binh 5 được hình thành từ nhu cầu cấp thiết trong việc bảo tồn và phát huy các giá trị lịch sử, văn hóa của dân tộc. Với kho tài liệu phong phú về lịch sử quân sự, văn hóa, xã hội của khu vực Nam Bộ, thư viện số này đóng vai trò quan trọng trong việc:
                </p>
                <ul className="about-list">
                  <li>Lưu giữ các tài liệu gốc, hình ảnh, phim tư liệu quý giá về lịch sử kháng chiến</li>
                  <li>Số hóa các tài liệu giấy để bảo vệ và dễ dàng truy cập</li>
                  <li>Tạo nền tảng nghiên cứu cho các nhà sử học, nhà văn hóa</li>
                  <li>Giáo dục thế hệ trẻ về truyền thống yêu nước và tinh thần cách mạng</li>
                  <li>Kết nối người dùng với nguồn tài liệu lịch sử phong phú</li>
                </ul>
              </div>
            </InfoPane>

            <InfoPane title="2. Việc đặt tên NGUYỄN AN NINH và chủ đề NAM BỘ?">
              <div className="about-content">
                <p>
                  Nguyễn An Ninh (1900-1945) là một nhà báo, nhà văn, nhà cách mạng kiệt xuất của Việt Nam. Ông được biết đến với tư cách là một trí thức yêu nước, luôn kiên định đấu tranh cho quyền độc lập tự do của dân tộc.
                </p>
                <p>
                  Việc đặt tên thư viện số mang tên Nguyễn An Ninh nhằm tôn vinh tinh thần yêu nước, tinh thần cách mạng của ông. Đồng thời, chủ đề "Nam Bộ" được chọn vì:
                </p>
                <ul className="about-list">
                  <li>Nam Bộ là nơi diễn ra nhiều sự kiện lịch sử quan trọng trong cuộc kháng chiến chống Pháp và Mỹ</li>
                  <li>Nam Bộ là cái nôi của văn hóa, lịch sử phong phú của dân tộc Việt Nam</li>
                  <li>Nhiều nhân vật lịch sử, văn hóa tiêu biểu của Nam Bộ đã để lại dấu ấn sâu sắc</li>
                  <li>Sư đoàn bộ binh 5 có truyền thống gắn liền với vùng đất Nam Bộ</li>
                </ul>
                <p>
                  Thư viện số Nguyễn An Ninh - Chuyên đề Nam Bộ không chỉ là nơi lưu giữ tài liệu mà còn là cầu nối giữa quá khứ và hiện tại, giữa truyền thống và đổi mới.
                </p>
              </div>
            </InfoPane>

            <div className="about-members-section">
              <h2 className="about-section-title">CÁC THÀNH VIÊN SÁNG LẬP RA THƯ VIỆN SỐ NGUYỄN AN NINH</h2>
              <div className="members-grid">
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member1.jpg" alt="Thành viên 1" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Nguyễn Văn A</h3>
                    <p className="member-title">Chủ tịch Hội đồng</p>
                    <p className="member-affiliation">Sư đoàn bộ binh 5</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member2.jpg" alt="Thành viên 2" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Trần Thị B</h3>
                    <p className="member-title">Phó Chủ tịch</p>
                    <p className="member-affiliation">Sư đoàn bộ binh 5</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member3.jpg" alt="Thành viên 3" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Lê Văn C</h3>
                    <p className="member-title">Thư ký</p>
                    <p className="member-affiliation">Sư đoàn bộ binh 5</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member4.jpg" alt="Thành viên 4" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Phạm Thị D</h3>
                    <p className="member-title">Thủ quỹ</p>
                    <p className="member-affiliation">Sư đoàn bộ binh 5</p>
                  </div>
                </div>
                <div className="member-card">
                  <div className="member-image">
                    <img src="/assets/images/member5.jpg" alt="Thành viên 5" />
                  </div>
                  <div className="member-info">
                    <h3 className="member-name">Hoàng Văn E</h3>
                    <p className="member-title">Ủy viên</p>
                    <p className="member-affiliation">Sư đoàn bộ binh 5</p>
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
