
import loginImage from "../../assets/images/login.jpg";
import giaoTrinh1 from "../../assets/images/Giáo trình 1.jpg";
import giaoTrinh2 from "../../assets/images/Giáo trình 2.jpg";
import "./AuthHeroPanel.css";

export default function AuthHeroPanel() {
  return (
    <div className="auth-hero-panel">
      <div 
        className="auth-hero-panel__bg" 
        style={{ backgroundImage: `url(${loginImage})` }}
      />
      <div className="auth-hero-panel__overlay" />

      <div className="auth-hero-panel__content">
        <h1 className="auth-hero-panel__title">
          Hệ thống <span>Thư viện số</span> Sư đoàn 5
        </h1>
        <p className="auth-hero-panel__description">
          Quản lý các tài liệu huấn luyện, chính trị hình ảnh của trường
          thông qua các tài liệu dạng Video, đọc sách, audio
        </p>

        <div className="auth-hero-panel__books">
          <div className="auth-hero-panel__book auth-hero-panel__book--blue">
            <img 
              src={giaoTrinh1} 
              alt="Giáo trình 1" 
              className="auth-hero-panel__book-image"
            />
          </div>
          <div className="auth-hero-panel__book auth-hero-panel__book--green">
            <img 
              src={giaoTrinh2} 
              alt="Giáo trình 2" 
              className="auth-hero-panel__book-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}