import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookBrief from '../components/BookBrief/BookBrief';
import BookSection from '../components/BookSection';
import InfoPane from '../components/InfoPane/InfoPane';
import Modal from '../components/Modal/Modal';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import ReviewForm from '../components/ReviewForm/ReviewForm';
import Sidebar from '../components/Sidebar/Sidebar';
import type { BookAction } from '../data/detail';
import { bookBySlug, relatedBooks } from '../data/detail';
import { bookCategories, bookTopics, libraryBanner } from '../data/library';
import NotFoundPage from './NotFoundPage';
import { useBookDetail, useRelatedBooks } from '../hooks/useBooks';

export default function BookDetailPage() {
  const { slug } = useParams();

const { data: bookData, loading: bookLoading, error: bookError } = useBookDetail(slug || '');
const { data: relatedData } = useRelatedBooks(slug || '', 5);

const staticBook = slug ? bookBySlug[slug] : undefined;
const book = bookData || staticBook;
const related = relatedData || (book ? relatedBooks(book, 5) : []);

const [notice, setNotice] = useState<string | null>(null);

const onUnavailable = useCallback((_action: BookAction) => {
  setNotice('Dự án đang được triển khai');
}, []);

if (bookLoading && !book) {
  return <div>Loading...</div>;
}

if (!book || bookError) {
  return <NotFoundPage />;
}

const relatedMoreHref = book.category ? book.category.href : '/sach/';

  if (bookLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach/' },
          ...(book.category ? [{ label: book.category.label, href: book.category.href }] : []),
          { label: book.title },
        ]}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar
              categories={bookCategories}
              topics={bookTopics}
              activeHref={book.category?.href}
            />
          }
        >
          <BookBrief book={book} onUnavailable={onUnavailable} />

          {!!book.catalog.length && (
            <InfoPane title="Thông tin biên mục">
              <ul className="info-list">
                {book.catalog.map((line, i) => (
                  <li key={`${i}-${line.slice(0, 24)}`}>- {line}</li>
                ))}
              </ul>
            </InfoPane>
          )}

          {!!book.summary.length && (
            <InfoPane title="Nội dung sách">
              {book.summary.map((p, i) => (
                <p className="desc" key={`${i}-${p.slice(0, 24)}`}>
                  {p}
                </p>
              ))}
            </InfoPane>
          )}

          <InfoPane title="Bình luận và đánh giá">
            <ReviewForm key={book.slug} />
          </InfoPane>
        </PageLayout>

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

      <Modal open={notice !== null} onClose={() => setNotice(null)}>
        {notice}
      </Modal>
    </>
  );
}
