import { api } from './client';
import type { Book } from '../components/BookCard';
import type { BookDetail } from '../data/detail';
import { API_BASE_URL, toApiUrl } from '../config/api';

export interface CategoryEntity {
  idCategory: string;
  categoryName: string;
}

export interface ApiBook {
  idBook: string;
  title: string;
  author: string;
  publisher: string;
  publishYear: number;
  thumbnail: string;
  bookCode: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  categoryEntity?: CategoryEntity;
  document: {
    idDocument: string;
    title: string;
    typeDocument: string;
    status: string;
    thumbnail: string;
    content: string | null;
  };
}

export interface ApiBookDetail extends ApiBook {
  description?: string;
  summary?: string;
  content?: string;
  details?: string;
  categories?: string[];
  formats?: string[];
}

interface ApiBookFile {
  bookFile?: string;
  fileName?: string;
  idFile?: string;
  partFile?: string;
  thumbnail?: string;
  typeFile?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

function toImageUrl(value?: string | null): string {
  if (!value) return 'https://via.placeholder.com/300x400?text=No+Cover';
  return toApiUrl(value);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapApiBookToBook(apiBook: ApiBook): Book {
  const slug = slugify(apiBook.title);
  const rawImage = apiBook.thumbnail || apiBook.document?.thumbnail;

  return {
    title: apiBook.title,
    author: apiBook.author,
    img: toImageUrl(rawImage),
    href: `/sach/${slug}.html`,
    rating: 0,
    category: apiBook.categoryEntity?.categoryName,
  };
}

function mapApiBookToBookDetail(apiBook: ApiBookDetail): BookDetail {
  const slug = slugify(apiBook.title);
  const rawImage = apiBook.thumbnail || apiBook.document?.thumbnail;

  const isAudiobook = apiBook.document?.typeDocument?.toUpperCase() === 'AUDIO' ||
                      (apiBook.thumbnail && apiBook.thumbnail.toLowerCase().includes('audio'));

  // Map category name to href
  const categoryMap: Record<string, string> = {
    'Tài liệu huấn luyện': '/sach/tai-lieu-huan-luyen/',
    'Tài liệu chính trị': '/sach/tai-lieu-chinh-tri/',
    'Lịch sử': '/sach/lich-su/',
    'Văn học': '/sach/van-hoc/',
    'Khoa học': '/sach/khoa-hoc/',
    'Ngôn ngữ học': '/sach/ngon-ngu-hoc/',
    'Phim tài liệu': '/sach/phim-tai-lieu/',
    'Tài liệu khác': '/sach/tai-lieu-khac/',
  };

  const categoryName = apiBook.categoryEntity?.categoryName || 'Sách';
  let categoryHref = '/sach/';

  // Try exact match first
  if (categoryMap[categoryName]) {
    categoryHref = categoryMap[categoryName];
  } else {
    // Try case-insensitive match
    const normalizedCategoryName = categoryName.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (key.toLowerCase() === normalizedCategoryName) {
        categoryHref = value;
        break;
      }
    }
  }

  console.log(`Book: ${apiBook.title}, Category: ${categoryName}, Href: ${categoryHref}`);

  return {
    slug,
    title: apiBook.title,
    author: apiBook.author,
    idDocument: apiBook.document?.idDocument,
    img: toImageUrl(rawImage),
    rating: 0,
    formats: [],
    category: {
      label: categoryName,
      href: categoryHref,
    },
    actions: isAudiobook ? [
      {
        label: 'Audio',
        kind: 'audio',
        primary: true,
        href: `/sach/${slug}/Audio.html`,
      }
    ] : [],
    catalog: [
      `Mã sách: ${apiBook.bookCode}`,
      `Năm xuất bản: ${apiBook.publishYear}`,
      `Nhà xuất bản: ${apiBook.publisher}`,
      `Vị trí kệ: ${apiBook.shelfLocation}`,
      `Số lượng: ${apiBook.availableCopies}/${apiBook.totalCopies}`,
    ],
    summary: apiBook.description || apiBook.summary || apiBook.content || apiBook.details ?
      [apiBook.description || apiBook.summary || apiBook.content || apiBook.details || ''] : [],
    related: [],
  };
}

async function getBookFiles(idDocument?: string): Promise<ApiBookFile[]> {
  if (!idDocument) return [];

  const response = await fetch(`${API_BASE_URL}/files/document/${idDocument}`, {
    method: 'GET',
    headers: {
      Accept: '*/*',
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();

  return Array.isArray(data?.Result)
    ? data.Result
    : Array.isArray(data?.result)
      ? data.result
      : [];
}

function normalizeBookFile(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll('_', ' ');
}

function isDigitalFile(file: ApiBookFile): boolean {
  const bookFile = normalizeBookFile(file.bookFile);
  const typeFile = (file.typeFile || '').toLowerCase();
  const fileName = (file.fileName || '').toLowerCase();

  return (
    bookFile.includes('sach so') ||
    typeFile === 'pdf' ||
    fileName.endsWith('.pdf')
  );
}

function isAudioFile(file: ApiBookFile): boolean {
  const bookFile = normalizeBookFile(file.bookFile);
  const typeFile = (file.typeFile || '').toLowerCase();
  const fileName = (file.fileName || '').toLowerCase();

  return (
    bookFile.includes('sach noi') ||
    typeFile === 'mp3' ||
    typeFile.includes('audio') ||
    fileName.endsWith('.mp3') ||
    fileName.endsWith('.wav')
  );
}

function isThumbnailFile(file: ApiBookFile): boolean {
  return normalizeBookFile(file.bookFile).includes('thumbnail');
}

export const booksApi = {
  getAll: async (): Promise<Book[]> => {
    const response = await api.get<ApiBook[]>('/books/getAll');
    return response.map(mapApiBookToBook);
  },

  getById: async (id: string): Promise<BookDetail> => {
    const response = await api.get<ApiBookDetail>(`/books/${id}`);
    return mapApiBookToBookDetail(response);
  },

  getBySlug: async (slugParam: string): Promise<BookDetail> => {
    const response = await api.get<ApiBook[]>('/books/getAll');
    const apiBook = response.find((book) => slugify(book.title) === slugParam);

    if (!apiBook) {
      throw new Error('Book not found');
    }

    try {
      return await booksApi.getById(apiBook.idBook);
    } catch {
      return mapApiBookToBookDetail(apiBook);
    }
  },

  getRelated: async (_slug: string, limit = 5): Promise<Book[]> => {
    const allBooks = await booksApi.getAll();
    return allBooks.slice(0, limit);
  },

  getNew: async (limit = 10): Promise<Book[]> => {
    const allBooks = await booksApi.getAll();
    return allBooks.slice(0, limit);
  },

  getSuggested: async (limit = 6): Promise<Book[]> => {
    const allBooks = await booksApi.getAll();
    return allBooks.slice(0, limit);
  },

  getByType: async (
    type: 'ebooks' | 'paperbooks' | 'audiobooks' | 'videobooks'
  ): Promise<Book[]> => {
    const allBooks = await api.get<ApiBook[]>('/books/getAll');

    const matchedBooks = await Promise.all(
      allBooks.map(async (book) => {
        const documentType = book.document?.typeDocument?.toUpperCase();
        const files = await getBookFiles(book.document?.idDocument);
        const contentFiles = files.filter((file) => !isThumbnailFile(file));

        if (type === 'paperbooks') {
          return documentType === 'BOOK' ? book : null;
        }

        if (type === 'ebooks') {
          return contentFiles.some(isDigitalFile) ? book : null;
        }

        if (type === 'audiobooks') {
          return contentFiles.some(isAudioFile) ? book : null;
        }

        if (type === 'videobooks') {
          return documentType === 'VIDEO' ? book : null;
        }

        return null;
      })
    );

    return matchedBooks
      .filter((book): book is ApiBook => Boolean(book))
      .map(mapApiBookToBook);
  },
};
