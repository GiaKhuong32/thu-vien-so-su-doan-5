import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import InfoPane from '../components/InfoPane/InfoPane';
import { libraryBanner } from '../data/library';

export default function AboutHistoryPage() {
  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giới thiệu', href: '/gioi-thieu/' },
          { label: 'Lịch sử và truyền thống Sư đoàn 5' },
        ]}
      />

      <main>
        <PageLayout sidebar={null}>
          <div className="container about-page">
            <div className="about-header">
              <h1 className="about-title">Lịch sử và truyền thống Sư đoàn 5</h1>
              <p className="about-subtitle">
                Sư đoàn bộ binh 5 có bề dày lịch sử hào hùng trong cuộc kháng chiến chống Pháp và Mỹ, đóng góp quan trọng vào công cuộc bảo vệ và thống nhất đất nước.
              </p>
            </div>

            <div className="about-banner">
              <img 
                src="/assets/images/about-history-banner.jpg" 
                alt="Lịch sử và truyền thống Sư đoàn 5"
                className="about-banner-image"
              />
            </div>

            <InfoPane title="Lịch sử hình thành">
              <div className="about-content">
                <p>
                  Sư đoàn bộ binh 5 được thành lập trong giai đoạn khốc liệt nhất của cuộc kháng chiến chống Pháp và Mỹ, với nhiệm vụ bảo vệ vùng đất Nam Bộ - một trong những vị trí chiến lược quan trọng nhất của miền Nam.
                </p>
                <p>
                  Thông qua các chiến dịch lịch sử, Sư đoàn bộ binh 5 đã lập nên nhiều chiến công vẻ vang, góp phần vào thắng lợi của dân tộc. Các chiến sĩ của Sư đoàn 5 đã thể hiện tinh thần dũng cảm, kiên cường, hy sinh vì độc lập tự do của Tổ quốc.
                </p>
              </div>
            </InfoPane>

            <InfoPane title="Truyền thống anh hùng">
              <div className="about-content">
                <p>
                  Truyền thống của Sư đoàn bộ binh 5 được xây dựng và phát triển qua nhiều thế hệ chiến sĩ, bao gồm:
                </p>
                <ul className="about-list">
                  <li>Tinh thần yêu nước nồng nàn, kiên cường đấu tranh</li>
                  <li>Khả năng chiến đấu xuất sắc trong mọi điều kiện</li>
                  <li>Sự đoàn kết, gắn bó giữa các đơn vị</li>
                  <li>Tinh thần kỷ luật thép, tuyệt đối phục tùng mệnh lệnh</li>
                  <li>Trách nhiệm với dân, thương yêu đồng đội</li>
                </ul>
                <p>
                  Truyền thống này tiếp tục được phát huy và gìn giữ trong thời bình, trở thành nền tảng cho sự phát triển của Sư đoàn trong giai đoạn mới.
                </p>
              </div>
            </InfoPane>

            <InfoPane title="Thành tích và đóng góp">
              <div className="about-content">
                <p>
                  Trong quá trình tồn tại và phát triển, Sư đoàn bộ binh 5 đã đạt được nhiều thành tích xuất sắc:
                </p>
                <ul className="about-list">
                  <li>Nhiều đơn vị, cá nhân được phong tặng danh hiệu Dũng sĩ, Anh hùng</li>
                  <li>Được nhà nước ghi nhận và biểu dương qua các huân chương, bằng khen</li>
                  <li>Góp phần vào việc đào tạo cán bộ quân sự cho quân đội và địa phương</li>
                  <li>Tham gia các hoạt động an ninh quốc phòng, bảo vệ chủ quyền</li>
                  <li>Xây dựng mối quan hệ đoàn kết với quân và dân</li>
                </ul>
              </div>
            </InfoPane>
          </div>
        </PageLayout>
      </main>
    </>
  );
}
