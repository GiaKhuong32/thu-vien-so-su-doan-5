import banner from "../../assets/images/banner.png";
import Container from "../Container/Container";
import "./Header.css";

const Header = () => {
  return (
    <header className="header">
      <Container>
        <div className="banner-wrapper">
          <img
            src={banner}
            alt="Banner"
          />
        </div>
      </Container>
    </header>
  );
};

export default Header;