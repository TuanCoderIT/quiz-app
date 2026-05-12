// src/types/category.ts
export interface Category {
  id: number | string; // Sử dụng number hoặc string tùy theo API
  name: string;
  slug?: string;
  color?: string;
  is_active?: boolean;
}
export interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | number;
  onCategoryChange: (id: string | number) => void;
}
