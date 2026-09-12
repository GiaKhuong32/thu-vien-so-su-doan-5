import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, UserPlus} from "lucide-react";
import "./LoginForm.css";

interface LoginFormProps {
  onSubmit?: (username: string, password: string) => void;
  onRegisterClick?: () => void;
  onForgotPasswordClick?: () => void;
  error?: string | null;
  loading?: boolean;
}

export default function LoginForm({
  onSubmit,
  onRegisterClick,
  error,
  loading,
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

      {error && (
        <div className="login-form__error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="login-form__form">
        <div className="login-form__input-group">
          <User className="login-form__icon" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="login-form__input"
            disabled={loading}
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
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="login-form__password-toggle"
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <button 
          type="submit" 
          className="login-form__submit-btn"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
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
        disabled={loading}
      >
        <UserPlus className="w-4 h-4" />
        Đăng ký tài khoản
      </button>

    
    </div>
  );
}