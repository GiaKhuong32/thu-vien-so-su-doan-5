import { api } from './client';
import type { Book } from '../components/BookCard';
import type { BookDetail } from '../data/detail';
import { toApiUrl } from '../config/api';
import { categoryHref } from './categories';
import {
  type BookFile,
  findVideoFile,
  getBookFileUrl,
  getCategoryFiles,
  getDocumentFiles,
  isAudioFile,
  isPdfFile,
  isThumbnailFile,
  isVideoFile,
} from './bookFiles';

const VIDEO_CATEGORY_ID = 'bcfad00b-b624-4dd7-aad3-21581049b10c';
const VIDEO_CATEGORY_LABEL = 'Phim t\u00e0i li\u1ec7u';
const VIDEO_CATEGORY_HREF = '/sach/phim-tai-lieu/';

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
  document?: {
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
  qrCode?: string;
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

function normalizeText(value?: string): string {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSlugFromHref(href: string): string {
  return href
    .replace(/^\/sach\//, '')
    .replace(/\.html$/, '')
    .replace(/\/$/, '');
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
    idCategory: apiBook.categoryEntity?.idCategory,
    publishYear: apiBook.publishYear,
  };
}

function mapApiBookToBookDetail(apiBook: ApiBookDetail): BookDetail {
  const slug = slugify(apiBook.title);
  const rawImage = apiBook.thumbnail || apiBook.document?.thumbnail;

  const isAudiobook = apiBook.document?.typeDocument?.toUpperCase() === 'AUDIO' ||
                      (apiBook.thumbnail && apiBook.thumbnail.toLowerCase().includes('audio'));

  const categoryName = apiBook.categoryEntity?.categoryName;
  const idCategory = apiBook.categoryEntity?.idCategory;

  return {
    slug,
    title: apiBook.title,
    author: apiBook.author,
    idDocument: apiBook.document?.idDocument,
    img: toImageUrl(rawImage),
    rating: 0,
    formats: [],
    category: categoryName
      ? {
          id: idCategory,
          label: categoryName,
          href: categoryHref(categoryName),
        }
      : undefined,
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
    qrCode: apiBook.qrCode ? toImageUrl(apiBook.qrCode) : undefined,
    publishYear: apiBook.publishYear,
  };
}

function fileTitle(file: BookFile): string {
  const name = file.fileName || file.bookFile || 'Phim tài liệu';
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
}

function fileDateYear(file: BookFile): number | undefined {
  const year = file.createdAt ? new Date(file.createdAt).getFullYear() : NaN;
  return Number.isFinite(year) ? year : undefined;
}

function mapVideoFileToBook(file: BookFile): Book {
  const title = fileTitle(file);

  return {
    title,
    author: '',
    img: toImageUrl(file.thumbnail),
    href: `/sach/${slugify(title)}.html`,
    rating: 0,
    category: VIDEO_CATEGORY_LABEL,
    idCategory: VIDEO_CATEGORY_ID,
    publishYear: fileDateYear(file),
  };
}

function mapVideoFileToBookDetail(file: BookFile): BookDetail {
  const title = fileTitle(file);
  const slug = slugify(title);
  const videoUrl = getBookFileUrl(findVideoFile([file]));

  return {
    slug,
    title,
    author: '',
    img: toImageUrl(file.thumbnail),
    rating: 0,
    formats: [VIDEO_CATEGORY_LABEL, file.typeFile || 'MP4'],
    category: {
      id: VIDEO_CATEGORY_ID,
      label: VIDEO_CATEGORY_LABEL,
      href: VIDEO_CATEGORY_HREF,
    },
    actions: videoUrl
      ? [
          {
            label: 'Xem phim',
            kind: 'video',
            primary: true,
            href: videoUrl,
          },
        ]
      : [],
    catalog: [
      ...(file.idFile ? [`Mã file: ${file.idFile}`] : []),
      ...(file.typeFile ? [`Định dạng: ${file.typeFile}`] : []),
      ...(file.createdAt ? [`Ngày tạo: ${new Date(file.createdAt).toLocaleDateString('vi-VN')}`] : []),
    ],
    summary: [],
    related: [],
    publishYear: fileDateYear(file),
  };
}

async function getVideoBooks(): Promise<Book[]> {
  const files = await getCategoryFiles(VIDEO_CATEGORY_ID);

  return files.filter(isVideoFile).map(mapVideoFileToBook);
}

async function getVideoDetailBySlug(slugParam: string): Promise<BookDetail | null> {
  const files = await getCategoryFiles(VIDEO_CATEGORY_ID);
  const file = files.find((item) => isVideoFile(item) && slugify(fileTitle(item)) === slugParam);

  return file ? mapVideoFileToBookDetail(file) : null;
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
      const videoDetail = await getVideoDetailBySlug(slugParam);

      if (videoDetail) {
        return videoDetail;
      }

      throw new Error('Book not found');
    }

    try {
      const detail = await booksApi.getById(apiBook.idBook);
      if (detail.category?.id || !apiBook.categoryEntity) {
        return detail;
      }

      return {
        ...detail,
        category: {
          id: apiBook.categoryEntity.idCategory,
          label: apiBook.categoryEntity.categoryName,
          href: categoryHref(apiBook.categoryEntity.categoryName),
        },
      };
    } catch {
      return mapApiBookToBookDetail(apiBook);
    }
  },

  getByCategory: async (idCategory: string): Promise<Book[]> => {
    if (idCategory === VIDEO_CATEGORY_ID) {
      return getVideoBooks();
    }

    const response = await api.get<ApiBook[]>(`/books/category/${idCategory}`);
    return (Array.isArray(response) ? response : []).map(mapApiBookToBook);
  },

  getByCategoryIds: async (ids: string[]): Promise<Book[]> => {
    const uniqueIds = [...new Set(ids.filter(Boolean))];
    const lists = await Promise.allSettled(uniqueIds.map((id) => booksApi.getByCategory(id)));
    const seen = new Set<string>();
    const merged: Book[] = [];

    for (const result of lists) {
      if (result.status !== 'fulfilled') continue;
      for (const book of result.value) {
        if (seen.has(book.href)) continue;
        seen.add(book.href);
        merged.push(book);
      }
    }

    return merged;
  },

  getRelated: async (
    slug: string,
    limit = 5,
    idCategory?: string,
  ): Promise<Book[]> => {
    const excludeCurrent = (book: Book) => getSlugFromHref(book.href) !== slug;

    if (idCategory) {
      try {
        if (idCategory === VIDEO_CATEGORY_ID) {
          const videos = await getVideoBooks();
          return videos.filter(excludeCurrent).slice(0, limit);
        }

        const books = await booksApi.getByCategory(idCategory);
        return books.filter(excludeCurrent).slice(0, limit);
      } catch (error) {
        console.error('Không lấy được sách theo thể loại:', error);
      }
    }

    const allBooks = await booksApi.getAll();
    const current = allBooks.find((book) => getSlugFromHref(book.href) === slug);

    if (current?.idCategory) {
      const books = await booksApi.getByCategory(current.idCategory);
      return books.filter(excludeCurrent).slice(0, limit);
    }

    if (!current?.category) {
      return allBooks.filter(excludeCurrent).slice(0, limit);
    }

    const currentCategory = normalizeText(current.category);

    return allBooks
      .filter((book) => excludeCurrent(book) && normalizeText(book.category) === currentCategory)
      .slice(0, limit);
  },

  getNew: async (limit = 10): Promise<Book[]> => {
    const newestBooks = await api.get<ApiBook[]>('/books/newest');
    return (Array.isArray(newestBooks) ? newestBooks : [])
      .map(mapApiBookToBook)
      .slice(0, limit);
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
        const files = await getDocumentFiles(book.document?.idDocument);
        const contentFiles = files.filter((file) => !isThumbnailFile(file));

        if (type === 'paperbooks') {
          return documentType === 'BOOK' ? book : null;
        }

        if (type === 'ebooks') {
          return contentFiles.some(isPdfFile) ? book : null;
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

    const bookVideos = matchedBooks
      .filter((book): book is ApiBook => Boolean(book))
      .map(mapApiBookToBook);

    if (type !== 'videobooks') {
      return bookVideos;
    }

    const fileVideos = await getVideoBooks();
    const seen = new Set(fileVideos.map((book) => book.href));

    return [
      ...fileVideos,
      ...bookVideos.filter((book) => !seen.has(book.href)),
    ];
  },
};
