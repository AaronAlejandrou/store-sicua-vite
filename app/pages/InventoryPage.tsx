import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { CategorySelectWithCreate } from '../components/Category/CategorySelectWithCreate';
import { CategoryManagement } from '../components/Category/CategoryManagement';
import { ExcelImportModal } from '../components/Excel/ExcelImportModal';
import type { Product, CreateProductRequest, UpdateProductRequest } from '../domain/entities/Product';
import type { Category, CategoryOption } from '../domain/entities/Category';
import type { ExcelImportResponse } from '../domain/services/ExcelService';

interface ProductFormData {
  productId: string;
  name: string;
  brand: string;
  categoryNumber: number | null;
  size: string;
  color: string;
  price: string;
  quantity: string;
}

function ProductForm({ 
  product, 
  onSave, 
  onCancel, 
  error,
  isLoading,
  categories,
  onCategoryCreated
}: {
  product: Product | null;
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  error: string;
  isLoading: boolean;
  categories: CategoryOption[];
  onCategoryCreated: () => void;
}) {
  // Helper function to parse combined size field (e.g., "M - Azul" -> {size: "M", color: "Azul"})
  const parseSizeField = (combinedSize: string | null | undefined): {size: string, color: string} => {
    if (!combinedSize || combinedSize.trim() === '') {
      return {size: '', color: ''};
    }
    
    const parts = combinedSize.split(' - ');
    if (parts.length === 2) {
      return {size: parts[0].trim(), color: parts[1].trim()};
    } else {
      return {size: combinedSize.trim(), color: ''};
    }
  };

  // Helper function to combine size and color (e.g., "M" + "Azul" -> "M - Azul")
  const combineSizeAndColor = (size: string, color: string): string => {
    const trimmedSize = size.trim();
    const trimmedColor = color.trim();
    
    if (trimmedSize && trimmedColor) {
      return `${trimmedSize} - ${trimmedColor}`;
    } else if (trimmedSize) {
      return trimmedSize;
    } else {
      return '';
    }
  };
  const [formData, setFormData] = useState<ProductFormData>({
    productId: '',
    name: '',
    brand: '',
    categoryNumber: null,
    size: '',
    color: '',
    price: '',
    quantity: ''
  });

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      const parsedSizeColor = parseSizeField(product.size);
      setFormData({
        productId: product.productId,
        name: product.name,
        brand: product.brand || '',
        categoryNumber: product.categoryNumber,
        size: parsedSizeColor.size,
        color: parsedSizeColor.color,
        price: product.price.toString(),
        quantity: product.quantity.toString()
      });
    } else {
      setFormData({
        productId: '',
        name: '',
        brand: '',
        categoryNumber: null,
        size: '',
        color: '',
        price: '',
        quantity: ''
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine size and color for storage
    const combinedSize = combineSizeAndColor(formData.size, formData.color);
    const dataToSave = {
      ...formData,
      size: combinedSize
    };
    onSave(dataToSave);
  };

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (categoryNumber: number | null) => {
    setFormData(prev => ({
      ...prev,
      categoryNumber
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="ID del Producto *"
          value={formData.productId}
          onChange={(e) => handleInputChange('productId', e.target.value)}
          placeholder="Ej: P001, CAM001, etc."
          required
          disabled={isEditing}
          helperText={isEditing ? "El ID no se puede modificar" : "Ingresa un ID único para el producto"}
        />

        <Input
          label="Nombre del Producto *"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ej: Camiseta Polo Ralph Lauren"
          required
        />

        <Input
          label="Marca"
          value={formData.brand}
          onChange={(e) => handleInputChange('brand', e.target.value)}
          placeholder="Ej: Ralph Lauren, Nike, Adidas"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <CategorySelectWithCreate
            value={formData.categoryNumber}
            onChange={handleCategoryChange}
            categories={categories}
            onCategoryCreated={onCategoryCreated}
            placeholder="Seleccionar categoría"
            className="w-full"
          />
        </div>

        <Input
          label="Talla"
          value={formData.size}
          onChange={(e) => handleInputChange('size', e.target.value)}
          placeholder="Ej: S, M, L, XL, 38, 40, etc."
        />

        <Input
          label="Color"
          value={formData.color}
          onChange={(e) => handleInputChange('color', e.target.value)}
          placeholder="Ej: Azul, Rojo, Negro, Blanco, etc."
        />

        <Input
          label="Precio *"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          placeholder="0.00"
          required
        />

        <Input
          label="Cantidad *"
          type="number"
          min="0"
          value={formData.quantity}
          onChange={(e) => handleInputChange('quantity', e.target.value)}
          placeholder="0"
          required
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <LoadingSpinner size="sm" /> : null}
          {isEditing ? 'Actualizar' : 'Crear'} Producto
        </Button>
      </div>
    </form>
  );
}

export function InventoryPage() {
  const { productRepo, categoryService, excelService } = useAppContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryManagement, setShowCategoryManagement] = useState(false);
  const [showExcelImportModal, setShowExcelImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadProducts(), loadCategories()]);
  };

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const allProducts = await productRepo.getAll();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAllCategories();
      setCategories(allCategories);
      const options = await categoryService.getCategoryOptions();
      setCategoryOptions(options);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryCreatedInForm = async () => {
    // Silently reload categories without affecting the modal state
    try {
      const allCategories = await categoryService.getAllCategories();
      setCategories(allCategories);
      const options = await categoryService.getCategoryOptions();
      setCategoryOptions(options);
    } catch (error) {
      console.error('Error reloading categories:', error);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
    setError('');
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
    setError('');
  };

  const handleDeleteProduct = async (product: Product) => {
    let confirmMessage = `¿Estás seguro de que quieres eliminar "${product.name}"?`;
    
    // Add warning if product has stock
    if (product.quantity > 0) {
      confirmMessage = `⚠️ ATENCIÓN: El producto "${product.name}" tiene ${product.quantity} unidades en stock.\n\n¿Estás seguro de que quieres eliminarlo de todos modos?\n\nEsta acción no se puede deshacer.`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        // Use force deletion if product has stock
        const forceDelete = product.quantity > 0;
        await productRepo.delete(product.productId, forceDelete);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Error al eliminar el producto');
      }
    }
  };

  const handleSaveProduct = async (formData: ProductFormData) => {
    try {
      setIsFormLoading(true);
      setError('');

      const productData = {
        productId: formData.productId,
        name: formData.name,
        brand: formData.brand,
        categoryNumber: formData.categoryNumber,
        size: formData.size,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      if (editingProduct) {
        // Update existing product
        const updateData: UpdateProductRequest = {
          name: productData.name,
          brand: productData.brand,
          categoryNumber: productData.categoryNumber,
          size: productData.size,
          price: productData.price,
          quantity: productData.quantity
        };
        await productRepo.update(editingProduct.productId, updateData);
      } else {
        // Create new product
        const createData: CreateProductRequest = {
          productId: productData.productId,
          name: productData.name,
          brand: productData.brand,
          categoryNumber: productData.categoryNumber,
          size: productData.size,
          price: productData.price,
          quantity: productData.quantity
        };
        await productRepo.create(createData);
      }

      setShowModal(false);
      await loadProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      setError(error.message || 'Error al guardar el producto');
    } finally {
      setIsFormLoading(false);
    }
  };

  // Excel import/export handlers
  const handleExcelImport = async (file: File): Promise<ExcelImportResponse> => {
    try {
      return await excelService.importProducts(file);
    } catch (error: any) {
      throw new Error(error.message || 'Error importing products from Excel');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await excelService.downloadTemplate();
    } catch (error: any) {
      console.error('Error downloading template:', error);
      setError('Error descargando plantilla de Excel');
    }
  };

  const handleExportInventory = async () => {
    try {
      await excelService.exportInventory();
    } catch (error: any) {
      console.error('Error exporting inventory:', error);
      setError('Error exportando inventario');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.productId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.size || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.categoryNumber === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const uniqueCategoryNumbers = Array.from(new Set(products.map(p => p.categoryNumber).filter(Boolean))).sort((a, b) => a! - b!);
  const lowStockProducts = products.filter(p => p.quantity <= 5);

  const getCategoryDisplayText = (categoryNumber: number | null): string => {
    return categoryService.getCategoryDisplayText(categoryNumber, categories);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando inventario..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Inventario
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra tu catálogo de productos de ropa
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Excel Operations */}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowExcelImportModal(true)}
              className="text-sm"
            >
              📥 Importar Productos
            </Button>
            <Button
              variant="secondary" 
              onClick={handleDownloadTemplate}
              className="text-sm"
            >
              📋 Plantilla Excel
            </Button>
            <Button
              variant="secondary"
              onClick={handleExportInventory}
              className="text-sm"
            >
              📤 Exportar Inventario
            </Button>
          </div>
          {/* New Product Button */}
          <Button onClick={handleCreateProduct}>
            + Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Productos</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{products.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Stock</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {products.filter(p => p.quantity > 5).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Bajo</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{lowStockProducts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Buscar productos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, marca, ID o talla..."
          />
          <Select
            label="Filtrar por categoría"
            value={categoryFilter.toString()}
            onChange={(value) => setCategoryFilter(value === 'all' ? 'all' : parseInt(value))}
            options={[
              { value: 'all', label: 'Todas las categorías' },
              ...uniqueCategoryNumbers.map(catNum => {
                const category = categories.find(c => c.categoryNumber === catNum);
                return { 
                  value: catNum!.toString(), 
                  label: category ? `${catNum} - ${category.name}` : `Categoría ${catNum}` 
                };
              })
            ]}
          />
          <div className="flex items-end">
            <Button
              onClick={() => setShowCategoryManagement(true)}
              variant="secondary"
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Gestionar Categorías
            </Button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Talla
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {product.productId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.brand || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {getCategoryDisplayText(product.categoryNumber)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.size || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    S/ {product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.quantity <= 5 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : product.quantity <= 10
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay productos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm || categoryFilter !== 'all' 
                ? 'No se encontraron productos con los filtros aplicados.'
                : 'Comienza agregando tu primer producto al inventario.'
              }
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <Button onClick={handleCreateProduct}>
                Agregar Primer Producto
              </Button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Product Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => setShowModal(false)}
          error={error}
          isLoading={isFormLoading}
          categories={categoryOptions}
          onCategoryCreated={handleCategoryCreatedInForm}
        />
      </Modal>

      <CategoryManagement
        isOpen={showCategoryManagement}
        onClose={() => setShowCategoryManagement(false)}
        onCategoriesChange={loadCategories}
      />

      <ExcelImportModal
        isOpen={showExcelImportModal}
        onClose={() => setShowExcelImportModal(false)}
        onImport={handleExcelImport}
        onRefreshProducts={loadProducts}
      />
    </div>
  );
}
