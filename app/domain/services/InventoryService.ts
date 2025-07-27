import type { Product, CreateProductRequest, UpdateProductRequest } from '../entities/Product';
import type { ProductRepository } from '../repositories/ProductRepository';

export class InventoryService {
  constructor(private productRepository: ProductRepository) {}

  async addProduct(productData: CreateProductRequest): Promise<Product> {
    // Validate fields, avoid duplicates by name (since we don't have productId yet)
    const existing = await this.productRepository.getByName(productData.name);
    if (existing) throw new Error('Ya existe un producto con ese nombre');
    return await this.productRepository.create(productData);
  }

  async updateProduct(productId: string, productData: UpdateProductRequest): Promise<Product> {
    return await this.productRepository.update(productId, productData);
  }

  async deleteProduct(productId: string): Promise<void> {
    return await this.productRepository.delete(productId);
  }

  async decrementStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.getById(productId);
    if (!product) throw new Error('Producto no encontrado');
    if (product.quantity < quantity) throw new Error('Stock insuficiente');
    
    const updatedData: UpdateProductRequest = {
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity - quantity
    };
    
    await this.productRepository.update(productId, updatedData);
  }
} 