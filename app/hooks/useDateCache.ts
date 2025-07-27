import { useState, useCallback } from 'react';
import type { Sale } from '../domain/entities/Sale';

export const useDateCache = () => {
  const [dateCache, setDateCache] = useState<Map<string, string>>(new Map());

  const formatSaleDate = useCallback((dateString: string, saleId: string): string => {
    // Verificar si ya está en cache
    if (dateCache.has(saleId)) {
      return dateCache.get(saleId)!;
    }
    
    try {
      // Crear la fecha una sola vez y formatearla
      const date = new Date(dateString);
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString, 'for sale:', saleId);
        const fallbackDate = new Date().toLocaleString();
        setDateCache(prev => new Map(prev).set(saleId, fallbackDate));
        return fallbackDate;
      }
      
      const formattedDate = date.toLocaleString();
      
      // Guardar en cache
      setDateCache(prev => new Map(prev).set(saleId, formattedDate));
      
      return formattedDate;
    } catch (error) {
      console.error('Error formatting date:', error, dateString, 'for sale:', saleId);
      const fallbackDate = new Date().toLocaleString();
      setDateCache(prev => new Map(prev).set(saleId, fallbackDate));
      return fallbackDate;
    }
  }, [dateCache]);

  const getSaleFormattedDate = useCallback((sale: Sale): string => {
    return formatSaleDate(sale.date, sale.id);
  }, [formatSaleDate]);

  const preloadSaleDates = useCallback((sales: Sale[]) => {
    const newCache = new Map(dateCache);
    let hasChanges = false;
    
    sales.forEach(sale => {
      if (!newCache.has(sale.id)) {
        try {
          const date = new Date(sale.date);
          if (!isNaN(date.getTime())) {
            newCache.set(sale.id, date.toLocaleString());
            hasChanges = true;
          }
        } catch (error) {
          console.error('Error pre-loading date for sale:', sale.id, error);
        }
      }
    });
    
    if (hasChanges) {
      setDateCache(newCache);
    }
  }, [dateCache]);

  return {
    getSaleFormattedDate,
    preloadSaleDates,
    dateCache
  };
};
