import { useEffect, useState } from 'react';
import { categoriesApi, type CategoryMenuItem } from '../api/categories';

const allCategory: CategoryMenuItem = {
  id: 'all',
  label: 'Tất cả',
  href: '/sach/',
};

const CATEGORY_CACHE_KEY = 'thuvienso_categories_cache';

function withAll(includeAll: boolean, items: CategoryMenuItem[]) {
  return includeAll ? [allCategory, ...items] : items;
}

function moveOtherToEnd(items: CategoryMenuItem[]): CategoryMenuItem[] {
  const otherItem = items.find(item =>
    item.label === 'Khác' || item.label === 'Tài liệu khác'
  );

  if (!otherItem) return items;

  const filtered = items.filter(item =>
    item.label !== 'Khác' && item.label !== 'Tài liệu khác'
  );

  return [...filtered, otherItem];
}

function readCachedCategories(): CategoryMenuItem[] {
  try {
    const raw = sessionStorage.getItem(CATEGORY_CACHE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCachedCategories(items: CategoryMenuItem[]) {
  try {
    sessionStorage.setItem(CATEGORY_CACHE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors
  }
}

export function useCategories(options?: { includeAll?: boolean }) {
  const includeAll = options?.includeAll ?? false;

  const [categories, setCategories] = useState<CategoryMenuItem[]>(() => {
    const cached = readCachedCategories();
    return moveOtherToEnd(withAll(includeAll, cached));
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const tree = await categoriesApi.getTreeWithChildren();

        if (cancelled) return;

        saveCachedCategories(tree);
        setCategories(moveOtherToEnd(withAll(includeAll, tree)));
      } catch (err) {
        console.error('[useCategories] Không tải được danh mục:', err);

        if (cancelled) return;

        const cached = readCachedCategories();
        setCategories(moveOtherToEnd(withAll(includeAll, cached)));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [includeAll]);

  return categories;
}