import React, { useState } from 'react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { config } from '../config/environment';

interface RegisterPageProps {
  onRegistered: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onRegistered, onSwitchToLogin }: RegisterPageProps) {
  const [formData, setFormData] = useState({
    storeName: '',
    storeAddress: '',
    email: '',
    storePhone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const registerData = {
        storeName: formData.storeName,
        storeAddress: formData.storeAddress,
        email: formData.email,
        storePhone: formData.storePhone,
        password: formData.password
      };

      const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify(registerData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar la tienda');
      }

      const authData = await response.json();
      console.log('Registration successful:', authData.message);
      
      onRegistered();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-lg w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">SICUA Store</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Registra tu nueva tienda</p>
        </div>
        
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre de la tienda *"
              value={formData.storeName}
              onChange={(e) => handleInputChange('storeName', e.target.value)}
              placeholder="Mi Tienda SICUA"
              required
            />

            <Input
              label="Teléfono *"
              value={formData.storePhone}
              onChange={(e) => handleInputChange('storePhone', e.target.value)}
              placeholder="+51 999 999 999"
              required
            />
          </div>

          <Input
            label="Dirección de la tienda *"
            value={formData.storeAddress}
            onChange={(e) => handleInputChange('storeAddress', e.target.value)}
            placeholder="Avenida Brasil 123 - Lima, Lima"
            required
          />

          <Input
            label="Email de la tienda *"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="contacto@mitienda.com"
            required
            helperText="Este email aparecerá en las boletas y será tu usuario de acceso"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contraseña *"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />

            <Input
              label="Confirmar contraseña *"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Repite tu contraseña"
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" loading={isLoading} className="w-full">
            Crear Tienda
          </Button>
          
          <div className="text-center">
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              ¿Ya tienes una tienda registrada?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-500 font-medium underline"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </form>
        
        {/* Developer Credit */}
        <div className="text-center">
          <div className="text-xs text-gray-500 italic">
            Hecho por Roandro (Aaron Muriel)
          </div>
        </div>
      </div>
    </div>
  );
}
