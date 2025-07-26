import { db } from './db';
import type { SaleRepository } from '../../domain/repositories/SaleRepository';
import type { Sale } from '../../domain/entities/Sale';

export class SaleDbAdapter implements SaleRepository {
  async getAll(): Promise<Sale[]> {
    return await db.ventas.toArray();
  }
  
  async getById(saleId: string): Promise<Sale | undefined> {
    return await db.ventas.get(saleId);
  }
  
  async add(sale: Sale): Promise<string> {
    return await db.ventas.add(sale);
  }
  
  async update(sale: Sale): Promise<void> {
    await db.ventas.put(sale);
  }
} 