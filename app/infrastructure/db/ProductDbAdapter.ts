import { db } from './db';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { Product } from '../../domain/entities/Product';

export class ProductDbAdapter implements ProductRepository {
  async getAll(): Promise<Product[]> {
    return await db.productos.toArray();
  }
  
  async getById(productId: string): Promise<Product | undefined> {
    return await db.productos.get(productId);
  }
  
  async add(product: Product): Promise<string> {
    return await db.productos.add(product);
  }
  
  async update(product: Product): Promise<void> {
    await db.productos.put(product);
  }
  
  async delete(productId: string): Promise<void> {
    return await db.productos.delete(productId);
  }
} 