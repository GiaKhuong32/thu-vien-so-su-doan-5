import { useCallback, useEffect, useState } from 'react';
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
import type { Author } from '../data/library';

import { bookCategories, bookTopics, libraryBanner } from '../data/library';

import NotFoundPage from './NotFoundPage';

import {
  useBookDetail,
  useRelatedBooks,
  useBooks,
} from '../hooks/useBooks';


interface BookFile {
  bookFile?: string;
  fileName?: string;
  idFile?: string;
  partFile?: string;
  thumbnail?: string;
  typeFile?: string;
}

const normalizeBookFormat = (bookFile?: string): string => {
  if (!bookFile) {
    return '';
  }

  switch (bookFile) {
    case 'Sách_Số':
      return 'Sách số';

    case 'Sách_Nói':
      return 'Sách nói';

    default:
      return bookFile.replaceAll('_', ' ');
  }
};


export default function BookDetailPage() {

  const { slug } = useParams();

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


useEffect(() => {
  const fetchBookFiles = async () => {
    const idDocument = bookData?.idDocument;

    if (!idDocument) {
      setBookFormats([]);
      setBookActions([]);
      return;
    }

    try {
   

const response = await fetch(
  `http://192.168.2.46:8080/files/document/${idDocument}`,
  {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  }
);

      if (!response.ok) {
        throw new Error(`API file trả về HTTP ${response.status}`);
      }

      const data = await response.json();

      const files: BookFile[] = Array.isArray(data?.Result)
        ? data.Result
        : Array.isArray(data?.result)
          ? data.result
          : [];

      const formats = Array.from(
        new Set(
          files
            .map((file) => normalizeBookFormat(file.bookFile))
            .filter((format): format is string => {
              
              return Boolean(format) && 
                     (format === 'Sách số' || format === 'Sách nói');
            })
        )
      );

      setBookFormats(formats);

      // Tạo actions dựa trên file types
      const hasAudio = files.some((file) => {
        const bookFile = file.bookFile || '';
        const typeFile = file.typeFile?.toLowerCase() || '';
        return bookFile === 'Sách_Nói' || typeFile === 'mp3' || typeFile.includes('audio');
      });

      const pdfFile = files.find((file) => {
        const bookFile = file.bookFile || '';
        const typeFile = file.typeFile?.toLowerCase() || '';
        const fileName = file.fileName?.toLowerCase() || '';
        return bookFile === 'Sách_Số' || typeFile === 'pdf' || fileName.endsWith('.pdf');
      });

      const actions: BookAction[] = [];

      if (pdfFile?.partFile) {
        actions.push({
          label: 'Đọc',
          kind: 'pdf',
          primary: true,
          href: pdfFile.partFile,
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
  }
}, [allBooks]);


  const onUnavailable = useCallback(
    (action: BookAction) => {
      if (action.kind === 'audio') {
        window.location.href = action.href;
        return;
      }

      if (action.kind === 'pdf' && action.href) {
        window.open(action.href, '_blank', 'noopener,noreferrer');
        return;
      }

      setNotice('Dự án đang được triển khai');
    },
    []
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

          {
            label: 'Thư viện',
            href: '/sach/',
          },

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
              categories={bookCategories} 
              topics={bookTopics} 
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