import type { Sale } from '../entities/Sale';
import type { SaleRepository, CreateSaleRequest } from '../repositories/SaleRepository';
import type { ProductRepository } from '../repositories/ProductRepository';
import type { UpdateProductRequest } from '../entities/Product';

export class SaleService {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async makeSale(saleData: CreateSaleRequest): Promise<Sale> {
    // Decrement stock for each product
    for (const item of saleData.items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) throw new Error('Producto no encontrado');
      if (product.quantity < item.quantity) throw new Error('Stock insuficiente');
      
      const updatedProductData: UpdateProductRequest = {
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: product.quantity - item.quantity,
        brand: product.brand
      };
      
      await this.productRepository.update(item.productId, updatedProductData);
    }
    return await this.saleRepository.create(saleData);
  }

  async markAsInvoiced(saleId: string): Promise<void> {
    return await this.saleRepository.markAsInvoiced(saleId);
  }
} 