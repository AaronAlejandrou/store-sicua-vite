import type { Product } from '../entities/Product';

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(productId: string): Promise<Product | undefined>;
  add(product: Product): Promise<string>;
  update(product: Product): Promise<void>;
  delete(productId: string): Promise<void>;
} 