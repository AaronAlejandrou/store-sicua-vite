/**
 * Date utility functions for handling timezone conversion
 */

/**
 * Formats a date string from the backend to local time
 * This handles the case where the backend is in UTC but we want to display local time
 */
export function formatDateToLocal(dateString: string): string {
  try {
    // If the date string doesn't have timezone info, treat it as UTC from the backend
    let date: Date;
    
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 19)) {
      // Backend sends LocalDateTime without timezone info, assume it's in UTC
      date = new Date(dateString + 'Z');
    } else {
      // Date string has timezone info or is in a different format
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return 'Fecha inválida';
    }
    
    // Format in local timezone
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // Use system timezone
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'Error en fecha';
  }
}

/**
 * Alternative approach: Parse as UTC and convert to local
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

/**
 * Formats date for Excel export (in local timezone)
 */
export function formatDateForExcel(dateString: string): string {
  try {
    const utcDate = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 19)
      ? new Date(dateString)
      : new Date(dateString + 'Z');
      
    if (isNaN(utcDate.getTime())) {
      return 'Fecha inválida';
    }
    
    return utcDate.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error formatting date for Excel:', error, dateString);
    return 'Error en fecha';
  }
}

/**
 * Adjusts local date to UTC for backend filtering
 * This helps ensure the backend filters work correctly with timezone differences
 */
export function adjustDateForBackend(localDateString: string, isEndDate: boolean = false): string {
  try {
    // For backend compatibility, send the date with explicit timezone info
    // The backend should handle the timezone conversion
    const localDate = new Date(localDateString + (isEndDate ? 'T23:59:59.999' : 'T00:00:00'));
    
    // Return ISO string which includes timezone info
    return localDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error adjusting date for backend:', error, localDateString);
    return localDateString; // Fallback to original
  }
}

/**
 * Adjusts date range for backend Excel export to compensate for timezone differences
 * The backend might be processing dates in UTC, so we adjust accordingly
 */
export function adjustDateRangeForExcel(localDateString: string, isEndDate: boolean = false): string {
  try {
    // Get current timezone offset in hours
    const now = new Date();
    const offsetMinutes = now.getTimezoneOffset(); // Positive if behind UTC, negative if ahead
    const offsetHours = offsetMinutes / 60;
    
    console.log(`Timezone offset: ${offsetHours} hours (${offsetMinutes} minutes)`);
    
    // Create date in local timezone
    const baseDate = new Date(localDateString + (isEndDate ? 'T23:59:59' : 'T00:00:00'));
    
    // For Excel export, we might need to adjust the date range to compensate
    // for how the backend interprets the dates
    const adjustedDate = new Date(baseDate);
    
    // If the backend treats our local dates as UTC, we need to compensate
    // by shifting the date range by our timezone offset
    if (offsetMinutes > 0) {
      // We're behind UTC (e.g., UTC-5), so add hours to compensate
      adjustedDate.setHours(adjustedDate.getHours() + Math.abs(offsetHours));
    } else if (offsetMinutes < 0) {
      // We're ahead of UTC (e.g., UTC+2), so subtract hours to compensate  
      adjustedDate.setHours(adjustedDate.getHours() - Math.abs(offsetHours));
    }
    
    return adjustedDate.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error adjusting date range for Excel:', error, localDateString);
    return localDateString;
  }
}
