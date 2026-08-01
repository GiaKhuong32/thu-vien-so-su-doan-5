import { useState } from "react";
import Container from "../Container/Container";
import "./Navbar.css";

interface SubItem {
  label: string;
  href: string;
}

interface MenuItem {
  label: string;
  href: string;
  children?: SubItem[];
}

const menuItems: MenuItem[] = [
  { label: "TRANG CHỦ", href: "/" },
  {
    label: "GIỚI THIỆU",
    href: "/books",
    children: [
      { label: "Sách mới", href: "/books/new" },
      { label: "Theo thể loại", href: "/books/genres" },
      { label: "Sách nổi bật", href: "/books/featured" },
    ],
  },
  {
    label: "TIN TỨC",
    href: "/categories",
    children: [
      { label: "Theo chủ đề", href: "/categories/topics" },
      { label: "Theo tác giả", href: "/categories/authors" },
    ],
  },
  {
    label: "TUYÊN TRUYỀN",
    href: "/about",
    children: [
      { label: "Theo chủ đề", href: "/categories/topics" },
      { label: "Theo tác giả", href: "/categories/authors" },
    ],
  },
  {
    label: "TƯ LIỆU",
    href: "/about",
    children: [
      { label: "Theo chủ đề", href: "/categories/topics" },
      { label: "Theo tác giả", href: "/categories/authors" },
    ],
  },
  {
    label: "HUẤN LUYỆN",
    href: "/about",
    children: [
      { label: "Theo chủ đề", href: "/categories/topics" },
      { label: "Theo tác giả", href: "/categories/authors" },
    ],
  },
  {
    label: "NGHIỆP VỤ",
    href: "/about",
    children: [
      { label: "Theo chủ đề", href: "/categories/topics" },
      { label: "Theo tác giả", href: "/categories/authors" },
    ],
  },

  { label: "TRỢ GIÚP", href: "/help" },
];

const Navbar = () => {
  const [active, setActive] = useState("TRANG CHỦ");
  



  return (
    <nav className="navbar">
      <Container>
        <div className="navbar-content">
          <ul className="navbar-menu">
            {menuItems.map((item) => (
              <li
                key={item.label}
                className="navbar-item"
              >
                <a
              href={item.href}
                  className={active === item.label ? "active" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(item.label);
                  }}
                >
                  {item.label}
                  {item.children && <span className="caret" />}
                </a>

                {item.children && (
                  <ul className="dropdown-menu">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        <a href={child.href}>{child.label}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="navbar-utils">
            <a href="/search">Tìm kiếm</a>
              
          
            <span className="divider" />
            <a href="/login">Đăng nhập</a>
             
            
          </div>
        </div>
      </Container>
    </nav>
  );
};

export default Navbar;