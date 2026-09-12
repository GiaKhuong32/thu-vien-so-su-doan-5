import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import RegisterForm from "../components/auth/RegisterForm";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError(null);
    setLoading(true);

    try {
      await register(data);
      // Đăng ký thành công, tự động chuyển về trang đăng nhập
      navigate("/dang-nhap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <AuthHeroPanel />

      <div className="register-page__right">
        <RegisterForm
          onSubmit={handleRegister}
          error={error}
          loading={loading}
        />

        <p className="register-page__footer">
          Bản quyền © 2026 thuộc về Sư đoàn 5 - Quân khu 7. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}