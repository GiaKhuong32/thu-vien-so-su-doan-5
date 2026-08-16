import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { mainMenu, type MenuItem } from '../../data/navigation';
import './Navbar.css';
import logo from '../../assets/skin/logo.png';

const LOGO = logo;

function DesktopItem({ item }: { item: MenuItem }) {
  const hasChildren = !!item.children?.length;
  return (
    <li className={`nav-item${hasChildren ? ' has-sub' : ''}`}>
      <Link to={item.href} title={item.label}>
        <span>{item.label}</span>
        {hasChildren && <i className="caret" aria-hidden="true" />}
      </Link>
      {hasChildren && (
        <ul className="nav-sub">
          {item.children!.map((child) => (
            <li key={child.href} className={child.children?.length ? 'has-sub' : ''}>
              <Link to={child.href} title={child.label}>
                <span>{child.label}</span>
                {!!child.children?.length && <i className="caret caret-right" aria-hidden="true" />}
              </Link>
              {!!child.children?.length && (
                <ul className="nav-sub nav-sub--deep">
                  {child.children.map((leaf) => (
                    <li key={leaf.href}>
                      <Link to={leaf.href} title={leaf.label}>
                        <span>{leaf.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function MobileItem({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.length;

  return (
    <li className={open ? 'is-open' : ''}>
      <div className="m-row">
        <Link to={item.href} title={item.label}>
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            className="m-toggle"
            aria-expanded={open}
            aria-label={`Mở ${item.label}`}
            onClick={() => setOpen((v) => !v)}
          >
            <i className="caret" aria-hidden="true" />
          </button>
        )}
      </div>
      {hasChildren && (
        <ul className="m-sub" hidden={!open}>
          {item.children!.map((child) => (
            <MobileItem key={child.href} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenuOpen(false);
      setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`header${stuck ? ' is-stuck' : ''}`} id="header">
      <div className="container header-inner">
        <button
          type="button"
          className={`btn-menu${menuOpen ? ' is-active' : ''}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className="line" />
          <span className="line" />
          <span className="line" />
        </button>

        <Link className="logo-full" to="/" title="Trang chủ">
          <img className="logo" src={LOGO} alt="Thư viện số Nguyễn An Ninh" />
        </Link>

        <nav className="nav-desktop" aria-label="Menu chính">
          <ul className="nav-list">
            {mainMenu.map((item) => (
              <DesktopItem key={item.href} item={item} />
            ))}
          </ul>
        </nav>

        <div className="header-right">
          <div className={`form-search${searchOpen ? ' is-open' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Tìm kiếm sách"
              aria-label="Tìm kiếm sách"
            />
            <button type="button" className="icon-submit" aria-label="Tìm kiếm">
              <SearchIcon />
            </button>
          </div>
          <button
            type="button"
            className="search-toggle"
            aria-label="Mở tìm kiếm"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <SearchIcon />
          </button>
        </div>
      </div>

      <div
        className={`nav-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <nav className={`nav-mobile${menuOpen ? ' is-open' : ''}`} aria-label="Menu di động">
        <div className="nav-mobile__head">
          <span className="font-display">Menu</span>
          <button type="button" aria-label="Đóng menu" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        <div className="nav-mobile__body">
          <ul className="m-list">
            {mainMenu.map((item) => (
              <MobileItem key={item.href} item={item} />
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" strokeLinecap="round" />
    </svg>
  );
}
