import { useApi } from './useApi';
import { booksApi } from '../api/books';

export function useBooks() {
  return useApi(() => booksApi.getAll());
}

export function useBookDetail(slug: string) {
  return useApi(
    async () => {
      return booksApi.getBySlug(slug);
    },
    !!slug,
    [slug]
  );
}

export function useRelatedBooks(slug: string, limit = 5) {
  return useApi(
    async () => {
      return booksApi.getRelated(slug, limit);
    },
    !!slug,
    [slug, limit]
  );
}

export function useNewBooks(limit = 10) {
  return useApi(() => booksApi.getNew(limit));
}

export function useSuggestedBooks(limit = 6) {
  return useApi(() => booksApi.getSuggested(limit));
}

export function useBooksByType(
  type: 'ebooks' | 'paperbooks' | 'audiobooks' | 'videobooks'
) {
  return useApi(() => booksApi.getByType(type));
}