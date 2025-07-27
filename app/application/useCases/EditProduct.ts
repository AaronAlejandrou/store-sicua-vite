import type { UpdateProductRequest, Product } from '../../domain/entities/Product';
import type { InventoryService } from '../../domain/services/InventoryService';

export const EditProduct = (inventoryService: InventoryService) => async (productId: string, productData: UpdateProductRequest): Promise<Product> => {
  return await inventoryService.updateProduct(productId, productData);
}; 