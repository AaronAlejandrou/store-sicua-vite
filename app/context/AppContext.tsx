import React, { createContext, useContext, useMemo } from 'react';

/**
 * Application Context for SICUA Frontend
 * 
 * Centralized dependency injection container that provides access to all
 * application services, repositories, and use cases throughout the React tree.
 * 
 * Architecture Overview:
 * 1. HTTP Client Layer: Core communication with backend
 * 2. Repository Layer: Data access adapters implementing domain interfaces
 * 3. Service Layer: Business logic and domain services
 * 4. Use Case Layer: Application-specific business operations
 * 
 * Dependency Flow:
 * HttpClient → API Adapters → Services → Use Cases
 * 
 * Benefits:
 * - Centralized dependency management
 * - Optimized with useMemo for performance
 * - Type-safe access to application services
 * - Easy testing with dependency injection
 * 
 * @see Domain Driven Design (DDD) architecture pattern
 * @see Dependency Injection pattern
 */

// ===== API ADAPTER IMPORTS =====
// Infrastructure adapters that implement repository interfaces
import { ProductApiAdapter } from '../infrastructure/api/ProductApiAdapter';
import { SaleApiAdapter } from '../infrastructure/api/SaleApiAdapter';
import { StoreConfigApiAdapter } from '../infrastructure/api/StoreConfigApiAdapter';
import { CategoryApiAdapter } from '../infrastructure/api/CategoryApiAdapter';
import { ExcelApiAdapter } from '../infrastructure/api/ExcelApiAdapter';

// ===== HTTP CLIENT IMPORT =====
// Core HTTP communication layer
import { HttpClient } from '../infrastructure/http/HttpClient';

// ===== BUSINESS SERVICE IMPORTS =====
// Domain services that encapsulate business logic
import { InventoryService } from '../domain/services/InventoryService';
import { SaleService } from '../domain/services/SaleService';
import { CategoryService } from '../domain/services/CategoryService';

// ===== USE CASE IMPORTS =====
// Application use cases that coordinate business operations
import { AddProduct } from '../application/useCases/AddProduct';
import { EditProduct } from '../application/useCases/EditProduct';
import { DeleteProduct } from '../application/useCases/DeleteProduct';
import { MakeSale } from '../application/useCases/MakeSale';
import { MarkSaleAsInvoiced } from '../application/useCases/MarkSaleAsInvoiced';

/**
 * Application Context
 * 
 * React Context that provides access to all application dependencies.
 * Uses 'any' type for flexibility, but provides type-safe access through useAppContext hook.
 */
const AppContext = createContext<any>(null);

/**
 * Application Provider Component
 * 
 * Sets up the complete dependency injection container and provides it
 * to all child components through React Context.
 * 
 * Performance Optimization:
 * - Uses useMemo to prevent unnecessary re-instantiation
 * - Properly manages dependency arrays for React optimization
 * - Memoizes complex dependency graphs
 * 
 * Dependency Initialization Order:
 * 1. HTTP Client (infrastructure foundation)
 * 2. API Adapters/Repositories (data access layer)
 * 3. Business Services (domain logic layer)
 * 4. Use Cases (application operation layer)
 * 
 * @param children - React child components that need access to dependencies
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  // ===== HTTP CLIENT SETUP =====
  /**
   * HTTP Client Initialization
   * 
   * Core HTTP communication layer that handles all API requests.
   * Configured with environment-specific base URL and authentication.
   * 
   * Memoized: Prevents re-creation on every render
   */
  const httpClient = useMemo(() => new HttpClient(), []);

  // ===== REPOSITORY LAYER SETUP =====
  /**
   * Data Access Repositories
   * 
   * API adapters that implement domain repository interfaces.
   * These provide data access while hiding implementation details from business logic.
   * 
   * Note: Some adapters don't require httpClient parameter (using singleton instance)
   * Memoized: Prevents re-creation on every render
   */
  const productRepo = useMemo(() => new ProductApiAdapter(), []);
  const saleRepo = useMemo(() => new SaleApiAdapter(), []);
  const configRepo = useMemo(() => new StoreConfigApiAdapter(), []);
  
  /**
   * HTTP Client Dependent Repositories
   * 
   * These repositories require explicit HTTP client injection.
   * Dependencies: [httpClient] ensures proper re-creation if httpClient changes
   */
  const categoryRepo = useMemo(() => new CategoryApiAdapter(httpClient), [httpClient]);
  const excelService = useMemo(() => new ExcelApiAdapter(httpClient), [httpClient]);

  // ===== BUSINESS SERVICE LAYER SETUP =====
  /**
   * Domain Services
   * 
   * Services that encapsulate business rules and coordinate repository operations.
   * These services contain the core business logic of the application.
   * 
   * Dependencies: Services depend on repositories for data access
   * Memoized: Prevents re-creation when dependencies haven't changed
   */
  const inventoryService = useMemo(() => new InventoryService(productRepo), [productRepo]);
  const saleService = useMemo(() => new SaleService(saleRepo, productRepo), [saleRepo, productRepo]);
  const categoryService = useMemo(() => new CategoryService(categoryRepo), [categoryRepo]);

  // ===== USE CASE LAYER SETUP =====
  /**
   * Application Use Cases and Dependencies
   * 
   * Complete dependency container with all layers properly initialized.
   * Includes both use cases (high-level operations) and direct service access.
   * 
   * Structure:
   * - Use Cases: Application-specific business operations
   * - Services: Direct access to business logic services
   * - Repositories: Direct access to data layer (for advanced use cases)
   * 
   * Memoized: Complex dependency object is memoized for performance
   */
  const useCases = useMemo(() => ({
    // ===== PRODUCT MANAGEMENT USE CASES =====
    /**
     * Product Management Operations
     * Core business operations for product lifecycle management
     */
    addProduct: AddProduct(inventoryService),         // Create new products
    editProduct: EditProduct(inventoryService),       // Update existing products
    deleteProduct: DeleteProduct(inventoryService),   // Remove products from inventory
    
    // ===== SALES MANAGEMENT USE CASES =====
    /**
     * Sales Management Operations
     * Core business operations for sales process management
     */
    makeSale: MakeSale(saleService),                          // Process new sales
    markSaleAsInvoiced: MarkSaleAsInvoiced(saleService),     // Update sale invoice status
    
    // ===== DIRECT SERVICE ACCESS =====
    /**
     * Business Services
     * Direct access to domain services for advanced operations
     */
    categoryService,    // Category management business logic
    excelService,       // Excel import/export operations
    
    // ===== DIRECT REPOSITORY ACCESS =====
    /**
     * Data Repositories
     * Direct access to data layer for advanced data operations
     * 
     * Use with caution: Prefer using services and use cases
     * Direct repository access should only be used when:
     * - Building new use cases
     * - Advanced data operations not covered by existing services
     * - Testing and debugging scenarios
     */
    productRepo,    // Product data access
    saleRepo,       // Sales data access
    configRepo,     // Store configuration data access
    categoryRepo    // Category data access
  }), [inventoryService, saleService, categoryService, excelService, productRepo, saleRepo, configRepo, categoryRepo]);

  return (
    <AppContext.Provider value={useCases}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Hook for Accessing Application Dependencies
 * 
 * Custom hook that provides type-safe access to all application dependencies.
 * Throws an error if used outside of AppProvider to catch development mistakes.
 * 
 * @returns Complete set of application dependencies and use cases
 * @throws Error if used outside of AppProvider
 * 
 * Usage Examples:
 * ```tsx
 * // Use case access (recommended)
 * const { addProduct, makeSale } = useAppContext();
 * await addProduct.execute(newProductData);
 * await makeSale.execute(saleData);
 * 
 * // Service access (for advanced operations)
 * const { categoryService, excelService } = useAppContext();
 * const categories = await categoryService.getAllCategories();
 * 
 * // Repository access (use with caution)
 * const { productRepo } = useAppContext();
 * const products = await productRepo.getAll();
 * ```
 */
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
} 