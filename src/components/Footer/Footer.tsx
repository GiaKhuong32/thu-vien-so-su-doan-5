import { footerAboutLinks, footerInfoLinks } from '../../data/navigation';
import './Footer.css';
import logo from '../../assets/skin/logo.png';

const LOGO = logo;

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer-col footer-col--logo">
          <a className="logo-full" href="/" title="Thư viện số Nguyễn An Ninh">
            <img className="logo" src={LOGO} alt="Thư viện số Nguyễn An Ninh" />
          </a>
          <div className="footer__brand font-display">Ban Thông tin sư đoàn 5</div>
          <div className="footer__row">
            Đại diện: <strong>Đồng chí - Ngô Văn Nghĩa</strong>
          </div>
          <div className="footer__row">
            Cấp bậc: <strong>Trung tá QNCN</strong>
          </div>
          <div className="footer__row">
            Chức vụ: <strong>Quản lý trạm bdkt cấp 3</strong>
          </div>
        </div>

        <div className="footer-col footer-col--contact">
          <div className="footer-tt">Thông tin liên hệ</div>
          <ul className="footer__contact">
            <li>
              <span className="picon" aria-hidden="true">
                <PinIcon />
              </span>
              <span>Sư đoàn 5 (Quân khu 7) , TP.Tây Ninh</span>
            </li>
            <li>
              <span className="picon" aria-hidden="true">
                <MailIcon />
              </span>
              <a href="">thuviensosd5@gmail.com</a>
            </li>
            <li>
              <span className="picon" aria-hidden="true">
                <GlobeIcon />
              </span>
              <a href="">tvssd5.com</a>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-tt">Thông tin</div>
          <ul className="footer__links">
            {footerInfoLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} title={l.label}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <div className="footer-tt">Giới thiệu về chúng tôi</div>
          <ul className="footer__links">
            {footerAboutLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} title={l.label}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">© 2026 Thư Viện Sư đoàn 5.</div>
      </div>
    </footer>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9Z" />
    </svg>
  );
}
