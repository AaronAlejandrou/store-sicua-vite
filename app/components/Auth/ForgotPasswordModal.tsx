import { FormEvent, useState } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Modal } from '../UI/Modal';
import { config } from '../../config/environment';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'newPassword' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Email no encontrado');
      }

      setStep('newPassword');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          newPassword 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al cambiar la contraseña');
      }

      setStep('success');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Recuperar Contraseña
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Ingresa el email de tu tienda para verificar tu identidad
      </p>
      
      <form onSubmit={handleVerifyEmail} className="space-y-4">
        <Input
          label="Email de la tienda"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@mitienda.com"
          required
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            className="flex-1"
          >
            Verificar Email
          </Button>
        </div>
      </form>
    </div>
  );

  const renderNewPasswordStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Nueva Contraseña
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Email verificado: <span className="font-medium">{email}</span>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Ingresa tu nueva contraseña
      </p>
      
      <form onSubmit={handleResetPassword} className="space-y-4">
        <Input
          label="Nueva contraseña"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
        
        <Input
          label="Confirmar nueva contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repite tu nueva contraseña"
          required
        />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('email')}
            className="flex-1"
          >
            Volver
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            className="flex-1"
          >
            Cambiar Contraseña
          </Button>
        </div>
      </form>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-4 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        ¡Contraseña Cambiada!
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
      </p>
      
      <Button
        onClick={handleClose}
        className="w-full"
      >
        Continuar
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        {step === 'email' && renderEmailStep()}
        {step === 'newPassword' && renderNewPasswordStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </Modal>
  );
}
