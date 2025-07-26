import type { Product } from '../../domain/entities/Product';
import type { InventoryService } from '../../domain/services/InventoryService';

export const EditProduct = (inventoryService: InventoryService) => async (product: Product): Promise<void> => {
  return await inventoryService.updateProduct(product);
}; 