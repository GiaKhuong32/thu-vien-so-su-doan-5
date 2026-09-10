import React from "react";
import "./AuthHeroPanel.css";

export default function AuthHeroPanel() {
  return (
    <div className="auth-hero-panel">
      <div className="auth-hero-panel__bg" />
      <div className="auth-hero-panel__overlay" />

      <div className="auth-hero-panel__content">
        <h1 className="auth-hero-panel__title">
          Hệ thống <span>Thư viện điện tử</span> trường học
        </h1>
        <p className="auth-hero-panel__description">
          Quản lý các tài liệu, bài giảng, hoạt động, hình ảnh của trường
          thông qua các tài liệu dạng Video, hình ảnh, audio, e-Learning,
          Quản lý mượn sách từ hệ thống quản lý thư viện truyền thống
        </p>

        <div className="auth-hero-panel__books">
          <div className="auth-hero-panel__book auth-hero-panel__book--blue">
            <span className="auth-hero-panel__book-label">
              Time to
              <br />
              Learn More
            </span>
            <div className="auth-hero-panel__book-badge" />
          </div>
          <div className="auth-hero-panel__book auth-hero-panel__book--green">
            <span className="auth-hero-panel__book-label-bold">
              Learning is
              <br />
              Fun
            </span>
            <div className="auth-hero-panel__book-tag">
              <span>ABC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}