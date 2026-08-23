import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import BookBrief from '../components/BookBrief/BookBrief';
import BookSection from '../components/BookSection';
import InfoPane from '../components/InfoPane/InfoPane';
import Modal from '../components/Modal/Modal';
import PageBanner from '../components/PageBanner/PageBanner';
import PageLayout from '../components/PageLayout/PageLayout';
import ReviewForm from '../components/ReviewForm/ReviewForm';


import type { BookAction } from '../data/detail';

import { libraryBanner } from '../data/library';

import NotFoundPage from './NotFoundPage';

import {
  useBookDetail,
  useRelatedBooks,
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


  const book = bookData;
  const related = relatedData || [];

  const [bookFormats, setBookFormats] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);


useEffect(() => {
  const fetchBookFiles = async () => {
    const idDocument = bookData?.idDocument;

    if (!idDocument) {
      setBookFormats([]);
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
            .filter((format): format is string => Boolean(format))
        )
      );

      setBookFormats(formats);
    } catch (error) {
      console.error('Lỗi lấy danh sách file của sách:', error);
      setBookFormats([]);
    }
  };

  fetchBookFiles();
}, [bookData]);


  const onUnavailable = useCallback(
    (action: BookAction) => {
      // Nếu là action Audio, redirect thay vì hiển thị thông báo
      if (action.kind === 'audio') {
        window.location.href = action.href;
        return;
      }

      setNotice(
        'Dự án đang được triển khai'
      );
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

          sidebar={null}

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