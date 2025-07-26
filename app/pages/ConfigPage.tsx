import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { LoadingSpinner } from '../components/UI/LoadingSpinner';
import type { StoreConfig } from '../domain/entities/StoreConfig';

interface ConfigPageProps {
  onConfigured?: () => void;
}

export function ConfigPage({ onConfigured }: ConfigPageProps) {
  const [formData, setFormData] = useState<StoreConfig>({
    name: '',
    address: '',
    email: '',
    phone: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const { configRepo } = useAppContext();

  useEffect(() => {
    loadConfiguration();
  }, [configRepo]);

  const loadConfiguration = async () => {
    try {
      const existingConfig = await configRepo.get();
      if (existingConfig) {
        setFormData(existingConfig);
      }
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof StoreConfig, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('El nombre de la tienda es obligatorio');
      }
      if (!formData.address.trim()) {
        throw new Error('La dirección es obligatoria');
      }
      if (!formData.email.trim()) {
        throw new Error('El correo electrónico es obligatorio');
      }
      if (!formData.phone.trim()) {
        throw new Error('El teléfono es obligatorio');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('El correo electrónico no es válido');
      }

      await configRepo.set(formData);
      
      // If there's a configuration callback, execute it
      if (onConfigured) {
        onConfigured();
      }
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      setError(error.message || 'Error al guardar la configuración. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Cargando configuración..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuración de la Tienda
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Configura los datos básicos de tu tienda. Esta información aparecerá en las boletas de venta.
        </p>
      </div>

      {/* Configuration Form */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Store Name */}
            <div>
              <Input
                label="Nombre de la Tienda *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ej: Mi Tienda de Ropa"
                required
                helperText="Este nombre aparecerá en el encabezado de las boletas"
              />
            </div>

            {/* Address */}
            <div>
              <Input
                label="Dirección *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Ej: Av. Principal 123, Ciudad"
                required
                helperText="Dirección completa de la tienda"
              />
            </div>

            {/* Email */}
            <div>
              <Input
                label="Correo Electrónico *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Ej: contacto@mitienda.com"
                required
                helperText="Correo electrónico de contacto"
              />
            </div>

            {/* Phone */}
            <div>
              <Input
                label="Teléfono *"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Ej: +51 999 123 456"
                required
                helperText="Número de teléfono de contacto"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {!error && !isSaving && formData.name && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-600">
                      Configuración guardada correctamente
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button 
                type="submit" 
                variant="primary"
                loading={isSaving}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        {formData.name && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Vista Previa de la Boleta
            </h3>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="text-center mb-4">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  BOLETA DE VENTA
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="font-semibold">{formData.name}</div>
                  <div>{formData.address}</div>
                  <div>{formData.email} | {formData.phone}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Esta es una vista previa de cómo aparecerá la información en las boletas
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 