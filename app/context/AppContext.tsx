import React, { createContext, useContext, useMemo } from 'react';

// Import API adapters
import { ProductApiAdapter } from '../infrastructure/api/ProductApiAdapter';
import { SaleApiAdapter } from '../infrastructure/api/SaleApiAdapter';
import { StoreConfigApiAdapter } from '../infrastructure/api/StoreConfigApiAdapter';
import { CategoryApiAdapter } from '../infrastructure/api/CategoryApiAdapter';

// Import HTTP client
import { HttpClient } from '../infrastructure/http/HttpClient';

// Import business services
import { InventoryService } from '../domain/services/InventoryService';
import { SaleService } from '../domain/services/SaleService';
import { CategoryService } from '../domain/services/CategoryService';

// Import all use cases
import { AddProduct } from '../application/useCases/AddProduct';
import { EditProduct } from '../application/useCases/EditProduct';
import { DeleteProduct } from '../application/useCases/DeleteProduct';
import { MakeSale } from '../application/useCases/MakeSale';
import { MarkSaleAsInvoiced } from '../application/useCases/MarkSaleAsInvoiced';

// Create context
const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ===== HTTP CLIENT =====
  const httpClient = useMemo(() => new HttpClient(), []);

  // ===== REPOSITORIES (Data access) =====
  const productRepo = useMemo(() => new ProductApiAdapter(), []);
  const saleRepo = useMemo(() => new SaleApiAdapter(), []);
  const configRepo = useMemo(() => new StoreConfigApiAdapter(), []);
  const categoryRepo = useMemo(() => new CategoryApiAdapter(httpClient), [httpClient]);

  // ===== BUSINESS SERVICES =====
  const inventoryService = useMemo(() => new InventoryService(productRepo), [productRepo]);
  const saleService = useMemo(() => new SaleService(saleRepo, productRepo), [saleRepo, productRepo]);
  const categoryService = useMemo(() => new CategoryService(categoryRepo), [categoryRepo]);

  // ===== USE CASES (Main app functions) =====
  const useCases = useMemo(() => ({
    // Product management
    addProduct: AddProduct(inventoryService),
    editProduct: EditProduct(inventoryService),
    deleteProduct: DeleteProduct(inventoryService),
    
    // Sale management
    makeSale: MakeSale(saleService),
    markSaleAsInvoiced: MarkSaleAsInvoiced(saleService),
    
    // Services for direct access
    categoryService,
    
    // Repositories for direct data access
    productRepo,
    saleRepo,
    configRepo,
    categoryRepo
  }), [inventoryService, saleService, categoryService, productRepo, saleRepo, configRepo, categoryRepo]);

  return (
    <AppContext.Provider value={useCases}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
} 