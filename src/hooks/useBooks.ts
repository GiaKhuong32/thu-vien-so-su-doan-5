import { useApi } from './useApi';
import { booksApi, ApiBook } from '../api/books';
import { api } from '../api/client';
import { newBooks, suggestBooks, eBooks, paperBooks, audioBooks, videoBooks } from '../data/books';
import { bookBySlug, relatedBooks } from '../data/detail';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function useBooks() {
  return useApi(() => booksApi.getAll());
}

export function useBookDetail(slug: string) {
  return useApi(
    async () => {
      try {
        return await booksApi.getBySlug(slug);
      } catch (error) {
        console.warn('API failed, using static data for book detail:', error);
        const staticBook = bookBySlug[slug];
        if (!staticBook) {
          throw new Error('Book not found');
        }
        return staticBook;
      }
    },
    !!slug
  );
}

export function useRelatedBooks(slug: string, limit = 5) {
  return useApi(
    async () => {
      try {
        return await booksApi.getRelated(slug, limit);
      } catch (error) {
        console.warn('API failed, using static data for related books:', error);
        const staticBook = bookBySlug[slug];
        if (!staticBook) {
          return [];
        }
        return relatedBooks(staticBook, limit);
      }
    },
    !!slug
  );
}

export function useNewBooks(limit = 10) {
  return useApi(
    async () => {
      try {
        const books = await booksApi.getAll();
        // Nếu API trả về danh sách có dữ liệu thì lấy từ API
        if (books && books.length > 0) {
          return books.slice(0, limit);
        }
        return newBooks.slice(0, limit);
      } catch (error) {
        console.warn('API failed, using static data for new books:', error);
        return newBooks.slice(0, limit);
      }
    }
  );
}

export function useSuggestedBooks(limit = 6) {
  return useApi(
    async () => {
      try {
        const books = await booksApi.getAll();
        if (books && books.length > 0) {
          return books.slice(0, limit);
        }
        return suggestBooks.slice(0, limit);
      } catch (error) {
        console.warn('API failed, using static data for suggested books:', error);
        return suggestBooks.slice(0, limit);
      }
    }
  );
}

export function useBooksByType(type: 'ebooks' | 'paperbooks' | 'audiobooks' | 'videobooks') {
  return useApi(
    async () => {
      try {
        const rawBooks = await api.get<ApiBook[]>('/books/getAll');
        
        if (!rawBooks || !Array.isArray(rawBooks)) {
          throw new Error('Invalid response structure');
        }

        const filtered = rawBooks.filter((book) => {
          const docType = book.document?.typeDocument?.toUpperCase();
          if (type === 'paperbooks') return docType === 'BOOK';
          if (type === 'ebooks') return docType === 'DIGITAL' || !!book.document?.content;
          if (type === 'audiobooks') return docType === 'AUDIO';
          if (type === 'videobooks') return docType === 'VIDEO';
          return true;
        });

        // Nếu phân loại từ API có sách, dùng dữ liệu API
        if (filtered.length > 0) {
          return filtered.map((apiBook) => ({
            title: apiBook.title,
            author: apiBook.author,
            img: apiBook.thumbnail || apiBook.document?.thumbnail || '',
            href: `/sach/${slugify(apiBook.title)}.html`,
            rating: 0,
          }));
        }

        // Nếu API không có sách thuộc loại này, hiển thị toàn bộ sách API lấy từ getAll
        return rawBooks.map((apiBook) => ({
          title: apiBook.title,
          author: apiBook.author,
          img: apiBook.thumbnail || apiBook.document?.thumbnail || '',
          href: `/sach/${slugify(apiBook.title)}.html`,
          rating: 0,
        }));

      } catch (error) {
        console.warn('API failed, using static data for books by type:', error);
        switch (type) {
          case 'ebooks':
            return eBooks;
          case 'paperbooks':
            return paperBooks;
          case 'audiobooks':
            return audioBooks;
          case 'videobooks':
            return videoBooks;
          default:
            return [];
        }
      }
    }
  );
}