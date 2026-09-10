import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, UserPlus, ArrowRight } from "lucide-react";
import "./LoginForm.css";

interface LoginFormProps {
  onSubmit?: (username: string, password: string) => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
}

export default function LoginForm({
  onSubmit,
  onRegisterClick,
  onForgotPasswordClick,
}: LoginFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(username, password);
  };

  const handleRegisterClick = () => {
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      navigate("/dang-ky");
    }
  };

  return (
    <div className="login-form">
      <h2 className="login-form__title">THÔNG TIN TÀI KHOẢN</h2>

      <form onSubmit={handleSubmit} className="login-form__form">
        <div className="login-form__input-group">
          <User className="login-form__icon" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-form__input"
          />
        </div>

        <div className="login-form__input-group">
          <Lock className="login-form__icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form__input"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="login-form__password-toggle"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <button type="submit" className="login-form__submit-btn">
          Đăng nhập
        </button>
      </form>

      <div className="login-form__divider">
        <div className="login-form__divider-line" />
        <span className="login-form__divider-text">Hoặc</span>
        <div className="login-form__divider-line" />
      </div>

      <button
        type="button"
        onClick={handleRegisterClick}
        className="login-form__register-btn"
      >
        <UserPlus className="w-4 h-4" />
        Đăng ký tài khoản
      </button>

      <div className="text-center" style={{ marginTop: "24px" }}>
        <button
          type="button"
          onClick={onForgotPasswordClick}
          className="login-form__forgot-link"
        >
          Quên mật khẩu?
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}