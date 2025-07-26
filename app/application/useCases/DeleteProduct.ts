import type { InventoryService } from '../../domain/services/InventoryService';

export const DeleteProduct = (inventoryService: InventoryService) => async (productId: string): Promise<void> => {
  return await inventoryService.deleteProduct(productId);
}; 