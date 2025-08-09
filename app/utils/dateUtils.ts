/**
 * Date utility functions for handling timezone conversion
 */

/**
 * Formats a date string from the backend to local time
 * This handles the case where the backend is in UTC but we want to display local time
 */
export function formatUTCDateToLocal(dateString: string): string {
  try {
    // Force parse as UTC if no timezone info
    const utcDate = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 19)
      ? new Date(dateString)
      : new Date(dateString + 'Z');
    
    if (isNaN(utcDate.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Fecha inválida';
    }
    
    // Convert to local time
    return utcDate.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting UTC date:', error, dateString);
    return 'Error en fecha';
  }
}
