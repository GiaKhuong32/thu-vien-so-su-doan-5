import AudioPlayer from '../components/AudioPlayer/AudioPlayer';
import BookSection from '../components/BookSection';
import PageBanner from '../components/PageBanner/PageBanner';
import { audioBookBySlug } from '../data/audio';
import { bookBySlug, relatedBooks } from '../data/detail';
import { libraryBanner } from '../data/library';
import NotFoundPage from './NotFoundPage';
import { useParams } from 'react-router-dom';

export default function BookAudioPage() {
  const { slug } = useParams();
  const book = slug ? bookBySlug[slug] : undefined;
  const audio = slug ? audioBookBySlug[slug] : undefined;

  if (!book || !audio) {
    return <NotFoundPage />;
  }

  const related = relatedBooks(book, 5);
  const relatedMoreHref = book.category ? book.category.href : '/sach/';

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach/' },
          ...(book.category ? [{ label: book.category.label, href: book.category.href }] : []),
          { label: book.title, href: `/sach/${book.slug}.html` },
          { label: `Audio - ${book.title}` },
        ]}
      />

      <main>
        <div className="container audio-page">
          <AudioPlayer title={book.title} img={audio.img || book.img} tracks={audio.tracks} />
        </div>

        {!!related.length && (
          <BookSection
            id="related"
            title="Sách/ Tài liệu cùng thể loại"
            titleStyle="center"
            books={related}
            moreHref={relatedMoreHref}
          />
        )}
      </main>
    </>
  );
}
