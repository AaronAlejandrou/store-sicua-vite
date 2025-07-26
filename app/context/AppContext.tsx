import React, { createContext, useContext, useMemo } from 'react';

// Import database adapters
import { ProductDbAdapter } from '../infrastructure/db/ProductDbAdapter';
import { SaleDbAdapter } from '../infrastructure/db/SaleDbAdapter';
import { StoreConfigDbAdapter } from '../infrastructure/db/StoreConfigDbAdapter';

// Import business services
import { InventoryService } from '../domain/services/InventoryService';
import { SaleService } from '../domain/services/SaleService';

// Import all use cases
import { AddProduct } from '../application/useCases/AddProduct';
import { EditProduct } from '../application/useCases/EditProduct';
import { DeleteProduct } from '../application/useCases/DeleteProduct';
import { MakeSale } from '../application/useCases/MakeSale';
import { MarkSaleAsInvoiced } from '../application/useCases/MarkSaleAsInvoiced';

// Create context
const AppContext = createContext<any>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // ===== REPOSITORIES (Data access) =====
  const productRepo = useMemo(() => new ProductDbAdapter(), []);
  const saleRepo = useMemo(() => new SaleDbAdapter(), []);
  const configRepo = useMemo(() => new StoreConfigDbAdapter(), []);

  // ===== BUSINESS SERVICES =====
  const inventoryService = useMemo(() => new InventoryService(productRepo), [productRepo]);
  const saleService = useMemo(() => new SaleService(saleRepo, productRepo), [saleRepo, productRepo]);

  // ===== USE CASES (Main app functions) =====
  const useCases = useMemo(() => ({
    // Product management
    addProduct: AddProduct(inventoryService),
    editProduct: EditProduct(inventoryService),
    deleteProduct: DeleteProduct(inventoryService),
    
    // Sale management
    makeSale: MakeSale(saleService),
    markSaleAsInvoiced: MarkSaleAsInvoiced(saleService),
    
    // Repositories for direct data access
    productRepo,
    saleRepo,
    configRepo
  }), [inventoryService, saleService, productRepo, saleRepo, configRepo]);

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