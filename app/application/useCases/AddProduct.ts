import type { CreateProductRequest, Product } from '../../domain/entities/Product';
import type { InventoryService } from '../../domain/services/InventoryService';

export const AddProduct = (inventoryService: InventoryService) => async (productData: CreateProductRequest): Promise<Product> => {
  return await inventoryService.addProduct(productData);
}; 