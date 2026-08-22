import { api } from './client';
import type { Book } from '../components/BookCard';
import type { BookDetail } from '../data/detail';

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
  categories?: string[];
  formats?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  result: T;
}

const API_ORIGIN = 'http://192.168.2.46:8080';

// Hàm chuẩn hóa đường dẫn ảnh từ Backend / MinIO
function toImageUrl(value?: string | null): string {
  if (!value) return 'https://via.placeholder.com/300x400?text=No+Cover';

  // 1. Link tuyệt đối (MinIO presigned URL, HTTPS, base64)
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }

  // 2. Link tương đối
  const cleanPath = value.startsWith('/') ? value : `/${value}`;
  return `${API_ORIGIN}${cleanPath}`;
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
  };
}

function mapApiBookToBookDetail(apiBook: ApiBookDetail): BookDetail {
  const slug = slugify(apiBook.title);
  const rawImage = apiBook.thumbnail || apiBook.document?.thumbnail;
  
  const formats: string[] = [];
  if (apiBook.categoryEntity?.categoryName) {
    formats.push(apiBook.categoryEntity.categoryName);
  } else {
    if (apiBook.document?.typeDocument === 'BOOK') {
      formats.push('Sách giấy');
    }
    if (apiBook.document?.content) {
      formats.push('Sách số');
    }
  }
  
  return {
    slug,
    title: apiBook.title,
    author: apiBook.author,
    img: toImageUrl(rawImage),
    rating: 0,
    formats,
    category: {
      label: apiBook.categoryEntity?.categoryName || 'Sách',
      href: '/sach/',
    },
    actions: formats.map((format) => ({
      label: format.toLowerCase().includes('pdf') || format.toLowerCase().includes('số') ? 'Mượn sách' : format,
      kind: format.toLowerCase().includes('pdf') || format.toLowerCase().includes('số') ? 'pdf' : 'paper',
      primary: true,
      href: '',
    })),
    catalog: [
      `Mã sách: ${apiBook.bookCode}`,
      `Năm xuất bản: ${apiBook.publishYear}`,
      `Nhà xuất bản: ${apiBook.publisher}`,
      `Vị trí kệ: ${apiBook.shelfLocation}`,
      `Số lượng: ${apiBook.availableCopies}/${apiBook.totalCopies}`,
    ],
    summary: apiBook.description ? [apiBook.description] : [],
    related: [],
  };
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
};