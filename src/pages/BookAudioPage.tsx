import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BookSection from '../components/BookSection';
import PageBanner from '../components/PageBanner/PageBanner';
import NotFoundPage from './NotFoundPage';
import { useBookDetail, useRelatedBooks } from '../hooks/useBooks';
import { libraryBanner } from '../data/library';
import AudioPlayer, { type AudioTrack } from '../components/AudioPlayer/AudioPlayer';

interface BookFile {
  bookFile?: string;
  fileName?: string;
  idFile?: string;
  partFile?: string;
  thumbnail?: string;
  typeFile?: string;
  fileUrl?: string;
  filePath?: string;
  content?: string;
  speakFile?: string; // URL audio public
}

const API_BASE = 'http://192.168.2.46:8080';

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
        const response = await fetch(
          `${API_BASE}/files/document/${idDocument}`,
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
        console.log('Dữ liệu API files:', data);

        const files: BookFile[] = Array.isArray(data?.Result)
          ? data.Result
          : Array.isArray(data?.result)
            ? data.result
            : [];

        console.log('Files sau khi parse:', files);

        // Lọc ra các file audio và chuyển đổi thành AudioTrack
        const audioFiles = files.filter((file) => {
          const fileType = file.bookFile?.toLowerCase() || '';
          const fileName = file.fileName?.toLowerCase() || '';
          const typeFile = file.typeFile?.toLowerCase() || '';
          const hasSpeakFile = !!file.speakFile; // Có URL audio public
          
          const isAudio = 
            fileType.includes('audio') || 
            fileName.includes('.mp3') || 
            fileName.includes('.wav') ||
            typeFile.includes('audio') ||
            typeFile.includes('mp3') ||
            hasSpeakFile;
          
          console.log(`File ${file.fileName}: fileType=${fileType}, typeFile=${typeFile}, hasSpeakFile=${hasSpeakFile}, isAudio=${isAudio}`);
          return isAudio;
        });

        console.log('Audio files sau khi filter:', audioFiles);

        // Tạo tracks với URL audio public
        const tracks: AudioTrack[] = audioFiles.map((file, index) => {
          const audioUrl =
            file.partFile ||
            file.speakFile ||
            file.fileUrl ||
            file.filePath ||
            file.content ||
            `${API_BASE}/files/download/${file.idFile}`;
          
          console.log(`Audio track ${index}: title=${file.fileName}, url=${audioUrl}`);
          
          return {
            title: file.fileName || `Phần ${index + 1}`,
            url: audioUrl,
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
          { label: 'Thư viện', href: '/sach/' },
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