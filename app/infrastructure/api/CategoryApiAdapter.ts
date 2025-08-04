import { HttpClient } from '../http/HttpClient';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../domain/entities/Category';
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository';

export class CategoryApiAdapter implements CategoryRepository {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  async getAll(): Promise<Category[]> {
    const response = await this.httpClient.get<Category[]>('/categories');
    return response;
  }

  async getById(categoryId: string): Promise<Category | null> {
    try {
      const response = await this.httpClient.get<Category>(`/categories/${categoryId}`);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getByNumber(categoryNumber: number): Promise<Category | null> {
    try {
      const response = await this.httpClient.get<Category>(`/categories/number/${categoryNumber}`);
      return response;
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(request: CreateCategoryRequest): Promise<Category> {
    const response = await this.httpClient.post<Category>('/categories', request);
    return response;
  }

  async update(categoryId: string, request: UpdateCategoryRequest): Promise<Category> {
    const response = await this.httpClient.put<Category>(`/categories/${categoryId}`, request);
    return response;
  }

  async delete(categoryId: string): Promise<void> {
    await this.httpClient.delete(`/categories/${categoryId}`);
  }

  async getNextCategoryNumber(): Promise<number> {
    const response = await this.httpClient.get<number>('/categories/next-number');
    return response;
  }
}
