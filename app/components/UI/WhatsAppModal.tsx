import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { openWhatsAppChat, generateDefaultMessage, isValidPhoneNumber } from '../../infrastructure/sharing/WhatsAppAdapter';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  defaultPhone?: string;
  title?: string;
}

export function WhatsAppModal({ 
  isOpen, 
  onClose, 
  storeName, 
  defaultPhone = '', 
  title = 'Contactar por WhatsApp' 
}: WhatsAppModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [message, setMessage] = useState(() => generateDefaultMessage(storeName));
  const [error, setError] = useState('');

  const handleSend = () => {
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('Por favor, ingrese un número de teléfono');
      return;
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      setError('Número de teléfono inválido. Formato: +51987654321 o 987654321');
      return;
    }

    try {
      openWhatsAppChat(phoneNumber, message);
      onClose();
      // Reset form
      setPhoneNumber('');
      setMessage(generateDefaultMessage(storeName));
      setError('');
    } catch (err) {
      setError('Error al abrir WhatsApp. Por favor, intente nuevamente.');
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title}>
      <div className="space-y-4">
        <div>
          <Input
            label="Número de teléfono"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setError('');
            }}
            placeholder="Ej: +51987654321 o 987654321"
            helperText="Ingrese el número con código de país (+51 para Perú) o sin él"
          />
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mensaje (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escriba un mensaje personalizado..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          />
        </div>

        {phoneNumber && isValidPhoneNumber(phoneNumber) && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✅ Número válido. Se abrirá WhatsApp con este número.
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={!phoneNumber.trim()}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Abrir WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
