import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateReceiptPDF } from '../infrastructure/printing/PrintAdapter';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { WhatsAppModal } from '../components/UI/WhatsAppModal';
import type { Product } from '../domain/entities/Product';
import type { Sale, SaleItem } from '../domain/entities/Sale';
import type { StoreConfig } from '../domain/entities/StoreConfig';
import type { CreateSaleRequest } from '../domain/repositories/SaleRepository';

interface SaleItemWithVenta extends Product {
  ventaPrice: number;
  ventaQty: number;
}

export function SalesPage() {
  const { productRepo, saleRepo, configRepo } = useAppContext();
  const [productos, setProductos] = useState<Product[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<SaleItemWithVenta[]>([]);
  const [cliente, setCliente] = useState({ dni: '', name: '' });
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busquedaError, setBusquedaError] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para formatear fecha como local time
  const formatSaleDate = useCallback((dateString: string): string => {
    try {
      // Parse the date string as local time (no timezone conversion)
      const date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Fecha inválida';
      }
      
      // Format as local time (no timezone specification)
      return date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Error en fecha';
    }
  }, []);

  const cargar = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allProducts, storeConfig] = await Promise.all([
        productRepo.getAll(),
        configRepo.get()
      ]);
      setProductos(allProducts);
      setConfig(storeConfig);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setError('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [productRepo, configRepo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrar productos: priorizar búsqueda por ID, luego por nombre
  const productosVistas = productos.filter(p => {
    if (!busqueda.trim()) return false;
    if (p.quantity <= 0) return false;
    
    const searchTerm = busqueda.toLowerCase().trim();
    
    // Priorizar búsqueda por ID (exacta o que comience con el término)
    if (p.productId.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Luego por nombre
    if (p.name.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // También por marca si existe
    if (p.brand && p.brand.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    return false;
  }).sort((a, b) => {
    // Ordenar: primero los que coinciden exactamente con el ID, luego por nombre
    const searchTerm = busqueda.toLowerCase().trim();
    const aIdMatch = a.productId.toLowerCase().startsWith(searchTerm);
    const bIdMatch = b.productId.toLowerCase().startsWith(searchTerm);
    
    if (aIdMatch && !bIdMatch) return -1;
    if (!aIdMatch && bIdMatch) return 1;
    
    return a.name.localeCompare(b.name);
  });

  const agregarItem = (producto: Product) => {
    const existe = items.find(it => it.productId === producto.productId);
    if (existe) {
      setBusquedaError('Este producto ya fue agregado');
      setTimeout(() => setBusquedaError(''), 3000);
      return;
    }
    
    setItems([...items, { 
      ...producto, 
      ventaPrice: producto.price, 
      ventaQty: 1 
    }]);
    setBusqueda('');
    setShowDropdown(false);
    setBusquedaError('');
  };

  const quitarItem = (idx: number) => setItems(items => items.filter((_, i) => i !== idx));

  const handleItemChange = (idx: number, campo: keyof SaleItemWithVenta, valor: string | number) => {
    setItems(items => items.map((it, i) => i === idx ? { ...it, [campo]: valor } : it));
  };

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.ventaPrice.toString()) * parseInt(it.ventaQty.toString())), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (!items.length) throw new Error('Agregue al menos un producto');
      
      // Client name is now optional - removed validation
      
      for (const it of items) {
        if (parseInt(it.ventaQty.toString()) > it.quantity) {
          throw new Error(`Stock insuficiente para ${it.name}. Disponible: ${it.quantity}, Solicitado: ${it.ventaQty}`);
        }
      }

      const saleData: CreateSaleRequest = {
        clientDni: cliente.dni.trim() || null,
        clientName: cliente.name.trim() || null,
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          price: parseFloat(it.ventaPrice.toString()),
          quantity: parseInt(it.ventaQty.toString()),
          subtotal: parseFloat(it.ventaPrice.toString()) * parseInt(it.ventaQty.toString())
        }))
      };

      console.log('Creating sale with data:', saleData);

      // Usar el repositorio directamente
      const newSale = await saleRepo.create(saleData);
      console.log('Sale created:', newSale);
      
      setLastSale(newSale);
      setSuccess('Venta registrada exitosamente.');
      setItems([]);
      setCliente({ dni: '', name: '' });
      cargar(); // Reload products to update stock
    } catch (err: any) {
      console.error('Error creating sale:', err);
      setError(err.message || 'Error al registrar la venta');
    }
  };

  const openPrintModal = () => setShowPrintModal(true);
  const closePrintModal = () => setShowPrintModal(false);
  
  const openWhatsAppModal = () => setShowWhatsAppModal(true);
  const closeWhatsAppModal = () => setShowWhatsAppModal(false);

  const renderBoleta = (saleData: Sale | null) => {
    // Si no hay datos de venta, usar los items actuales para la vista previa
    const displayItems = saleData ? saleData.items : items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.ventaPrice,
      quantity: item.ventaQty,
      subtotal: item.ventaPrice * item.ventaQty
    }));
    
    const displayTotal = saleData ? saleData.total : subtotal;
    const displayClient = saleData ? saleData.clientName : cliente.name;
    const displayDni = saleData ? saleData.clientDni : cliente.dni;
    
    // Para la fecha: usar la fecha formateada directamente si hay saleData, sino fecha actual para vista previa
    const displayDate = saleData 
      ? formatSaleDate(saleData.date)
      : new Date().toLocaleString();
    
    return (
      <div className="bg-white p-6 max-w-md mx-auto text-gray-900">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{config?.name || 'Tu Tienda'}</h2>
          <p className="text-sm">{config?.address || 'Dirección'}</p>
          <p className="text-sm">Tel: {config?.phone || 'Teléfono'}</p>
          <p className="text-sm">Email: {config?.email || 'Email'}</p>
        </div>
        
        <div className="border-t border-b py-2 mb-4">
          <p className="text-sm">Cliente: {displayClient || 'N/A'}</p>
          <p className="text-sm">DNI: {displayDni || 'N/A'}</p>
          <p className="text-sm">Fecha: {displayDate}</p>
        </div>

        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left">Producto</th>
                <th className="text-right">Cant.</th>
                <th className="text-right">Precio</th>
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="text-left py-1">{item.name}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">S/ {item.price.toFixed(2)}</td>
                  <td className="text-right">S/ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t pt-2">
          <div className="flex justify-between font-bold">
            <span>TOTAL:</span>
            <span>S/ {displayTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          ¡Gracias por su compra!
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando datos de venta..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nueva Venta</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Crea boletas y registra ventas
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Sale Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="DNI/RUC"
                  value={cliente.dni}
                  onChange={(e) => setCliente({...cliente, dni: e.target.value})}
                  placeholder="Ingrese DNI o RUC (opcional)"
                />
                <Input
                  label="Nombre"
                  value={cliente.name}
                  onChange={(e) => setCliente({...cliente, name: e.target.value})}
                  placeholder="Nombre del cliente (opcional)"
                />
              </div>
            </div>

            {/* Product Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-4">Agregar Productos</h3>
              <div className="relative dropdown-container">
                <Input
                  label="Buscar por ID o nombre"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value);
                    setShowDropdown(e.target.value.length > 0);
                    setBusquedaError('');
                  }}
                  placeholder="Ej: P001, CAM001, o nombre del producto..."
                  onFocus={() => busqueda && setShowDropdown(true)}
                  helperText="Busca principalmente por ID del producto para mayor precisión"
                />
                
                {busquedaError && (
                  <p className="text-red-500 text-sm mt-1">{busquedaError}</p>
                )}

                {showDropdown && productosVistas.length > 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                    {productosVistas.slice(0, 8).map((producto) => (
                      <div
                        key={producto.productId}
                        onClick={() => agregarItem(producto)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-blue-600 dark:text-blue-400">ID: {producto.productId}</p>
                            <p className="font-medium">{producto.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {producto.brand && `${producto.brand} - `}Stock: {producto.quantity}
                            </p>
                          </div>
                          <span className="text-green-600 font-medium">
                            S/ {producto.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    {productosVistas.length > 8 && (
                      <div className="p-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        ... y {productosVistas.length - 8} productos más
                      </div>
                    )}
                  </div>
                )}

                {showDropdown && busqueda && productosVistas.length === 0 && (
                  <div className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md mt-1 p-3 shadow-lg">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      No se encontraron productos con "{busqueda}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sale Items */}
            {items.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                <h3 className="text-lg font-semibold mb-4">Productos en la Venta</h3>
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ID: {item.productId} | Stock disponible: {item.quantity}
                        </p>
                        {item.brand && (
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            Marca: {item.brand}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          max={item.quantity}
                          value={item.ventaQty}
                          onChange={(e) => handleItemChange(idx, 'ventaQty', parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                        <span className="text-sm">×</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.ventaPrice}
                          onChange={(e) => handleItemChange(idx, 'ventaPrice', parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="font-medium min-w-20 text-right">
                          S/ {(item.ventaPrice * item.ventaQty).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => quitarItem(idx)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-green-600">S/ {subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {success}
                <div className="mt-2 flex space-x-2">
                  <Button type="button" size="sm" onClick={openPrintModal}>
                    Ver/Imprimir Boleta
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={openWhatsAppModal}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Contactar Cliente
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={items.length === 0}
                className="flex-1"
              >
                Registrar Venta
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={openPrintModal}
                disabled={items.length === 0}
              >
                Vista Previa
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column - Receipt Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
            <h3 className="text-lg font-semibold mb-4">Vista Previa de Boleta</h3>
            <div className="border rounded-lg overflow-hidden">
              {renderBoleta(null)}
            </div>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && lastSale && (
        <Modal
          isOpen={showPrintModal}
          onClose={closePrintModal}
          title="Vista Previa de Boleta"
        >
          <div className="flex justify-center">
            <div className="bg-white p-4 border rounded-lg" style={{ width: '80mm', maxWidth: '100%' }}>
              {renderBoleta(lastSale)}
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={closePrintModal}>
              Cerrar
            </Button>
            <Button onClick={() => {
              generateReceiptPDF(lastSale, config);
            }}>
              Descargar PDF
            </Button>
          </div>
        </Modal>
      )}

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={closeWhatsAppModal}
        storeName={config?.name}
        defaultPhone={cliente.dni}
        title="Contactar Cliente por WhatsApp"
      />
    </div>
  );
}
