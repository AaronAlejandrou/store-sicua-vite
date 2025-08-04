import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../entities/Category';

export interface CategoryRepository {
  getAll(): Promise<Category[]>;
  getById(categoryId: string): Promise<Category | null>;
  getByNumber(categoryNumber: number): Promise<Category | null>;
  create(request: CreateCategoryRequest): Promise<Category>;
  update(categoryId: string, request: UpdateCategoryRequest): Promise<Category>;
  delete(categoryId: string): Promise<void>;
  getNextCategoryNumber(): Promise<number>;
}
