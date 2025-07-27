import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateReceiptPDF } from '../infrastructure/printing/PrintAdapter';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import type { Sale } from '../domain/entities/Sale';
import type { StoreConfig } from '../domain/entities/StoreConfig';

export function HistoryPage() {
  const { saleRepo, markSaleAsInvoiced, configRepo } = useAppContext();
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ventaSel, setVentaSel] = useState<Sale | null>(null);

  // Función simple para formatear fecha sin cache
  const formatSaleDate = useCallback((dateString: string): string => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Fecha inválida';
      }
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Error en fecha';
    }
  }, []);

  const cargar = useCallback(async () => {
    try {
      setLoading(true);
      const [allSales, storeConfig] = await Promise.all([
        saleRepo.getAll(),
        configRepo.get()
      ]);
      setVentas(allSales);
      setConfig(storeConfig);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  }, [saleRepo, configRepo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const ventasFiltradas = ventas.filter(venta => {
    if (filtro === 'todas') return true;
    if (filtro === 'porFacturar') return !venta.invoiced;
    if (filtro === 'facturadas') return venta.invoiced;
    return true;
  });

  const handleMarkAsInvoiced = async (saleId: string) => {
    try {
      await markSaleAsInvoiced.execute(saleId);
      await cargar();
    } catch (error) {
      console.error('Error marking as invoiced:', error);
    }
  };

  const renderBoleta = (sale: Sale) => {
    // Usar la fecha formateada directamente
    const displayDate = formatSaleDate(sale.date);
    
    return (
      <div className="bg-white p-6 max-w-md mx-auto text-gray-900">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{config?.name || 'Tu Tienda'}</h2>
          <p className="text-sm">{config?.address || 'Dirección'}</p>
          <p className="text-sm">Tel: {config?.phone || 'Teléfono'}</p>
          <p className="text-sm">Email: {config?.email || 'Email'}</p>
        </div>
        
        <div className="border-t border-b py-2 mb-4">
          <p className="text-sm">Cliente: {sale.clientName}</p>
          <p className="text-sm">DNI: {sale.clientDni}</p>
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
              {sale.items.map((item, idx) => (
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
            <span>S/ {sale.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center mt-4 text-xs text-gray-500">
          ¡Gracias por su compra!
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando historial..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Historial de Ventas
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-3">
          <Button
            variant={filtro === 'todas' ? 'primary' : 'outline'}
            onClick={() => setFiltro('todas')}
          >
            Todas ({ventas.length})
          </Button>
          <Button
            variant={filtro === 'porFacturar' ? 'primary' : 'outline'}
            onClick={() => setFiltro('porFacturar')}
          >
            Por Facturar ({ventas.filter(v => !v.invoiced).length})
          </Button>
          <Button
            variant={filtro === 'facturadas' ? 'primary' : 'outline'}
            onClick={() => setFiltro('facturadas')}
          >
            Facturadas ({ventas.filter(v => v.invoiced).length})
          </Button>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {ventasFiltradas.map((venta) => {
                // Usar la fecha formateada directamente
                const displayDate = formatSaleDate(venta.date);
                
                return (
                  <tr key={venta.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">{venta.clientName}</div>
                      <div className="text-sm text-gray-400">DNI: {venta.clientDni}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">
                        {displayDate.split(' ')[0]}
                      </div>
                      <div className="text-sm text-gray-400">
                        {displayDate.split(' ')[1]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-100">
                        {venta.items.length} {venta.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-100">
                        S/ {venta.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        venta.invoiced 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venta.invoiced ? 'Facturada' : 'Por Facturar'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setVentaSel(venta)}
                      >
                        Ver Boleta
                      </Button>
                      {!venta.invoiced && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsInvoiced(venta.id)}
                        >
                          Marcar como Facturada
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No se encontraron ventas para el filtro seleccionado.
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {ventaSel && (
        <Modal
          isOpen={!!ventaSel}
          onClose={() => setVentaSel(null)}
          title="Vista Previa de Boleta"
          size="lg"
        >
          <div className="flex justify-center">
            <div className="bg-white p-4 border rounded-lg" style={{ width: '80mm', maxWidth: '100%' }}>
              {renderBoleta(ventaSel)}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setVentaSel(null)}>
              Cerrar
            </Button>
            <Button onClick={() => generateReceiptPDF(ventaSel, config)}>
              Descargar PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
