import type { SaleService } from '../../domain/services/SaleService';

export const MarkSaleAsInvoiced = (saleService: SaleService) => async (saleId: string): Promise<void> => {
  return await saleService.markAsInvoiced(saleId);
}; 