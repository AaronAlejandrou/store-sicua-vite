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
      // Parse the date string as-is since backend sends LocalDateTime in local timezone
      // DO NOT add 'Z' as that would incorrectly treat it as UTC
      const date = new Date(dateString);
      
      // Verificar que la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString, 'for sale:', saleId);
        const fallbackDate = new Date().toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setDateCache(prev => new Map(prev).set(saleId, fallbackDate));
        return fallbackDate;
      }
      
      // Format in local timezone (already correct since backend sends local time)
      const formattedDate = date.toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
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
          // Parse the date string as-is since backend sends LocalDateTime in local timezone
          // DO NOT add 'Z' as that would incorrectly treat it as UTC
          const date = new Date(sale.date);
          
          if (!isNaN(date.getTime())) {
            const formattedDate = date.toLocaleString('es-PE', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit', 
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });
            newCache.set(sale.id, formattedDate);
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
