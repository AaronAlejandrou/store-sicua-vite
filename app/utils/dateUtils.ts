/**
 * Date utility functions for handling timezone conversion
 */

/**
 * Formats a date string from the backend for display
 * The backend sends LocalDateTime which is already in local timezone,
 * so we parse it as-is without timezone conversion
 */
export function formatSaleDate(dateString: string): string {
  try {
    // Parse the date string as-is since backend sends LocalDateTime in local timezone
    // DO NOT add 'Z' as that would incorrectly treat it as UTC
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Fecha inválida';
    }
    
    // Format the date (it's already in correct timezone)
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
}

// Keep the old function name for backward compatibility
export const formatUTCDateToLocal = formatSaleDate;
