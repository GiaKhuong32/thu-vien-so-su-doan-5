import { useLayoutEffect, useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid/BookGrid';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import Pagination from '../components/Pagination/Pagination';
import Sidebar from '../components/Sidebar/Sidebar';
import { bookCategories, bookTopics, libraryBanner } from '../data/library';
import type { Author } from '../data/library';
import { useBooks, useBooksByType } from '../hooks/useBooks';
import useReveal from '../hooks/useReveal';

const PER_PAGE = 12;

type Props = {
  title?: string;
  activeHref?: string;
};

export default function BookListPage({ title = 'Sách số', activeHref }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type');
  const author = searchParams.get('author');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categoriesWithCount, setCategoriesWithCount] = useState(bookCategories);
  const [topicsWithCount, setTopicsWithCount] = useState(bookTopics);

  const { data: allBooks } = useBooks();
  const { data: ebooksData } = useBooksByType('ebooks');
  const { data: audiobooksData } = useBooksByType('audiobooks');
  const { data: videobooksData } = useBooksByType('videobooks');

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [type, category, author]);

  const displayTitle = useMemo(() => {
    if (author) {
      return author
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    if (type === 'ebooks') return 'Sách số';
    if (type === 'audiobooks') return 'Sách nói';
    if (type === 'videobooks') return 'Phim tài liệu';
    if (category) {
      const cat = bookCategories.find((c) => c.href.includes(category));
      if (cat) return cat.label;
    }
    return title;
  }, [type, category, author, title]);

  const filteredBooks = useMemo(() => {
    let books: typeof allBooks = [];

    if (type === 'ebooks') {
      books = ebooksData || [];
    } else if (type === 'audiobooks') {
      books = audiobooksData || [];
    } else if (type === 'videobooks') {
      books = videobooksData || [];
    } else {
      books = allBooks || [];
    }

    // Filter by category
    if (category && books) {
      const categorySlug = category.replace(/\/$/, ''); // Remove trailing slash

      const categoryMap: Record<string, string> = {
        'tai-lieu-huan-luyen': 'Tài liệu huấn luyện',
        'tai-lieu-chinh-tri': 'Tài liệu chính trị',
        'lich-su': 'Lịch sử',
        'van-hoc': 'Văn học',
        'khoa-hoc': 'Khoa học',
        'ngon-ngu-hoc': 'Ngôn ngữ học',
        'phim-tai-lieu': 'Phim tài liệu',
        'tai-lieu-khac': 'Tài liệu khác',
      };

      const categoryName = categoryMap[categorySlug];

      books = books.filter(book => {
        if (!categoryName) return false;

        // Check if book category matches exactly
        if (book.category && book.category === categoryName) {
          return true;
        }

        // Check if book category contains the category name
        if (book.category && book.category.toLowerCase().includes(categoryName.toLowerCase())) {
          return true;
        }

        return false;
      });

      console.log(`Filter by category: ${category} (${categoryName}), found ${books.length} books`);
    }

    if (author && books) {
      const authorSlug = author.toLowerCase();
      const authorNameFormatted = author
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      books = books.filter(book => {
        if (!book.author) return false;

        const bookAuthor = book.author.toLowerCase();

        return (
          bookAuthor.includes(authorSlug) ||
          authorSlug.includes(bookAuthor.replace(/\s+/g, '-')) ||
          bookAuthor.includes(authorNameFormatted.toLowerCase()) ||
          authorNameFormatted.toLowerCase().includes(bookAuthor)
        );
      });

      console.log(`Filter by author: ${author} -> ${authorNameFormatted}, found ${books.length} books`);
    }

    return books;
  }, [type, category, author, allBooks, ebooksData, audiobooksData, videobooksData]);

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
      const uniqueAuthors = new Map<string, string>();

      allBooks.forEach((book) => {
        if (book.author && book.author.trim()) {
          const authorName = book.author.trim();

          const authorSlug = authorName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-àáạảãâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỉỹđ]/g, '')
            .replace(/^-+|-+$/g, '');

          if (!uniqueAuthors.has(authorName)) {
            uniqueAuthors.set(authorName, `/sach/?author=${authorSlug}`);
          }
        }
      });

      const authorArray = Array.from(uniqueAuthors.entries())
        .slice(0, 3)
        .map(([label, href]) => ({ label, href }));

      setAuthors(authorArray);

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
        count: (topicCounts as Record<string, number>)[topic.label] || 0
      }));
      setTopicsWithCount(topicsWithCounts);
    }
  }, [allBooks, ebooksData, audiobooksData, videobooksData]);

  // Breadcrumb logic: chỉ thêm cấp cha khi đang chọn thể loại con
  const typeLabel = type === 'audiobooks' ? 'Sách nói' : type === 'videobooks' ? 'Phim tài liệu' : 'Sách số';
  const breadcrumbItems = category
    ? [
        { label: 'Trang chủ', href: '/' },
        { label: typeLabel, href: '/sach/' },
        { label: displayTitle },
      ]
    : [
        { label: 'Trang chủ', href: '/' },
        { label: displayTitle },
      ];

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={breadcrumbItems}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar
              categories={categoriesWithCount}
              topics={topicsWithCount}
              authors={authors}
              activeHref={activeHref}
              activeAuthorHref={author ? `/sach/?author=${author}` : undefined}
            />
          }
        >
          <h1 className="tt-row mainbody__tt">
            <span className="icon-book" aria-hidden="true" />
            {displayTitle}
          </h1>

          <BookGrid books={slice} columns={4} />

          <Pagination
            page={page}
            totalPages={totalPages}
            hrefFor={(p) => {
              const params = new URLSearchParams();
              if (type) params.set('type', type);
              if (author) params.set('author', author);
              params.set('page', p.toString());
              return `/sach/?${params.toString()}`;
            }}
            onChange={handlePageChange}
          />
        </PageLayout>
      </main>
    </>
  );
}
