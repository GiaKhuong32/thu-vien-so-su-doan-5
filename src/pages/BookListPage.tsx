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

  const { data: allBooks } = useBooks();
  const { data: ebooksData } = useBooksByType('ebooks');
  const { data: paperbooksData } = useBooksByType('paperbooks');
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
  }, [type, author, allBooks, ebooksData, audiobooksData, videobooksData]);

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
    }
  }, [allBooks]);

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach/' },
          { label: displayTitle },
        ]}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar 
              categories={bookCategories} 
              topics={bookTopics} 
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
