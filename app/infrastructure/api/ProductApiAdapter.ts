import { httpClient } from '../http/HttpClient';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';

export class ProductApiAdapter implements ProductRepository {
  async getAll(): Promise<Product[]> {
    return httpClient.get<Product[]>('/products');
  }

  async create(product: CreateProductRequest): Promise<Product> {
    return httpClient.post<Product>('/products', product);
  }

  async update(productId: string, product: UpdateProductRequest): Promise<Product> {
    return httpClient.put<Product>(`/products/${productId}`, product);
  }

  async delete(productId: string, force: boolean = false): Promise<void> {
    const url = force ? `/products/${productId}?force=true` : `/products/${productId}`;
    return httpClient.delete<void>(url);
  }

  async getById(productId: string): Promise<Product | undefined> {
    try {
      return await httpClient.get<Product>(`/products/${productId}`);
    } catch (error) {
      // Si el producto no existe, devolvemos undefined
      return undefined;
    }
  }

  async getByName(name: string): Promise<Product | undefined> {
    try {
      const products = await this.getAll();
      return products.find(p => p.name.toLowerCase() === name.toLowerCase());
    } catch (error) {
      return undefined;
    }
  }
}
