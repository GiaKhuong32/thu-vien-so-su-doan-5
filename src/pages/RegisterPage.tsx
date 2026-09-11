import { useNavigate } from "react-router-dom";
import AuthHeroPanel from "../components/auth/AuthHeroPanel";
import RegisterForm from "../components/auth/RegisterForm";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = (data: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log("Đăng ký:", data);
    navigate("/dang-nhap");
  };

  return (
    <div className="register-page">
      <AuthHeroPanel />

      <div className="register-page__right">
        <RegisterForm onSubmit={handleRegister} />

        <p className="register-page__footer">
          Bản quyền © 2026 thuộc về Sư đoàn 5 - Quân khu 7. Bảo lưu mọi quyền.
        </p>
      </div>
    </div>
  );
}