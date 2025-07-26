import type { Product } from '../../domain/entities/Product';
import type { InventoryService } from '../../domain/services/InventoryService';

export const AddProduct = (inventoryService: InventoryService) => async (product: Product): Promise<string> => {
  return await inventoryService.addProduct(product);
}; 