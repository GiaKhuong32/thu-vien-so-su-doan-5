import { useEffect, useState } from 'react';
import { categoriesApi, type CategoryMenuItem } from '../api/categories';

const allCategory: CategoryMenuItem = {
  id: 'all',
  label: 'Tất cả',
  href: '/sach/',
};

export function useCategories(options?: { includeAll?: boolean }) {
  const includeAll = options?.includeAll ?? false;
  const [categories, setCategories] = useState<CategoryMenuItem[]>(
    includeAll ? [allCategory] : [],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const tree = await categoriesApi.getTreeWithChildren();
      if (!cancelled) {
        setCategories(includeAll ? [allCategory, ...tree] : tree);
      }
    }

    load().catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [includeAll]);

  return categories;
}