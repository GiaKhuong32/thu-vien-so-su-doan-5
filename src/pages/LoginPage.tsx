import React from "react";

import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import LoginForm from "../components/auth/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
  const handleLogin = (username: string, password: string) => {
    console.log("Đăng nhập:", { username, password });
    // TODO: gọi API đăng nhập thật ở đây
  };

  return (
    <div className="login-page">
      <AuthHeroPanel />

      <div className="login-page__right">
        <LoginForm
          onSubmit={handleLogin}
          onRegisterClick={() => console.log("Đi tới trang đăng ký")}
          onForgotPasswordClick={() => console.log("Đi tới trang quên mật khẩu")}
        />

        <p className="login-page__footer">
          Copyright @ 2023 Quanglich. All right reserved
        </p>
      </div>
    </div>
  );
}