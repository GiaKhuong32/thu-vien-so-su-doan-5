import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import InfoPane from '../components/InfoPane/InfoPane';
import { libraryBanner } from '../data/library';

export default function AboutMissionPage() {
  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Giới thiệu', href: '/gioi-thieu/' },
          { label: 'Chức năng và nhiệm vụ' },
        ]}
      />

      <main>
        <PageLayout sidebar={null}>
          <div className="container about-page">
            <div className="about-header">
              <h1 className="about-title">Chức năng và nhiệm vụ</h1>
              <p className="about-subtitle">
                Thư viện số Sư đoàn bộ binh 5 có chức năng và nhiệm vụ quan trọng trong việc bảo tồn, phát triển và truyền bá các giá trị lịch sử, văn hóa của dân tộc.
              </p>
            </div>

            <div className="about-banner">
              <img 
                src="/assets/images/about-mission-banner.jpg" 
                alt="Chức năng và nhiệm vụ"
                className="about-banner-image"
              />
            </div>

            <InfoPane title="Chức năng">
              <div className="about-content">
                <p>
                  Thư viện số Sư đoàn bộ binh 5 thực hiện các chức năng chính sau:
                </p>
                <ul className="about-list">
                  <li><strong>Sưu tầm và lưu giữ:</strong> Thu thập, bảo quản các tài liệu lịch sử, văn hóa, quân sự liên quan đến Sư đoàn 5 và khu vực Nam Bộ</li>
                  <li><strong>Số hóa tài liệu:</strong> Chuyển đổi tài liệu giấy sang định dạng số để bảo vệ và dễ dàng truy cập</li>
                  <li><strong>Phân loại và biên mục:</strong> Hệ thống hóa tài liệu theo chủ đề, thời gian, loại hình để dễ dàng tìm kiếm</li>
                  <li><strong>Cung cấp dịch vụ:</strong> Đưa tài liệu đến với người dùng, phục vụ nghiên cứu, giáo dục</li>
                  <li><strong>Kết nối nguồn lực:</strong> Tạo cầu nối giữa các cơ quan lưu trữ, nhà nghiên cứu và người sử dụng</li>
                </ul>
              </div>
            </InfoPane>

            <InfoPane title="Nhiệm vụ">
              <div className="about-content">
                <p>
                  Thư viện số Sư đoàn bộ binh 5 thực hiện các nhiệm vụ:
                </p>
                <ul className="about-list">
                  <li><strong>Bảo tồn di sản:</strong> Bảo vệ và phát huy các giá trị lịch sử, văn hóa của dân tộc</li>
                  <li><strong>Phục vụ nghiên cứu:</strong> Cung cấp tài liệu, thông tin cho các nhà nghiên cứu, học sinh</li>
                  <li><strong>Giáo dục truyền thống:</strong> Giáo dục thế hệ trẻ về lịch sử, truyền thống yêu nước</li>
                  <li><strong>Quảng bá hình ảnh:</strong> Tuyên truyền về thành tích, truyền thống của Sư đoàn 5</li>
                  <li><strong>Hợp tác quốc tế:</strong> Kết nối với các tổ chức lưu trữ quốc tế, khu vực</li>
                  <li><strong>Phát triển khoa học:</strong> Ứng dụng công nghệ số vào việc lưu trữ, quản lý tài liệu</li>
                </ul>
              </div>
            </InfoPane>

            <InfoPane title="Quy định sử dụng">
              <div className="about-content">
                <p>
                  Để sử dụng Thư viện số Sư đoàn bộ binh 5 hiệu quả, người dùng cần tuân thủ các quy định sau:
                </p>
                <ul className="about-list">
                  <li>Tôn trọng bản quyền của tài liệu, không sử dụng vào mục đích thương mại</li>
                  <li>Trích dẫn nguồn khi sử dụng tài liệu cho mục đích nghiên cứu, giáo dục</li>
                  <li>Bảo mật thông tin cá nhân, không chia sẻ thông tin trái phép</li>
                  <li>Sử dụng tài liệu đúng mục đích, không làm thay đổi nội dung sai lệch</li>
                  <li>Liên hệ quản trị khi phát hiện lỗi kỹ thuật hoặc nội dung không phù hợp</li>
                </ul>
              </div>
            </InfoPane>

            <div className="about-contact">
              <h2 className="about-section-title">Liên hệ</h2>
              <div className="contact-info">
                <p>Để biết thêm thông tin hoặc hỗ trợ, vui lòng liên hệ:</p>
                <ul className="about-list">
                  <li><strong>Email:</strong> thuviennguyenanninh@gmail.com</li>
                  <li><strong>Website:</strong> https://thuviennguyenanninh.vn</li>
                  <li><strong>Địa chỉ:</strong> 8661 Hoàng Quốc Việt, Phường Phú Mỹ, Quận 7, TP. Hồ Chí Minh</li>
                </ul>
              </div>
            </div>
          </div>
        </PageLayout>
      </main>
    </>
  );
}
