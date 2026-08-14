import { useLayoutEffect, useMemo, useState } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid/BookGrid';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import Pagination from '../components/Pagination/Pagination';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import FloatingActions from '../components/FloatingActions/FloatingActions';
import { bookCategories, bookTopics, libraryBanner } from '../data/library';
import { ebookListing } from '../data/listing';
import { eBooks, paperBooks, audioBooks, videoBooks } from '../data/books';
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

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [type, category]);

  const displayTitle = useMemo(() => {
    if (type === 'ebooks') return 'Sách số';
    if (type === 'paperbooks') return 'Sách giấy';
    if (type === 'audiobooks') return 'Sách nói';
    if (type === 'videobooks') return 'Phim tài liệu';
    if (category) {
      const cat = bookCategories.find(c => c.href.includes(category));
      if (cat) return cat.label;
    }
    return title;
  }, [type, category, title]);

  // Filter books based on type
  const filteredBooks = useMemo(() => {
    if (type === 'ebooks') return eBooks;
    if (type === 'paperbooks') return paperBooks;
    if (type === 'audiobooks') return audioBooks;
    if (type === 'videobooks') return videoBooks;
    return ebookListing; // Default to ebookListing if no type specified
  }, [type]);

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

  return (
    <div className="wrapper">
      <Navbar />
      
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Thư viện', href: '/sach' },
          { label: displayTitle },
        ]}
      />

      <main>
        <PageLayout
          sidebar={
            <Sidebar categories={bookCategories} topics={bookTopics} activeHref={activeHref} />
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
              params.set('page', p.toString());
              return `/sach/?${params.toString()}`;
            }}
            onChange={handlePageChange}
          />
        </PageLayout>
      </main>

      <Footer />
      <FloatingActions />
    </div>
  );
}