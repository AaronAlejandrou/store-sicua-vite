import type { Product } from '../entities/Product';
import type { ProductRepository } from '../repositories/ProductRepository';

export class InventoryService {
  constructor(private productRepository: ProductRepository) {}

  async addProduct(product: Product): Promise<string> {
    // Validate fields, avoid duplicates by productId
    const existing = await this.productRepository.getById(product.productId);
    if (existing) throw new Error('Ya existe un producto con ese ID');
    return await this.productRepository.add(product);
  }

  async updateProduct(product: Product): Promise<void> {
    return await this.productRepository.update(product);
  }

  async deleteProduct(productId: string): Promise<void> {
    return await this.productRepository.delete(productId);
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.getById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (product.quantity < quantity) throw new Error('Stock insuficiente');
    product.quantity -= quantity;
    return await this.productRepository.update(product);
  }
} 