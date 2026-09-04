import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import BookBrief from '../components/BookBrief/BookBrief';
import BookSection from '../components/BookSection';
import InfoPane from '../components/InfoPane/InfoPane';
import Modal from '../components/Modal/Modal';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import ReviewForm from '../components/ReviewForm/ReviewForm';
import Sidebar from '../components/Sidebar/Sidebar';


import type { BookAction } from '../data/detail';
import type { Author } from '../data/library';

import { bookCategories, bookTopics, libraryBanner } from '../data/library';

import NotFoundPage from './NotFoundPage';

import {
  useBookDetail,
  useRelatedBooks,
  useBooks,
} from '../hooks/useBooks';

import {
  findPdfFile,
  getBookFileUrl,
  getDocumentFiles,
  getReadableFormats,
  hasAudioFile,
} from '../api/bookFiles';


export default function BookDetailPage() {

  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    data: bookData,
    loading: bookLoading,
    error: bookError,
  } = useBookDetail(slug || '');

  const {
    data: relatedData,
  } = useRelatedBooks(slug || '', 5);

  const { data: allBooks } = useBooks();


  const book = bookData;
  const related = relatedData || [];

  const [bookFormats, setBookFormats] = useState<string[]>([]);
  const [bookActions, setBookActions] = useState<BookAction[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [categoriesWithCount, setCategoriesWithCount] = useState(bookCategories);
  const [topicsWithCount, setTopicsWithCount] = useState(bookTopics);

useEffect(() => {
  const fetchBookFiles = async () => {
    const idDocument = bookData?.idDocument;

    if (!idDocument) {
      setBookFormats([]);
      setBookActions([]);
      return;
    }

    try {
      const files = await getDocumentFiles(idDocument);

      setBookFormats(getReadableFormats(files));

      const pdfFile = findPdfFile(files);
      const pdfUrl = getBookFileUrl(pdfFile);
      const hasAudio = hasAudioFile(files);

      const actions: BookAction[] = [];

      if (pdfUrl) {
        const readerHref = bookData?.slug
          ? `/sach/${bookData.slug}/doc.html?file=${encodeURIComponent(pdfUrl)}`
          : `/doc-sach?file=${encodeURIComponent(pdfUrl)}`;

        actions.push({
          label: 'Đọc',
          kind: 'pdf',
          primary: true,
          href: readerHref,
        });
      }

      if (hasAudio && bookData?.slug) {
        actions.push({
          label: 'Audio',
          kind: 'audio',
          primary: false,
          href: `/sach/${bookData.slug}/Audio.html`,
        });
      }

      setBookActions(actions);
    } catch (error) {
      console.error('Lỗi lấy danh sách file của sách:', error);
      setBookFormats([]);
      setBookActions([]);
    }
  };

  fetchBookFiles();
}, [bookData]);

useEffect(() => {
  if (allBooks && allBooks.length > 0) {
    
    const uniqueAuthors = new Map<string, string>();
    
    allBooks.forEach((book) => {
      if (book.author && book.author.trim()) {
        const authorName = book.author.trim();
        // Tạo slug nhưng giữ lại dấu tiếng Việt
        const authorSlug = authorName
          .toLowerCase()
          .replace(/\s+/g, '-') // chỉ thay space bằng dấu gạch
          .replace(/[^a-z0-9-àáạảãâầấậẩẫèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỉỹđ]/g, '') // xóa ký tự đặc biệt
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

    // Calculate topic counts - set to 0 for now since we don't have the format data
    const topicsWithCounts = bookTopics.map(topic => ({
      ...topic,
      count: 0
    }));
    setTopicsWithCount(topicsWithCounts);
  }
}, [allBooks]);


  const onUnavailable = useCallback(
    (action: BookAction) => {
      if (action.kind === 'audio') {
        window.location.href = action.href;
        return;
      }

      if (action.kind === 'pdf' && action.href) {
        // Điều hướng sang trình đọc FlipBook trong cùng ứng dụng
        // (trước đây mở PDF thô bằng viewer mặc định của trình duyệt).
        navigate(action.href);
        return;
      }

      setNotice('Dự án đang được triển khai');
    },
    [navigate]
  );


  if (bookLoading && !book) {

    return (
      <div>
        Loading...
      </div>
    );

  }


  if (!book || bookError) {

    return <NotFoundPage />;

  }


  const relatedMoreHref =
    book.category
      ? book.category.href
      : '/sach/';


  const bookWithFormat = {
    ...book,
    formats: bookFormats,
    actions: bookActions,
  };

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          {
            label: 'Trang chủ',
            href: '/',
          },

          ...(bookFormats.length > 0
            ? [
                {
                  label: bookFormats.includes('Sách nói') ? 'Sách nói' : 'Sách số',
                  href: '/sach/',
                },
              ]
            : []),

          ...(book.category
            ? [
              {
                label: book.category.label,
                href: book.category.href,
              },
            ]
            : []),

          {
            label: book.title,
          },
        ]}
      />

      <main>

        <PageLayout
          sidebar={
            <Sidebar
              categories={categoriesWithCount}
              topics={topicsWithCount}
              authors={authors}
              activeHref={book.category?.href}
            />
          }
        >

          <BookBrief
            book={
              bookWithFormat as typeof book
            }
            onUnavailable={
              onUnavailable
            }
          />

          {!!book.catalog.length && (

            <InfoPane
              title="Thông tin biên mục"
            >

              <ul className="info-list">

                {book.catalog.map(
                  (line, i) => (

                    <li
                      key={`${i}-${line.slice(
                        0,
                        24
                      )}`}
                    >
                      - {line}
                    </li>

                  )
                )}

              </ul>

            </InfoPane>

          )}

          {!!book.summary.length && (

            <InfoPane
              title="Nội dung sách"
            >

              {book.summary.map(
                (p, i) => (

                  <p
                    className="desc"
                    key={`${i}-${p.slice(
                      0,
                      24
                    )}`}
                  >
                    {p}
                  </p>

                )
              )}

            </InfoPane>

          )}

          <InfoPane
            title="Bình luận và đánh giá"
          >

            <ReviewForm
              key={book.slug}
            />

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

      <Modal
        open={notice !== null}
        onClose={() =>
          setNotice(null)
        }
      >

        {notice}

      </Modal>

    </>
  );
}