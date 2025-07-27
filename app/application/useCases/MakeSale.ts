import type { Sale } from '../../domain/entities/Sale';
import type { CreateSaleRequest } from '../../domain/repositories/SaleRepository';
import type { SaleService } from '../../domain/services/SaleService';

export const MakeSale = (saleService: SaleService) => async (saleData: CreateSaleRequest): Promise<Sale> => {
  return await saleService.makeSale(saleData);
}; 