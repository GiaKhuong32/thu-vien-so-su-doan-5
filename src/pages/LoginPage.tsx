import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import LoginForm from "../components/auth/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      // Lưu username vào localStorage để hiển thị trong UserMenu
      localStorage.setItem('user_name', username);
      // Đăng nhập thành công, chuyển về trang chủ
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <AuthHeroPanel />

      <div className="login-page__right">
        <LoginForm
          onSubmit={handleLogin}
          onRegisterClick={() => navigate("/dang-ky")}
          error={error}
          loading={loading}
        />

        <p className="login-page__footer">
          Bản quyền © 2026 thuộc về Sư đoàn 5 - Quân khu 7. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}