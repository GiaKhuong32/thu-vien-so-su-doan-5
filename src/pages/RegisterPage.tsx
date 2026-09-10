import React from "react";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import RegisterForm from "../components/auth/RegisterForm";
import "./RegisterPage.css";

export default function RegisterPage() {
  const handleRegister = (data: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log("Đăng ký:", data);
    // TODO: gọi API đăng ký thật ở đây
  };

  return (
    <div className="register-page">
      <AuthHeroPanel />

      <div className="register-page__right">
        <RegisterForm
          onSubmit={handleRegister}
          onLoginClick={() => console.log("Đi tới trang đăng nhập")}
        />

        <p className="register-page__footer">
          Copyright @ 2023 Quanglich. All right reserved
        </p>
      </div>
    </div>
  );
}