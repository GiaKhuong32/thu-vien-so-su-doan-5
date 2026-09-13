import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import "./UserMenu.css";

interface UserMenuProps {
  name: string;
  role?: string; 
  avatarUrl?: string; 
  onLogout: () => void;
  onProfileClick?: () => void;
}
 
function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function UserMenu({
  name,
  role = "Quản trị viên",
  avatarUrl,
  onLogout,
  onProfileClick,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="user-menu" ref={menuRef}>
      <button
        type="button"
        className="user-menu__trigger"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="user-menu__avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} />
          ) : (
            getInitials(name)
          )}
        </span>
        <ChevronDown className="user-menu__caret" />
      </button>

      {open && (
        <div className="user-menu__dropdown" role="menu">
          <div className="user-menu__header">
            <span className="user-menu__avatar user-menu__avatar--lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt={name} />
              ) : (
                getInitials(name)
              )}
            </span>
            <div className="user-menu__info">
              <span className="user-menu__name">{name}</span>
              <span className="user-menu__role">{role}</span>
            </div>
          </div>

          <div className="user-menu__divider" />

          {onProfileClick && (
            <button
              type="button"
              className="user-menu__item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onProfileClick();
              }}
            >
              <UserIcon />
              Thông tin tài khoản
            </button>
          )}

          <button
            type="button"
            className="user-menu__item user-menu__item--danger"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut />
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
}