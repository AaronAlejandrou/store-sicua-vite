/**
 * WhatsApp sharing utilities
 */

/**
 * Formats a phone number for WhatsApp (removes spaces, dashes, parentheses)
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-numeric characters except + at the beginning
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it
  if (phoneNumber.startsWith('+')) {
    cleaned = '+' + cleaned.substring(1);
  } else if (cleaned.startsWith('51') && cleaned.length === 11) {
    // If it's a Peru number without country code, add +51
    cleaned = '+51' + cleaned.substring(2);
  } else if (cleaned.length === 9) {
    // If it's a 9-digit number, assume Peru and add +51
    cleaned = '+51' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    // If no country code, add +
    cleaned = '+' + cleaned;
  }
  
  return cleaned;
};

/**
 * Validates if a phone number looks valid
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);
  // Basic validation: starts with + and has at least 10 digits
  return /^\+\d{10,15}$/.test(formatted);
};

/**
 * Opens WhatsApp chat with a phone number and optional message
 */
export const openWhatsAppChat = (phoneNumber: string, message?: string): void => {
  if (!isValidPhoneNumber(phoneNumber)) {
    alert('Número de teléfono inválido. Por favor, ingrese un número válido.');
    return;
  }

  const formattedPhone = formatPhoneNumber(phoneNumber).replace('+', '');
  let whatsappUrl = `https://wa.me/${formattedPhone}`;
  
  if (message && message.trim()) {
    const encodedMessage = encodeURIComponent(message.trim());
    whatsappUrl += `?text=${encodedMessage}`;
  }
  
  // Open in new tab/window
  window.open(whatsappUrl, '_blank');
};

/**
 * Generates a default message for a store
 */
export const generateDefaultMessage = (storeName?: string): string => {
  if (storeName) {
    return `¡Hola! Soy de ${storeName}. ¿En qué puedo ayudarte? 😊`;
  }
  return '¡Hola! ¿En qué puedo ayudarte? 😊';
};
