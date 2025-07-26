import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useDownloadPDF } from '../infrastructure/printing/PrintAdapter';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import type { Product } from '../domain/entities/Product';
import type { Sale, SaleItem } from '../domain/entities/Sale';
import type { StoreConfig } from '../domain/entities/StoreConfig';

function uuid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

interface SaleItemWithVenta extends Product {
  ventaPrice: number;
  ventaQty: number;
}

export function SalesPage() {
  const { productRepo, makeSale, configRepo } = useAppContext();
  const [productos, setProductos] = useState<Product[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [items, setItems] = useState<SaleItemWithVenta[]>([]);
  const [cliente, setCliente] = useState({ dni: '', name: '' });
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { downloadRef, handleDownloadPDF, generatePDFFromData } = useDownloadPDF();
  const [busquedaError, setBusquedaError] = useState('');
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [allProducts, storeConfig] = await Promise.all([
        productRepo.getAll(),
        configRepo.get()
      ]);
      setProductos(allProducts);
      setConfig(storeConfig);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  }, [productRepo, configRepo]);

  useEffect(() => { 
    cargar(); 
  }, [cargar]);

  // Filtered suggestions
  const sugerencias = busqueda.trim().length > 0
    ? productos.filter(p =>
        p.productId.toLowerCase().includes(busqueda.trim().toLowerCase()) ||
        p.name.toLowerCase().includes(busqueda.trim().toLowerCase())
      ).filter(p => !items.find(i => i.productId === p.productId))
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    setShowDropdown(true);
    setBusquedaError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBusqueda(e.target.value);
    setShowDropdown(true);
    setBusquedaError('');
  };

  const handleAgregarSugerido = (prod: Product) => {
    setItems([...items, {
      ...prod,
      ventaPrice: prod.price,
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
      for (const it of items) {
        if (parseInt(it.ventaQty.toString()) > it.quantity) throw new Error(`Stock insuficiente para ${it.name}`);
      }
      const sale: Sale = {
        id: uuid(),
        clientDni: cliente.dni,
        clientName: cliente.name,
        date: new Date().toISOString(),
        items: items.map(it => ({
          productId: it.productId,
          name: it.name,
          price: parseFloat(it.ventaPrice.toString()),
          quantity: parseInt(it.ventaQty.toString()),
          subtotal: parseFloat(it.ventaPrice.toString()) * parseInt(it.ventaQty.toString())
        })),
        total: subtotal,
        invoiced: false
      };
      await makeSale(sale);
      setLastSale(sale);
      setSuccess('Venta registrada y boleta guardada.');
      setItems([]);
      setCliente({ dni: '', name: '' });
      cargar();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openPrintModal = () => setShowPrintModal(true);
  const closePrintModal = () => setShowPrintModal(false);

  const renderBoleta = (saleData: Sale | null) => {
    const data = saleData || { items: [], clientName: '', clientDni: '', date: new Date().toISOString() };
    const total = saleData ? saleData.total : subtotal;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">BOLETA DE VENTA</h2>
          {config && (
            <div className="text-sm text-gray-600 space-y-1">
              <div className="font-semibold">{config.name}</div>
              <div>{config.address}</div>
              <div>{config.email} | {config.phone}</div>
            </div>
          )}
        </div>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="font-medium">Cliente:</span>
            <span>{data.clientName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">DNI:</span>
            <span>{data.clientDni || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Fecha:</span>
            <span>{new Date(data.date).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2">Producto</th>
                <th className="text-right py-2">Precio</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
                             {(data.items || items).map((it, index) => (
                 <tr key={it.productId || index} className="border-b border-gray-100">
                   <td className="py-2 text-gray-900">{it.name}</td>
                   <td className="py-2 text-right">S/ {parseFloat(it.price.toString()).toFixed(2)}</td>
                   <td className="py-2 text-center">{it.quantity}</td>
                   <td className="py-2 text-right font-medium">S/ {(parseFloat(it.price.toString()) * parseInt(it.quantity.toString())).toFixed(2)}</td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>S/ {total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¡Gracias por su compra!</p>
          <p>Conserve esta boleta</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nueva Venta
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Genera boletas y registra ventas
          </p>
        </div>
        <Button 
          onClick={openPrintModal} 
          disabled={!lastSale && items.length === 0}
          variant="outline"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir Última Boleta
        </Button>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="DNI Cliente (opcional)"
              value={cliente.dni}
              onChange={(e) => setCliente(c => ({ ...c, dni: e.target.value }))}
              placeholder="Ej: 12345678"
            />
            <Input
              label="Nombre Cliente (opcional)"
              value={cliente.name}
              onChange={(e) => setCliente(c => ({ ...c, name: e.target.value }))}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Product Search */}
          <div className="relative">
            <Input
              label="Buscar Producto"
              value={busqueda}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="Buscar producto por ID o nombre"
              helperText="Escribe para buscar productos disponibles"
            />
            
            {showDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {sugerencias.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron productos
                  </div>
                ) : (
                  sugerencias.map(prod => (
                    <div
                      key={prod.productId}
                      onClick={() => handleAgregarSugerido(prod)}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">{prod.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {prod.productId}</div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 ml-4">
                        <div>Stock: <span className="font-medium">{prod.quantity}</span></div>
                        <div>S/ {prod.price.toFixed(2)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {busquedaError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{busquedaError}</p>
            </div>
          )}

          {/* Items Table */}
          {items.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Productos en la Venta</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-100 dark:bg-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Producto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Precio Unit.</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cantidad</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Subtotal</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {items.map((it, idx) => (
                      <tr key={it.productId}>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{it.name}</td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={it.ventaPrice}
                            onChange={(e) => handleItemChange(idx, 'ventaPrice', parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <Input
                            type="number"
                            min="1"
                            max={it.quantity}
                            value={it.ventaQty}
                            onChange={(e) => handleItemChange(idx, 'ventaQty', parseInt(e.target.value) || 1)}
                            className="w-20"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                          S/ {(parseFloat(it.ventaPrice.toString()) * parseInt(it.ventaQty.toString())).toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => quitarItem(idx)}
                          >
                            Quitar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Total: S/ {subtotal.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" disabled={items.length === 0}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Generar Boleta
            </Button>
          </div>
        </form>
      </div>

      {/* Print Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={closePrintModal}
        title="Imprimir Boleta"
        size="lg"
      >
        <div ref={downloadRef}>
          {renderBoleta(lastSale)}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => lastSale && generatePDFFromData(lastSale, config)}>
            Descargar PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
} 