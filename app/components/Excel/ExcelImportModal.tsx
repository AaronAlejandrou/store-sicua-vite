import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { LoadingSpinner } from '../UI/LoadingSpinner';
import type { ExcelImportResponse } from '../../domain/services/ExcelService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<ExcelImportResponse>;
  onRefreshProducts?: () => void;
}

export function ExcelImportModal({ isOpen, onClose, onImport, onRefreshProducts }: ExcelImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [modalState, setModalState] = useState<'form' | 'loading' | 'success' | 'error'>('form');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging for every render
  console.log('RENDER - modalState:', modalState, 'isOpen:', isOpen, 'isLoading:', isLoading);

  // Watch for modalState changes
  useEffect(() => {
    console.log('MODAL STATE CHANGED TO:', modalState);
  }, [modalState]);

  // Auto-close modal after successful import
  useEffect(() => {
    if (modalState === 'success') {
      console.log('Auto-close timer started');
      const timer = setTimeout(() => {
        console.log('Auto-closing modal');
        
        // Refresh products right before closing (only for successful imports)
        if (onRefreshProducts && importResult && importResult.successfulImports > 0) {
          console.log('Refreshing products before closing modal');
          onRefreshProducts();
        }
        
        // Reset states and close modal
        setSelectedFile(null);
        setError('');
        setImportResult(null);
        setModalState('form');
        setIsLoading(false);
        onClose();
      }, 3000); // Close after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [modalState, onClose, onRefreshProducts, importResult]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo Excel');
      return;
    }

    setModalState('loading');
    setIsLoading(true);
    setError('');
    setImportResult(null);

    try {
      const result = await onImport(selectedFile);
      setImportResult(result);
      
      console.log('Import completed, result:', result);
      
      // Determine if this was completely successful (no errors at all)
      const hasErrors = result.errors && result.errors.length > 0;
      const hasSuccessfulImports = result.successfulImports > 0;
      
      if (!hasErrors && hasSuccessfulImports) {
        // Completely successful - show success message
        setModalState('success');
        console.log('Setting modal state to SUCCESS');
        
        // Don't refresh during success display to avoid interference
        // We'll refresh after the modal closes via auto-close timer
        console.log('Will refresh products after modal closes');
      } else {
        // Has errors or warnings - show the results/error view
        setModalState('error');
        console.log('Setting modal state to ERROR');
        
        // Don't refresh immediately to avoid interference with error display
        // Products will be refreshed when user clicks "Try Again" or "Close"
        if (hasSuccessfulImports) {
          console.log('Will refresh products when user closes error dialog');
        }
      }
    } catch (err) {
      console.error('Excel Import Error:', err);
      setError(err instanceof Error ? err.message : 'Error importando productos');
      setImportResult(null);
      setModalState('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Refresh products if there were any successful imports before closing
    if (importResult && importResult.successfulImports > 0 && onRefreshProducts) {
      console.log('Refreshing products before closing (had successful imports)');
      onRefreshProducts();
    }
    
    setSelectedFile(null);
    setError('');
    setImportResult(null);
    setModalState('form');
    setIsLoading(false);
    onClose();
  };

  const resetForm = () => {
    // Refresh products if there were any successful imports before resetting
    if (importResult && importResult.successfulImports > 0 && onRefreshProducts) {
      console.log('Refreshing products before reset (had successful imports)');
      onRefreshProducts();
    }
    
    setSelectedFile(null);
    setError('');
    setImportResult(null);
    setModalState('form');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importar Productos desde Excel">
      <div className="space-y-6">
        {/* Loading State */}
        {modalState === 'loading' && (
          <div className="text-center py-8">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Procesando archivo Excel...
            </p>
          </div>
        )}

        {/* Success Message */}
        {modalState === 'success' && (
          <div className="text-center py-8">
            <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 p-8 rounded-xl">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 dark:text-green-400 text-3xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-3">
                ¡Importación Exitosa!
              </h3>
              <p className="text-lg text-green-700 dark:text-green-300 mb-2">
                Se importaron productos correctamente.
              </p>
              <div className="bg-green-100 dark:bg-green-800 p-3 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300 font-medium">
                  🔄 La tabla de inventario se ha actualizado
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Esta ventana se cerrará automáticamente en 3 segundos...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error/Warning Results */}
        {modalState === 'error' && importResult && (
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 dark:text-red-100 mb-2">
                ❌ Problemas en la Importación
              </h4>
              
              {/* Show import summary */}
              <div className="mb-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Procesados: {importResult.totalProcessed} | 
                  Exitosos: {importResult.successfulImports} | 
                  Errores: {importResult.errors?.length || 0}
                </p>
              </div>

              {/* Show errors */}
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="bg-red-100 dark:bg-red-800 p-3 rounded-lg">
                  <h5 className="font-medium text-red-900 dark:text-red-100 mb-2">Errores encontrados:</h5>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Show warnings if any */}
              {importResult.warnings && importResult.warnings.length > 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-800 p-3 rounded-lg mt-3">
                  <h5 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Advertencias:</h5>
                  <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={resetForm}>
                📝 Intentar Otra Vez
              </Button>
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}

        {/* Import Form */}
        {modalState === 'form' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                📋 Instrucciones de Importación
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• El archivo debe ser formato Excel (.xlsx)</li>
                <li>• <strong>Categorías automáticas:</strong> Si el número de categoría no existe y proporcionas un nombre, se creará automáticamente</li>
                <li>• Si la categoría existe, se usará la existente (se ignora el nombre proporcionado)</li>
                <li>• Los campos obligatorios son: Nombre, Precio, Categoria_Numero, Stock</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seleccionar Archivo Excel
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                           file:mr-4 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:text-sm file:font-medium
                           file:bg-blue-50 file:text-blue-700
                           hover:file:bg-blue-100
                           dark:file:bg-blue-900/30 dark:file:text-blue-300
                           dark:hover:file:bg-blue-900/50"
                />
              </div>

              {selectedFile && (
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Archivo seleccionado:</span> {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Tamaño: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 p-3 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="secondary" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || isLoading}
                  className="min-w-32"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : '📥 Importar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
