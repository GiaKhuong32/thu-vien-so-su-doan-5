import { useMemo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid/BookGrid';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import Sidebar from '../components/Sidebar/Sidebar';
import { bookCategories, bookTopics, libraryBanner } from '../data/library';
import { useBooks, useBooksByType } from '../hooks/useBooks';
import useReveal from '../hooks/useReveal';

const PER_PAGE = 12;

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [categoriesWithCount, setCategoriesWithCount] = useState(bookCategories);
  const [topicsWithCount, setTopicsWithCount] = useState(bookTopics);

  const { data: allBooks, loading, error } = useBooks();
  const { data: ebooksData } = useBooksByType('ebooks');
  const { data: audiobooksData } = useBooksByType('audiobooks');
  const { data: videobooksData } = useBooksByType('videobooks');

  const filteredBooks = useMemo(() => {
    if (!query || !allBooks) return [];
    
    const searchLower = query.toLowerCase();
    
    return allBooks.filter(book => {
      const titleMatch = book.title?.toLowerCase().includes(searchLower);
      const authorMatch = book.author?.toLowerCase().includes(searchLower);
      
      return titleMatch || authorMatch;
    });
  }, [query, allBooks]);

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / PER_PAGE));
  const slice = useMemo(
    () => filteredBooks.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [page, filteredBooks],
  );

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useReveal();

  useEffect(() => {
    if (allBooks && allBooks.length > 0) {
      // Calculate category counts - use same logic as filter
      const categoryCounts = new Map<string, number>();

      bookCategories.forEach(cat => {
        if (cat.label === 'Tất cả') {
          categoryCounts.set(cat.label, allBooks.length);
          return;
        }

        // Count books matching this category using same logic as filter
        const count = allBooks.filter(book => {
          if (!book.category) return false;

          // Check exact match
          if (book.category === cat.label) {
            return true;
          }

          // Check contains (case-insensitive)
          if (book.category.toLowerCase().includes(cat.label.toLowerCase())) {
            return true;
          }

          return false;
        }).length;

        categoryCounts.set(cat.label, count);
      });

      const categoriesWithCounts = bookCategories.map(cat => ({
        ...cat,
        count: categoryCounts.get(cat.label) || 0
      }));
      setCategoriesWithCount(categoriesWithCounts);

      // Calculate topic counts
      const topicCounts = {
        'Sách số': ebooksData?.length || 0,
        'Sách nói': audiobooksData?.length || 0,
        'Phim tài liệu': videobooksData?.length || 0
      };

      const topicsWithCounts = bookTopics.map(topic => ({
        ...topic,
        count: topicCounts[topic.label] || 0
      }));
      setTopicsWithCount(topicsWithCounts);
    }
  }, [allBooks, ebooksData, audiobooksData, videobooksData]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Đang tìm kiếm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p>Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.</p>
      </div>
    );
  }

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Tìm kiếm', href: '/search' },
          { label: query ? `"${query}"` : 'Tất cả' },
        ]}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar categories={categoriesWithCount} topics={topicsWithCount} />
          }
        >
          <h1 className="tt-row mainbody__tt">
            <span className="icon-book" aria-hidden="true" />
            Kết quả tìm kiếm: {query ? `"${query}"` : 'Tất cả'}
          </h1>

          {query && (
            <p className="search-info">
              Tìm thấy {filteredBooks.length} kết quả cho từ khóa "{query}"
            </p>
          )}

          {filteredBooks.length > 0 ? (
            <>
              <BookGrid books={slice} columns={4} />

              {totalPages > 1 && (
                <div className="pagination-wrapper">
                  <div className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        className={`pagination-item${pageNum === page ? ' active' : ''}`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <p>Không tìm thấy kết quả nào{query ? ` cho từ khóa "${query}"` : ''}.</p>
              <p>Vui lòng thử từ khóa khác hoặc điều kiện tìm kiếm khác.</p>
            </div>
          )}
        </PageLayout>
      </main>
    </>
  );
}
