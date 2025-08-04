import type { Product, CreateProductRequest, UpdateProductRequest } from '../entities/Product';

export interface ProductRepository {
  getAll(): Promise<Product[]>;
  getById(productId: string): Promise<Product | undefined>;
  getByName(name: string): Promise<Product | undefined>;
  create(product: CreateProductRequest): Promise<Product>;
  update(productId: string, product: UpdateProductRequest): Promise<Product>;
  delete(productId: string, force?: boolean): Promise<void>;
} 