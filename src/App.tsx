import AboutSection from './components/AboutSection';
import AdsBanner from './components/AdsBanner';
import BookSection from './components/BookSection';
import FloatingActions from './components/FloatingActions';
import Footer from './components/Footer';
import HeroSlider from './components/HeroSlider';
import Navbar from './components/Navbar';
import SuggestSection from './components/SuggestSection';
import { audioBooks, eBooks, newBooks, paperBooks, suggestBooks, videoBooks } from './data/books';
import useReveal from './hooks/useReveal';
import adsBanner from './assets/ads/sd5.png';

export default function App() {
  useReveal();

  return (
    <div className="wrapper home-page">
      <Navbar />
      <HeroSlider />

      <main>
        <AboutSection />

        <BookSection
          id="new-books"
          title="Sách/ Tài liệu mới"
          titleStyle="center"
          books={newBooks}
        />

        <SuggestSection books={suggestBooks} />

        <BookSection id="ebooks" title="Sách số" books={eBooks} moreHref="/sach/?type=ebooks" />

        <BookSection
          id="paperbooks"
          title="Sách giấy"
          books={paperBooks}
          moreHref="/sach/?type=paperbooks"
        />

        <AdsBanner
          img={adsBanner}
          href="/sach/tham-quan-thuc-te-ao-vr/"
          alt="Tham quan nhà tưởng niệm VR các danh nhân Nam Bộ"
        />

        <BookSection
          id="audiobooks"
          title="Sách nói"
          books={audioBooks}
          moreHref="/sach/?type=audiobooks"
        />

        <BookSection
          id="videobooks"
          title="Phim tài liệu"
          books={videoBooks}
          moreHref="/sach/?type=videobooks"
        />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}
