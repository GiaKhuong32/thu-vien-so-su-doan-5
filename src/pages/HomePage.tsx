import AboutSection from '../components/AboutSection';
import AdsBanner from '../components/AdsBanner';
import BookSection from '../components/BookSection';
import HeroSlider from '../components/HeroSlider';
import SuggestSection from '../components/SuggestSection';
import { assetImage } from '../data/assets';
import { useNewBooks, useSuggestedBooks, useBooksByType } from '../hooks/useBooks';
import useReveal from '../hooks/useReveal';

export default function HomePage() {
  const { data: newBooksData } = useNewBooks(10);
  const { data: suggestedBooksData } = useSuggestedBooks(6);
  const { data: ebooksData } = useBooksByType('ebooks');
  const { data: audiobooksData } = useBooksByType('audiobooks');
  const { data: videobooksData } = useBooksByType('videobooks');

  useReveal([
    newBooksData?.length,
    suggestedBooksData?.length,
    ebooksData?.length,
    audiobooksData?.length,
    videobooksData?.length,
  ]);

  const displayNewBooks = newBooksData || [];
  const displaySuggestedBooks = suggestedBooksData || [];
  const displayEbooks = ebooksData || [];
  const displayAudiobooks = audiobooksData || [];
  const displayVideobooks = videobooksData || [];

  return (
    <>
      <HeroSlider />

      <main>
        <AboutSection />

        <BookSection
          id="new-books"
          title="Sách/ Tài liệu mới"
          titleStyle="center"
          books={displayNewBooks}
        />

        <SuggestSection books={displaySuggestedBooks} />

        <BookSection
          id="ebooks"
          title="Sách số"
          books={displayEbooks}
          moreHref="/sach/?type=ebooks"
        />

        <BookSection
          id="audiobooks"
          title="Sách nói"
          books={displayAudiobooks}
          moreHref="/sach/?type=audiobooks"
        />

        <AdsBanner
          img={assetImage('ads/sd5.png')}
          href="/banner/sd5"
          alt="Banner su doan 5"
        />

        <BookSection
          id="videobooks"
          title="Phim tài liệu"
          books={displayVideobooks}
          moreHref="/sach/?type=videobooks"
        />
      </main>
    </>
  );
}