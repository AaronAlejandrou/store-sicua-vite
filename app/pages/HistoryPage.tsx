import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { useDownloadPDF } from '../infrastructure/printing/PrintAdapter';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import type { Sale } from '../domain/entities/Sale';
import type { StoreConfig } from '../domain/entities/StoreConfig';

export function HistoryPage() {
  const { saleRepo, markSaleAsInvoiced, configRepo } = useAppContext();
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [ventaSel, setVentaSel] = useState<Sale | null>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const { downloadRef, handleDownloadPDF } = useDownloadPDF();
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const cargar = useCallback(async () => {
    try {
      const [allSales, storeConfig] = await Promise.all([
        saleRepo.getAll(),
        configRepo.get()
      ]);
      setVentas(allSales);
      setConfig(storeConfig);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [saleRepo, configRepo]);

  useEffect(() => { 
    cargar(); 
  }, [cargar]);

  const ventasFiltradas = ventas.filter(v =>
    filtro === 'todas' ? true : filtro === 'porFacturar' ? !v.invoiced : v.invoiced
  );

  const handleFacturar = async (id: string) => {
    try {
      await markSaleAsInvoiced(id);
      cargar();
    } catch (error) {
      console.error('Error marcando como facturada:', error);
    }
  };

  const openPrintModal = (venta: Sale) => {
    setVentaSel(venta);
    setShowPrintModal(true);
  };

  const closePrintModal = () => {
    setShowPrintModal(false);
    setVentaSel(null);
  };

  const renderBoleta = (saleData: Sale) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Boleta de Venta</h2>
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
            <span>{saleData.clientName || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">DNI:</span>
            <span>{saleData.clientDni || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Fecha:</span>
            <span>{new Date(saleData.date).toLocaleString()}</span>
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
              {saleData.items.map(it => (
                <tr key={it.productId} className="border-b border-gray-100">
                  <td className="py-2 text-gray-900">{it.name}</td>
                  <td className="py-2 text-right">S/ {parseFloat(it.price.toString()).toFixed(2)}</td>
                  <td className="py-2 text-center">{it.quantity}</td>
                  <td className="py-2 text-right font-medium">S/ {parseFloat(it.subtotal.toString()).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL:</span>
            <span>S/ {saleData.total.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>¡Gracias por su compra!</p>
          <p>Conserve esta boleta</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando historial..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Historial de Ventas
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Consulta y gestiona todas las ventas realizadas
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Facturada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {ventasFiltradas.map(venta => (
                <tr key={venta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(venta.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {venta.clientName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    S/ {venta.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      venta.invoiced 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {venta.invoiced ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPrintModal(venta)}
                    >
                      Ver/Reimprimir
                    </Button>
                    {!venta.invoiced && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleFacturar(venta.id)}
                      >
                        Marcar como Facturada
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hay ventas registradas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filtro === 'todas' 
                ? 'Aún no se han realizado ventas' 
                : filtro === 'porFacturar' 
                  ? 'No hay ventas pendientes de facturar'
                  : 'No hay ventas facturadas'
              }
            </p>
          </div>
        )}
      </div>

      {/* Print Modal */}
      <Modal
        isOpen={showPrintModal}
        onClose={closePrintModal}
        title="Imprimir Boleta"
        size="lg"
      >
        {ventaSel && (
          <div ref={downloadRef}>
            {renderBoleta(ventaSel)}
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={handleDownloadPDF}>
            Descargar PDF
          </Button>
        </div>
      </Modal>
    </div>
  );
} 