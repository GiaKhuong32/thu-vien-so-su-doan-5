import { api } from './client';

export interface ApiCategory {
  idCategory: string;
  categoryName: string;
  parentCategory?: {
    idCategory: string;
    categoryName: string;
  } | null;
}

export type CategoryMenuItem = {
  id: string;
  label: string;
  href: string;
  count?: number;
  children?: CategoryMenuItem[];
};

export function slugifyCategory(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function categoryHref(categoryName: string): string {
  return `/sach/${slugifyCategory(categoryName)}/`;
}

export function flattenCategories(items: CategoryMenuItem[]): CategoryMenuItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children?.length ? flattenCategories(item.children) : []),
  ]);
}

export function categorySlugFromParam(value: string): string {
  return value.replace(/\/$/, '').replace(/^\/sach\//, '');
}

export function findCategoryPath(
  items: CategoryMenuItem[],
  slug: string,
): CategoryMenuItem[] {
  const normalized = categorySlugFromParam(slug);
  if (!normalized) return [];

  for (const item of items) {
    if (item.id === 'all') continue;

    const itemSlug = slugifyCategory(item.label);
    if (itemSlug === normalized) {
      return [item];
    }

    if (item.children?.length) {
      const nested = findCategoryPath(item.children, normalized);
      if (nested.length) {
        return [item, ...nested];
      }
    }
  }

  return [];
}

export function collectCategoryIds(item: CategoryMenuItem): string[] {
  const ids = item.id && item.id !== 'all' ? [item.id] : [];
  if (!item.children?.length) return ids;
  return [...ids, ...item.children.flatMap(collectCategoryIds)];
}

function mapCategory(category: ApiCategory): CategoryMenuItem {
  return {
    id: category.idCategory,
    label: category.categoryName,
    href: categoryHref(category.categoryName),
  };
}

export const categoriesApi = {
  getParents: async (): Promise<ApiCategory[]> => {
    const categories = await api.get<ApiCategory[]>('/categories/tree');
    return categories;
  },

  getChildren: async (idCategory: string): Promise<ApiCategory[]> => {
    return api.get<ApiCategory[]>(`/categories/${idCategory}/children`);
  },

  getTreeWithChildren: async (): Promise<CategoryMenuItem[]> => {
    const parents = await categoriesApi.getParents();

    const childrenResults = await Promise.allSettled(
      parents.map((parent) => categoriesApi.getChildren(parent.idCategory)),
    );

    return parents.map((parent, index) => {
      const result = childrenResults[index];

      const children =
        result.status === 'fulfilled'
          ? result.value.map(mapCategory)
          : [];

      return {
        ...mapCategory(parent),
        children,
      };
    });
  },
};