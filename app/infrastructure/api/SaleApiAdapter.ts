import { httpClient } from '../http/HttpClient';
import type { Sale } from '../../domain/entities/Sale';
import type { SaleRepository, CreateSaleRequest } from '../../domain/repositories/SaleRepository';

export class SaleApiAdapter implements SaleRepository {
  async getAll(): Promise<Sale[]> {
    return httpClient.get<Sale[]>('/sales');
  }

  async create(saleData: CreateSaleRequest): Promise<Sale> {
    return httpClient.post<Sale>('/sales', saleData);
  }

  async getById(saleId: string): Promise<Sale | undefined> {
    try {
      return await httpClient.get<Sale>(`/sales/${saleId}`);
    } catch (error) {
      return undefined;
    }
  }

  async markAsInvoiced(saleId: string): Promise<void> {
    return httpClient.put<void>(`/sales/${saleId}/invoice`, {});
  }

  async getByDateRange(startDate: string, endDate: string): Promise<Sale[]> {
    const allSales = await this.getAll();
    return allSales.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return saleDate >= start && saleDate <= end;
    });
  }
}
