import BookSection from '../components/BookSection';
import PageBanner from '../components/PageBanner/PageBanner';
import NotFoundPage from './NotFoundPage';
import { useParams } from 'react-router-dom';
import { useBookDetail, useRelatedBooks } from '../hooks/useBooks';
import { libraryBanner } from '../data/library';

export default function BookAudioPage() {
  const { slug } = useParams();
  const { data: bookData } = useBookDetail(slug || '');
  const { data: relatedData } = useRelatedBooks(slug || '', 5);

  if (!bookData) {
    return <NotFoundPage />;
  }

  const book = bookData;
  const related = relatedData || [];
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
          <h1>Tính năng Audio đang được phát triển</h1>
          <p>Chức năng nghe sách đang được cập nhật. Vui lòng quay lại sau.</p>
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
