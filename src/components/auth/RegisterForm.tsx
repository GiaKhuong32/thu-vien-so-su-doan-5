import React, { useMemo, useState } from "react";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
  Check,
} from "lucide-react";
import "./RegisterForm.css";

interface RegisterFormProps {
  onSubmit?: (data: {
    username: string;
    password: string;
    confirmPassword: string;
  }) => void;
}

type StrengthLevel = {
  label: string;
  colorClass: string;
  score: number; 
};

function getPasswordStrength(password: string): StrengthLevel {
  if (!password) return { label: "", colorClass: "", score: 0 };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  const levels: Record<number, StrengthLevel> = {
    0: { label: "Rất yếu", colorClass: "register-form__strength-segment--red", score: 0 },
    1: { label: "Yếu", colorClass: "register-form__strength-segment--red", score: 1 },
    2: { label: "Trung bình", colorClass: "register-form__strength-segment--amber", score: 2 },
    3: { label: "Trung bình", colorClass: "register-form__strength-segment--emerald", score: 3 },
    4: { label: "Mạnh", colorClass: "register-form__strength-segment--emerald", score: 4 },
  };

  return levels[score];
}

export default function RegisterForm({
  onSubmit,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const requirements = useMemo(
    () => [
      { label: "Tối thiểu 8 ký tự", met: password.length >= 8 },
      {
        label: "Bao gồm chữ hoa và chữ thường",
        met: /[a-z]/.test(password) && /[A-Z]/.test(password),
      },
      {
        label: "Có ít nhất 1 số và 1 ký tự đặc biệt (!@#$%^&*)",
        met: /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password),
      },
    ],
    [password]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ username, password, confirmPassword });
  };

  const getStrengthValueClass = () => {
    if (strength.score <= 1) return "register-form__strength-value--weak";
    if (strength.score <= 3) return "register-form__strength-value--medium";
    return "register-form__strength-value--strong";
  };

  return (
    <div className="register-form">
      <h2 className="register-form__title">Đăng ký tài khoản</h2>
      <p className="register-form__subtitle">
        Tạo tài khoản để bắt đầu trải nghiệm thư viện điện tử
      </p>

      <form onSubmit={handleSubmit} className="register-form__form">
        <div className="register-form__input-group">
          <User className="register-form__icon" />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="register-form__input"
          />
        </div>

        <div>
          <div className="register-form__input-group">
            <Lock className="register-form__icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-form__input"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="register-form__password-toggle"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {password && (
            <div className="register-form__strength">
              <div className="register-form__strength-header">
                <span className="register-form__strength-label">
                  Độ mạnh mật khẩu
                </span>
                <span className={`register-form__strength-value ${getStrengthValueClass()}`}>
                  {strength.label}
                </span>
              </div>
              <div className="register-form__strength-bar">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className={`register-form__strength-segment ${
                      i < strength.score * 1.5
                        ? strength.colorClass
                        : ""
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {password && (
          <div className="register-form__requirements">
            <div className="register-form__requirements-header">
              <ShieldCheck className="w-4 h-4" style={{ color: "#059669" }} />
              <span className="register-form__requirements-title">
                Yêu cầu mật khẩu mạnh
              </span>
            </div>
            <ul className="register-form__requirements-list">
              {requirements.map((req) => (
                <li
                  key={req.label}
                  className={`register-form__requirement ${
                    req.met ? "register-form__requirement--met" : "register-form__requirement--unmet"
                  }`}
                >
                  <Check
                    className={`register-form__requirement-icon ${
                      req.met ? "register-form__requirement-icon--met" : "register-form__requirement-icon--unmet"
                    }`}
                  />
                  {req.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="register-form__input-group">
          <Lock className="register-form__icon" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác thực mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="register-form__input"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((s) => !s)}
            className="register-form__password-toggle"
            aria-label={
              showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
            }
          >
            {showConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        <button type="submit" className="register-form__submit-btn">
          <UserPlus className="w-4 h-4" />
          Đăng ký tài khoản
        </button>
      </form>

      <div className="register-form__footer">
        Đã có tài khoản? Quay lại trang đăng nhập
      </div>
    </div>
  );
}