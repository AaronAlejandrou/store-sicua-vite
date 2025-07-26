import type { Sale } from '../entities/Sale';

export interface SaleRepository {
  getAll(): Promise<Sale[]>;
  getById(saleId: string): Promise<Sale | undefined>;
  add(sale: Sale): Promise<string>;
  update(sale: Sale): Promise<void>;
} 