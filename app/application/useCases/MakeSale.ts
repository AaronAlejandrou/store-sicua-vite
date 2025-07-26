import type { Sale } from '../../domain/entities/Sale';
import type { SaleService } from '../../domain/services/SaleService';

export const MakeSale = (saleService: SaleService) => async (sale: Sale): Promise<string> => {
  return await saleService.makeSale(sale);
}; 