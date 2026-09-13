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