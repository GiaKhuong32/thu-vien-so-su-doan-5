import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingActions from '../components/FloatingActions';
import BookBrief from '../components/BookBrief/BookBrief';
import BookSection from '../components/BookSection';
import InfoPane from '../components/InfoPane/InfoPane';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import ReviewForm from '../components/ReviewForm/ReviewForm';
import Sidebar from '../components/Sidebar/Sidebar';
import { newBooks } from '../data/books';
import { sampleBook, sampleCatalog, sampleSummary } from '../data/detail';
import { bookCategories, bookTopics, libraryBanner } from '../data/library';
import useReveal from '../hooks/useReveal';

export default function BookDetailPage() {
  useReveal();

  const book = sampleBook;
  const catalog = sampleCatalog;
  const summary = sampleSummary;
  const primaryCategory = book.categories?.[0];

  return (
    <div className="wrapper">
      <Navbar />

      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach/?type=ebooks' },
          ...(primaryCategory ? [{ label: primaryCategory.label, href: '/sach/?type=ebooks' }] : []),
          { label: book.title },
        ]}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar
              categories={bookCategories}
              topics={bookTopics}
              activeHref={primaryCategory?.href}
            />
          }
        >
          <BookBrief book={book} />

          <InfoPane title="Thông tin biên mục">
            <ul className="info-list">
              {catalog.map((line) => (
                <li key={line}>- {line}</li>
              ))}
            </ul>
          </InfoPane>

          <InfoPane title="Nội dung sách">
            <p className="desc">{summary}</p>
          </InfoPane>

          <InfoPane title="Bình luận và đánh giá">
            <ReviewForm />
          </InfoPane>
        </PageLayout>

        <BookSection
          id="related"
          title="Sách/ Tài liệu cùng thể loại"
          titleStyle="center"
          books={newBooks.slice(0, 5)}
        />
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}