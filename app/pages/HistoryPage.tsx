import React, { useEffect, useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateReceiptPDF } from '../infrastructure/printing/PrintAdapter';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { WhatsAppModal } from '../components/UI/WhatsAppModal';
import type { Sale } from '../domain/entities/Sale';
import type { StoreConfig } from '../domain/entities/StoreConfig';

export function HistoryPage() {
  const { saleRepo, markSaleAsInvoiced, configRepo, excelService } = useAppContext();
  const [ventas, setVentas] = useState<Sale[]>([]);
  const [filtro, setFiltro] = useState('todas');
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ventaSel, setVentaSel] = useState<Sale | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppSale, setWhatsAppSale] = useState<Sale | null>(null);
  const [confirmingInvoice, setConfirmingInvoice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Date filtering states
  const [dateFilterType, setDateFilterType] = useState<'all' | 'dateRange' | 'month'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

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
    // Status filter
    let passesStatusFilter = true;
    if (filtro === 'porFacturar') passesStatusFilter = !venta.invoiced;
    else if (filtro === 'facturadas') passesStatusFilter = venta.invoiced;

    // Date filter
    let passesDateFilter = true;
    if (dateFilterType !== 'all') {
      try {
        // Parse the sale date - handle both UTC and local timezone scenarios
        let saleDate;
        if (venta.date.includes('T') && !venta.date.includes('+') && !venta.date.includes('Z')) {
          // If it looks like ISO format but without timezone, treat as local time
          saleDate = new Date(venta.date);
        } else {
          saleDate = new Date(venta.date);
        }
        
        if (dateFilterType === 'dateRange') {
          if (startDate) {
            // Create start date in local timezone
            const start = new Date(startDate + 'T00:00:00');
            if (saleDate < start) passesDateFilter = false;
          }
          if (endDate) {
            // Create end date in local timezone
            const end = new Date(endDate + 'T23:59:59.999');
            if (saleDate > end) passesDateFilter = false;
          }
        } else if (dateFilterType === 'month' && selectedMonth) {
          const [year, month] = selectedMonth.split('-');
          const saleYear = saleDate.getFullYear();
          const saleMonth = saleDate.getMonth() + 1; // getMonth() is 0-indexed
          
          if (saleYear !== parseInt(year) || saleMonth !== parseInt(month)) {
            passesDateFilter = false;
          }
        }
      } catch (error) {
        console.error('Error parsing date for filtering:', error, 'Sale date:', venta.date);
        passesDateFilter = false;
      }
    }

    return passesStatusFilter && passesDateFilter;
  });

  const handleMarkAsInvoiced = async (saleId: string) => {
    try {
      await markSaleAsInvoiced(saleId);
      setConfirmingInvoice(null);
      await cargar();
    } catch (error) {
      console.error('Error marking as invoiced:', error);
      setConfirmingInvoice(null);
    }
  };

  const confirmMarkAsInvoiced = (saleId: string) => {
    setConfirmingInvoice(saleId);
  };

  const cancelConfirmation = () => {
    setConfirmingInvoice(null);
  };

  const openWhatsAppModal = (sale: Sale) => {
    setWhatsAppSale(sale);
    setShowWhatsAppModal(true);
  };

  const closeWhatsAppModal = () => {
    setShowWhatsAppModal(false);
    setWhatsAppSale(null);
  };

  const handleExportExcel = async () => {
    if (!excelService) {
      console.error('Excel service not available');
      return;
    }

    try {
      setIsExporting(true);
      
      const filters = {
        dateFilterType,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        selectedMonth: selectedMonth || undefined,
        statusFilter: filtro as 'todas' | 'porFacturar' | 'facturadas'
      };

      await excelService.exportFilteredSales(filters);
      
      // Optional: Show success message
      console.log('Excel export completed successfully');
      
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      // You could add a toast notification here
      alert('Error al exportar a Excel. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to generate month options from sales data
  const getMonthOptions = () => {
    const monthsSet = new Set<string>();
    ventas.forEach(venta => {
      try {
        const date = new Date(venta.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        monthsSet.add(`${year}-${month}`);
      } catch (error) {
        console.error('Error parsing date for month options:', error);
      }
    });

    const monthsArray = Array.from(monthsSet).sort().reverse(); // Most recent first
    return monthsArray.map(monthKey => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const monthName = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
      return {
        value: monthKey,
        label: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      };
    });
  };

  // Helper function to clear date filters
  const clearDateFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMonth('');
    setDateFilterType('all');
  };

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Helper functions for quick date filters
  const setTodayFilter = () => {
    const today = getTodayDate();
    setDateFilterType('dateRange');
    setStartDate(today);
    setEndDate(today);
    setSelectedMonth('');
  };

  const setThisWeekFilter = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    setDateFilterType('dateRange');
    setStartDate(monday.toISOString().split('T')[0]);
    setEndDate(sunday.toISOString().split('T')[0]);
    setSelectedMonth('');
  };

  const setThisMonthFilter = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    setDateFilterType('month');
    setSelectedMonth(`${year}-${month}`);
    setStartDate('');
    setEndDate('');
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
          <p className="text-sm">Cliente: {sale.clientName || 'N/A'}</p>
          <p className="text-sm">DNI: {sale.clientDni || 'N/A'}</p>
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
        <div className="flex items-center gap-4">
          {/* Export Button */}
          <Button
            onClick={handleExportExcel}
            disabled={isExporting || ventasFiltradas.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <LoadingSpinner size="sm" />
                Exportando...
              </>
            ) : (
              <>
                Exportar Excel
              </>
            )}
          </Button>
          
          {/* Sales Summary */}
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total mostrado: {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              S/ {ventasFiltradas.reduce((sum, venta) => sum + venta.total, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
        {/* Status Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Filtrar por Estado</h3>
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

        {/* Date Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">Filtrar por Fecha</h3>
          
          {/* Quick Date Filters */}
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-2">Filtros rápidos:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={setTodayFilter}
              >
                Hoy
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={setThisWeekFilter}
              >
                Esta Semana
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={setThisMonthFilter}
              >
                Este Mes
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Tipo de filtro"
              value={dateFilterType}
              onChange={(value) => {
                setDateFilterType(value as typeof dateFilterType);
                if (value === 'all') {
                  clearDateFilters();
                }
              }}
              options={[
                { value: 'all', label: 'Todas las fechas' },
                { value: 'dateRange', label: 'Rango de fechas' },
                { value: 'month', label: 'Por mes' }
              ]}
            />

            {dateFilterType === 'dateRange' && (
              <>
                <Input
                  label="Fecha inicio"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={getTodayDate()}
                />
                <Input
                  label="Fecha fin"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={getTodayDate()}
                  min={startDate}
                />
              </>
            )}

            {dateFilterType === 'month' && (
              <Select
                label="Seleccionar mes"
                value={selectedMonth}
                onChange={(value) => setSelectedMonth(value)}
                options={[
                  { value: '', label: 'Seleccionar mes...' },
                  ...getMonthOptions()
                ]}
              />
            )}

            {dateFilterType !== 'all' && (
              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={clearDateFilters}
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            )}
          </div>

          {/* Filter Summary */}
          {dateFilterType !== 'all' && (
            <div className="mt-3 text-sm text-gray-400">
              Mostrando {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''} 
              {dateFilterType === 'dateRange' && (startDate || endDate) && (
                <span>
                  {' '}del {startDate ? new Date(startDate).toLocaleDateString('es-PE') : 'inicio'} al{' '}
                  {endDate ? new Date(endDate).toLocaleDateString('es-PE') : 'presente'}
                </span>
              )}
              {dateFilterType === 'month' && selectedMonth && (
                <span>
                  {' '}de {getMonthOptions().find(opt => opt.value === selectedMonth)?.label.toLowerCase()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[20%] md:w-[25%]">
                  Cliente
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%] md:w-[18%]">
                  Fecha
                </th>
                <th className="px-2 md:px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider w-[8%] md:w-[7%]">
                  Items
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%] md:w-[15%]">
                  Total
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[15%] md:w-[12%]">
                  Estado
                </th>
                <th className="px-2 md:px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[27%] md:w-[23%]">
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
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-gray-100 truncate max-w-[120px] md:max-w-[180px]" title={venta.clientName || 'Cliente anónimo'}>
                        {venta.clientName || 'Anónimo'}
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[120px] md:max-w-[180px]" title={venta.clientDni || 'N/A'}>
                        {venta.clientDni || 'N/A'}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <div className="text-xs text-gray-100">
                        {displayDate.split(' ')[0]}
                      </div>
                      <div className="text-xs text-gray-400">
                        {displayDate.split(' ')[1]?.substring(0, 5)}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap text-center">
                      <div className="text-xs md:text-sm text-gray-100">
                        {venta.items.length}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <div className="text-xs md:text-sm font-medium text-gray-100">
                        S/ {venta.total.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <span className={`inline-flex px-1 md:px-2 py-1 text-xs font-semibold rounded-full ${
                        venta.invoiced 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {venta.invoiced ? 'Facturada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-2 md:py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1 items-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setVentaSel(venta)}
                          className="text-xs px-1 md:px-2 py-1"
                        >
                          <span className="hidden md:inline">Boleta</span>
                          <span className="md:hidden">Boleta</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openWhatsAppModal(venta)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-1 md:px-2 py-1"
                        >
                          <span className="hidden md:inline">WhatsApp</span>
                          <span className="md:hidden">WhatsApp</span>
                        </Button>
                        {!venta.invoiced && (
                          <div className="flex items-center gap-1">
                            {confirmingInvoice === venta.id ? (
                              <>
                                <div className="text-xs text-gray-300 whitespace-nowrap mr-1">
                                  <span className="hidden md:inline">¿Confirmar?</span>
                                  <span className="md:hidden">¿OK?</span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => handleMarkAsInvoiced(venta.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-1 md:px-2 py-1"
                                >
                                  Sí
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={cancelConfirmation}
                                  className="text-xs px-1 md:px-2 py-1"
                                >
                                  No
                                </Button>
                              </>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => confirmMarkAsInvoiced(venta.id)}
                                className="text-xs px-1 md:px-2 py-1"
                              >
                                <span className="hidden md:inline">Facturar</span>
                                <span className="md:hidden">Facturar</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {ventasFiltradas.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {ventas.length === 0 
              ? 'No se encontraron ventas registradas.'
              : 'No se encontraron ventas para los filtros seleccionados.'
            }
            {(dateFilterType !== 'all' || filtro !== 'todas') && ventas.length > 0 && (
              <p className="mt-2 text-sm">
                Intenta ajustar los filtros para ver más resultados.
              </p>
            )}
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

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        onClose={closeWhatsAppModal}
        storeName={config?.name}
        defaultPhone={whatsAppSale?.clientDni || ''}
        title="Contactar Cliente por WhatsApp"
      />
    </div>
  );
}
