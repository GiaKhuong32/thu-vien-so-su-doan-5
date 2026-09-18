import { useLayoutEffect, useMemo, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid/BookGrid';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import Pagination from '../components/Pagination/Pagination';
import Sidebar from '../components/Sidebar/Sidebar';
import { bookTopics, libraryBanner } from '../data/library';
import type { Author } from '../data/library';
import { useBooks, useBooksByCategory, useBooksByType } from '../hooks/useBooks';
import { useCategories } from '../hooks/useCategories';
import {
  collectCategoryIds,
  findCategoryPath,
} from '../api/categories';
import useReveal from '../hooks/useReveal';
import type { Book } from '../components/BookCard';

const PER_PAGE = 12;

function normalizeCountText(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function bookMatchesCategory(book: Book, categoryId: string, labels: string[]): boolean {
  if (book.idCategory && book.idCategory === categoryId) return true;
  if (!book.category) return false;

  const bookCategory = normalizeCountText(book.category);

  return labels.some((label) => {
    const categoryLabel = normalizeCountText(label);
    return (
      bookCategory === categoryLabel ||
      bookCategory.includes(categoryLabel) ||
      categoryLabel.includes(bookCategory)
    );
  });
}

type Props = {
  title?: string;
  activeHref?: string;
};

export default function BookListPage({ title = 'Thư viện', activeHref }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category } = useParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const type = searchParams.get('type');
  const author = searchParams.get('author');
  const [authors, setAuthors] = useState<Author[]>([]);
  const dbCategories = useCategories({ includeAll: true });
  const [categoriesWithCount, setCategoriesWithCount] = useState(dbCategories);
  const [topicsWithCount, setTopicsWithCount] = useState(bookTopics);

  const categoryPath = useMemo(
    () => (category ? findCategoryPath(dbCategories, category) : []),
    [category, dbCategories],
  );
  const currentCategory = categoryPath[categoryPath.length - 1];
  const categoryIds = useMemo(
    () => (currentCategory ? collectCategoryIds(currentCategory) : []),
    [currentCategory],
  );

  const { data: allBooks } = useBooks();
  const { data: categoryBooks } = useBooksByCategory(categoryIds);
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
    if (currentCategory) return currentCategory.label;
    return title;
  }, [type, author, title, currentCategory]);

  const filteredBooks = useMemo(() => {
    let books: typeof allBooks = [];

    if (category) {
      books = categoryBooks || [];
    } else if (type === 'ebooks') {
      books = ebooksData || [];
    } else if (type === 'audiobooks') {
      books = audiobooksData || [];
    } else if (type === 'videobooks') {
      books = videobooksData || [];
    } else {
      books = allBooks || [];
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
  }, [type, category, author, allBooks, categoryBooks, ebooksData, audiobooksData, videobooksData]);

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

  useReveal([
    page,
    type,
    category,
    author,
    filteredBooks.length,
    slice.length,
  ]);

  useEffect(() => {
    setCategoriesWithCount(dbCategories);
  }, [dbCategories]);

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

      const countableBooks = [...allBooks, ...(videobooksData || [])];
      const categoryCounts = new Map<string, number>();

      dbCategories.forEach(cat => {
        if (cat.label === 'Tất cả') {
          categoryCounts.set(cat.label, countableBooks.length);
          return;
        }

        const labels = [cat.label, ...(cat.children?.map((child) => child.label) ?? [])];
        const categoryIds = [cat.id, ...(cat.children?.map((child) => child.id) ?? [])];
        const count = countableBooks.filter((book) =>
          categoryIds.some((id) => bookMatchesCategory(book, id, labels)),
        ).length;

        categoryCounts.set(cat.label, count);
      });

      const categoriesWithCounts = dbCategories.map(cat => ({
        ...cat,
        count: categoryCounts.get(cat.label) || 0,
        children: cat.children?.map((child) => ({
          ...child,
          count: countableBooks.filter((book) =>
            bookMatchesCategory(book, child.id, [child.label]),
          ).length,
        })),
      }));
      setCategoriesWithCount(categoriesWithCounts);

      const topicCountsByHref: Record<string, number> = {
  '/sach/?type=ebooks': ebooksData?.length || 0,
  '/sach/?type=audiobooks': audiobooksData?.length || 0,
  '/sach/?type=videobooks': videobooksData?.length || 0,
};

const topicsWithCounts = bookTopics.map((topic) => ({
  ...topic,
  count: topicCountsByHref[topic.href] || 0,
}));

setTopicsWithCount(topicsWithCounts);
    }
  }, [allBooks, dbCategories, ebooksData, audiobooksData, videobooksData]);

  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { label: 'Thư viện', href: '/sach/' },
    ...(type
      ? [{ label: displayTitle }]
      : [
          ...categoryPath.slice(0, -1).map((item) => ({
            label: item.label,
            href: item.href,
          })),
          ...(author || currentCategory || displayTitle !== 'Thư viện'
            ? [{ label: displayTitle }]
            : []),
        ]),
  ];

  const sidebarActiveHref =
    activeHref || currentCategory?.href || (author ? `/sach/?author=${author}` : '/sach/');

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
              activeHref={sidebarActiveHref}
              activeTopicHref={type ? `/sach/?type=${type}` : undefined}
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
              const basePath = currentCategory
                ? currentCategory.href
                : '/sach/';
              const query = params.toString();
              return `${basePath}${basePath.includes('?') ? '&' : '?'}${query}`;
            }}
            onChange={handlePageChange}
          />
        </PageLayout>
      </main>
    </>
  );
}
