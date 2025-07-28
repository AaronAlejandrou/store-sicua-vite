import React, { useState } from 'react';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { config } from '../config/environment';

interface LoginPageProps {
  onAuthenticated: () => void;
  onSwitchToRegister: () => void;
}

export function LoginPage({ onAuthenticated, onSwitchToRegister }: LoginPageProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting login with API base URL:', config.apiBaseUrl);
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session management
        body: JSON.stringify(formData)
      });

      console.log('Login response status:', response.status);
      console.log('All cookies after login:', document.cookie);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const authData = await response.json();
      console.log('Login successful:', authData.message);
      
      onAuthenticated();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    // Simple alert for now - you can implement email sending later
    alert('Funcionalidad de recuperación de contraseña será implementada próximamente. Por favor contacta al administrador.');
    setShowForgotPassword(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">SICUA Store</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Accede a tu tienda</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email de la tienda"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="ejemplo@mitienda.com"
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Tu contraseña"
            required
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <Button type="submit" loading={isLoading} className="w-full">
            Iniciar Sesión
          </Button>
          
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-500 text-sm underline"
              disabled={showForgotPassword}
            >
              ¿Olvidaste tu contraseña?
            </button>
            
            <div className="text-gray-600 dark:text-gray-300 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-blue-600 hover:text-blue-500 font-medium underline"
              >
                Registrar nueva tienda
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
