import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Modal } from '../components/UI/Modal';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import type { Product } from '../domain/entities/Product';

const DEFAULT_CATEGORIES = [
  'Hombre - Camisas',
  'Mujer - Pantalones',
  'Niños - Sudaderas',
  'Accesorios',
];

interface ProductFormData {
  productId: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  price: string;
  quantity: string;
  newCategory: string;
}

function ProductForm({ 
  product, 
  categories, 
  onSave, 
  onCancel, 
  error 
}: {
  product: Product | null;
  categories: string[];
  onSave: (data: ProductFormData) => void;
  onCancel: () => void;
  error: string;
}) {
  const [formData, setFormData] = useState<ProductFormData>({
    productId: '',
    name: '',
    brand: '',
    category: categories[0] || '',
    size: '',
    price: '',
    quantity: '',
    newCategory: ''
  });

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        price: product.price.toString(),
        quantity: product.quantity.toString(),
        newCategory: ''
      });
    } else {
      setFormData({
        productId: '',
        name: '',
        brand: '',
        category: categories[0] || '',
        size: '',
        price: '',
        quantity: '',
        newCategory: ''
      });
    }
  }, [product, categories]);

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSave = {
      ...formData
    };

    if (formData.category === 'Nueva...') {
      dataToSave.category = formData.newCategory;
    }

    onSave(dataToSave);
  };

  const isEditing = !!product;

  const categoryOptions = [
    ...categories.map(cat => ({ value: cat, label: cat })),
    { value: 'Nueva...', label: 'Nueva categoría...' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <Input
            label="ID del Producto *"
            value={formData.productId}
            onChange={(e) => handleInputChange('productId', e.target.value)}
            placeholder="Ej: CAM001"
            required
            disabled={isEditing}
          />

          <Input
            label="Nombre del Producto *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ej: Camisa de Algodón"
            required
          />

          <Input
            label="Marca *"
            value={formData.brand}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="Ej: Nike, Adidas, etc."
            required
          />

          <Select
            label="Categoría *"
            value={formData.category}
            onChange={(value) => handleInputChange('category', value)}
            options={categoryOptions}
            required
          />
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {formData.category === 'Nueva...' && (
            <Input
              label="Nueva Categoría *"
              value={formData.newCategory}
              onChange={(e) => handleInputChange('newCategory', e.target.value)}
              placeholder="Ej: Deportes - Zapatillas"
              required
            />
          )}

          <Input
            label="Talla *"
            value={formData.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
            placeholder="Ej: S, M, L, XL, 42, etc."
            required
          />

          <Input
            label="Precio (S/) *"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => handleInputChange('price', e.target.value)}
            placeholder="Ej: 29.90"
            required
          />

          <Input
            label="Cantidad en Stock *"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="Ej: 10"
            required
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Guardar'} Producto
        </Button>
      </div>
    </form>
  );
}

export function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const { productRepo, addProduct, editProduct, deleteProduct } = useAppContext();

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const allProducts = await productRepo.getAll();
      setProducts(allProducts);
      
      const existingCategories = allProducts.map((p: Product) => p.category);
      const uniqueCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...existingCategories]));
      setCategories(uniqueCategories.sort());
    } catch (error) {
      console.error('Error cargando productos:', error);
      setError('Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.productId.toLowerCase().includes(term) ||
        product.name.toLowerCase().includes(term)
      );
      setFilteredProducts(filtered);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
    setError('');
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
    setError('');
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmed = window.confirm('¿Estás seguro de que quieres eliminar este producto?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      setError('Error al eliminar el producto');
    }
  };

  const handleSaveProduct = async (productData: ProductFormData) => {
    try {
      if (!productData.productId || !productData.name || !productData.brand || 
          !productData.category || !productData.size || !productData.price || !productData.quantity) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (parseFloat(productData.price) <= 0) {
        throw new Error('El precio debe ser mayor a 0');
      }

      if (parseInt(productData.quantity) < 0) {
        throw new Error('La cantidad no puede ser negativa');
      }

      if (!selectedProduct && products.some((p: Product) => p.productId === productData.productId)) {
        throw new Error('Ya existe un producto con ese ID');
      }

      const productToSave: Product = {
        productId: productData.productId,
        name: productData.name,
        brand: productData.brand,
        category: productData.category === 'Nueva...' ? productData.newCategory : productData.category,
        size: productData.size,
        price: parseFloat(productData.price),
        quantity: parseInt(productData.quantity)
      };

      if (selectedProduct) {
        await editProduct(productToSave);
      } else {
        await addProduct(productToSave);
      }

      await loadProducts();
      setShowModal(false);
      setSelectedProduct(null);
      setError('');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCancelForm = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setError('');
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Inventario
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Administra productos, stock y categorías
          </p>
        </div>
        <Button onClick={handleAddProduct} variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Agregar Producto
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por ID o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              helperText={`${filteredProducts.length} productos encontrados`}
            />
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
                  Nombre
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map(product => (
                <tr key={product.productId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {product.productId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {product.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    S/ {product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.quantity < 5 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {product.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.productId)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No se encontraron productos' : 'No hay productos en el inventario'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Comienza agregando tu primer producto'}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Button onClick={handleAddProduct} variant="primary">
                  Agregar Producto
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCancelForm}
        title={selectedProduct ? 'Editar Producto' : 'Agregar Producto'}
        size="lg"
      >
        <ProductForm
          product={selectedProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onCancel={handleCancelForm}
          error={error}
        />
      </Modal>
    </div>
  );
} 