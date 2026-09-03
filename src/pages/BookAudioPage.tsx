import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookSection from '../components/BookSection';
import PageBanner from '../components/PageBanner/PageBanner';
import NotFoundPage from './NotFoundPage';
import { useBookDetail, useRelatedBooks } from '../hooks/useBooks';
import { libraryBanner } from '../data/library';
import AudioPlayer, { type AudioTrack } from '../components/AudioPlayer/AudioPlayer';
import {
  getDocumentFiles,
  isAudioFile,
  getBookFileUrl,
} from '../api/bookFiles';

export default function BookAudioPage() {
  const { slug } = useParams();
  const { data: bookData } = useBookDetail(slug || '');
  const { data: relatedData } = useRelatedBooks(slug || '', 5);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudioFiles = async () => {
      const idDocument = bookData?.idDocument;

      if (!idDocument) {
        console.log('Không có idDocument');
        setAudioTracks([]);
        setLoading(false);
        return;
      }

      try {
        console.log('Đang fetch files cho idDocument:', idDocument);
        const files = await getDocumentFiles(idDocument);
        console.log('Files sau khi parse:', files);

        const audioFiles = files.filter(isAudioFile);
        console.log('Audio files sau khi filter:', audioFiles);

        const tracks: AudioTrack[] = audioFiles.map((file, index) => {
          const audioUrl = getBookFileUrl(file);

          console.log(`Audio track ${index}: title=${file.fileName}, url=${audioUrl}`);

          return {
            title: file.fileName || `Phần ${index + 1}`,
            url: audioUrl || '',
            time: '00:00',
          };
        });

        console.log('Final audio tracks:', tracks);
        setAudioTracks(tracks);

      } catch (error) {
        console.error('Lỗi lấy danh sách file audio:', error);
        setAudioTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAudioFiles();
  }, [bookData]);

  if (!bookData) {
    return <NotFoundPage />;
  }

  const book = bookData;
  const related = relatedData || [];
  const relatedMoreHref = book.category ? book.category.href : '/sach/';

  return (
    <>
      <PageBanner
        img={libraryBanner}
        crumbs={[
          { label: 'Trang chủ', href: '/' },
          { label: 'Sách nói', href: '/sach/' },
          ...(book.category ? [{ label: book.category.label, href: book.category.href }] : []),
          { label: book.title, href: `/sach/${book.slug}.html` },
          { label: `Audio - ${book.title}` },
        ]}
      />

      <main>
        <div className="container audio-page">
          {loading ? (
            <div className="text-center">
              <p>Đang tải danh sách audio...</p>
            </div>
          ) : audioTracks.length > 0 ? (
            <AudioPlayer
              title={book.title}
              img={book.img}
              tracks={audioTracks}
            />
          ) : (
            <div className="text-center">
              <h1>Không tìm thấy file audio</h1>
              <p>Sách này không có file audio hoặc đang được cập nhật.</p>
            </div>
          )}
        </div>

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
    </>
  );
}