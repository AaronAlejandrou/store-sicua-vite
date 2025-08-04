export interface Category {
  categoryId: string;
  name: string;
  categoryNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  categoryNumber: number;
}

export interface UpdateCategoryRequest {
  name: string;
  categoryNumber: number;
}

export interface CategoryOption {
  value: number;
  label: string;
  displayText: string; // "1 - Hombre - Casaca" format
}
