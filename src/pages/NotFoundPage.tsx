import BookSection from '../components/BookSection';
import PageBanner from '../components/PageBanner/PageBanner';
import { bookDetails, toCard } from '../data/detail';
import { libraryBanner } from '../data/library';

/**
 * Shown for a "/sach/<slug>" route with no bundled record — this clone ships
 * detail data only for the books whose cover art lives in /public/assets/books.
 */
export default function NotFoundPage() {
  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach/' },
          { label: 'Không tìm thấy' },
        ]}
      />

      <main>
        <div className="container py-5">
          <h1 className="tt-center">Không tìm thấy tài liệu</h1>
          <p className="desc" style={{ textAlign: 'center' }}>
            Tài liệu bạn tìm chưa có trong bản dựng này. Bạn có thể quay lại{' '}
            <a href="/sach/?type=ebooks">Thư viện</a> hoặc xem các tài liệu bên dưới.
          </p>
        </div>

        <BookSection
          id="nf-suggest"
          title="Sách/ Tài liệu khác"
          titleStyle="center"
          books={bookDetails.slice(0, 5).map(toCard)}
        />
      </main>
    </>
  );
}
