import type { Sale } from '../entities/Sale';
import type { SaleRepository } from '../repositories/SaleRepository';
import type { ProductRepository } from '../repositories/ProductRepository';

export class SaleService {
  constructor(
    private saleRepository: SaleRepository,
    private productRepository: ProductRepository
  ) {}

  async makeSale(sale: Sale): Promise<string> {
    // Decrement stock for each product
    for (const item of sale.items) {
      const product = await this.productRepository.getById(item.productId);
      if (!product) throw new Error('Producto no encontrado');
      if (product.quantity < item.quantity) throw new Error('Stock insuficiente');
      product.quantity -= item.quantity;
      await this.productRepository.update(product);
    }
    return await this.saleRepository.add(sale);
  }

  async markAsInvoiced(saleId: string): Promise<void> {
    const sale = await this.saleRepository.getById(saleId);
    if (!sale) throw new Error('Venta no encontrada');
    sale.invoiced = true;
    return await this.saleRepository.update(sale);
  }
} 