import type { Sale } from '../entities/Sale';

export interface CreateSaleRequest {
  clientDni: string | null;
  clientName: string | null;
  items: Array<{
    productId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
}

export interface SaleRepository {
  getAll(): Promise<Sale[]>;
  getById(saleId: string): Promise<Sale | undefined>;
  create(saleData: CreateSaleRequest): Promise<Sale>;
  markAsInvoiced(saleId: string): Promise<void>;
} 