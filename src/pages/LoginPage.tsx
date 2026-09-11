import { useNavigate } from "react-router-dom";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import LoginForm from "../components/auth/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {
    console.log("Đăng nhập:", { username, password });
  
  };

  return (
    <div className="login-page">
      <AuthHeroPanel />

      <div className="login-page__right">
        <LoginForm
          onSubmit={handleLogin}
          onRegisterClick={() => navigate("/dang-ky")}
          onForgotPasswordClick={() => console.log("Đi tới trang quên mật khẩu")}
        />

        <p className="login-page__footer">
          Bản quyền © 2026 thuộc về Sư đoàn 5 - Quân khu 7. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}