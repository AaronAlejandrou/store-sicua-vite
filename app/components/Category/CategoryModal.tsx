import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../../domain/entities/Category';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onGetNextNumber: () => Promise<number>;
  category?: Category | null;
  existingCategories: Category[];
  mode: 'create' | 'edit';
}

export function CategoryModal({
  isOpen,
  onClose,
  onSave,
  onGetNextNumber,
  category,
  existingCategories,
  mode
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [categoryNumber, setCategoryNumber] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setName(category.name);
        setCategoryNumber(category.categoryNumber);
      } else {
        setName('');
        setCategoryNumber('');
        // Auto-fill next category number for create mode
        if (mode === 'create') {
          onGetNextNumber().then(nextNumber => {
            setCategoryNumber(nextNumber);
          });
        }
      }
      setError(null);
    }
  }, [isOpen, mode, category, onGetNextNumber]);

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!name.trim()) {
      return { isValid: false, error: 'El nombre de la categoría es requerido' };
    }

    if (name.length > 100) {
      return { isValid: false, error: 'El nombre no puede exceder 100 caracteres' };
    }

    if (!categoryNumber || categoryNumber <= 0) {
      return { isValid: false, error: 'El número de categoría debe ser mayor a 0' };
    }

    // Check for duplicate category number
    const duplicateNumber = existingCategories.find(cat => 
      cat.categoryNumber === categoryNumber && cat.categoryId !== category?.categoryId
    );
    if (duplicateNumber) {
      return { isValid: false, error: `El número ${categoryNumber} ya está en uso` };
    }

    // Check for duplicate category name
    const duplicateName = existingCategories.find(cat => 
      cat.name.toLowerCase().trim() === name.toLowerCase().trim() && cat.categoryId !== category?.categoryId
    );
    if (duplicateName) {
      return { isValid: false, error: `Ya existe una categoría con el nombre "${name}"` };
    }

    return { isValid: true };
  };

  const handleSubmit = async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.error || 'Error de validación');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const request = {
        name: name.trim(),
        categoryNumber: categoryNumber as number
      };

      await onSave(request);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}>
      <div className="space-y-4">
        <div>
          <label htmlFor="categoryNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Número de Categoría
          </label>
          <Input
            id="categoryNumber"
            type="number"
            value={categoryNumber}
            onChange={(e) => setCategoryNumber(e.target.value ? parseInt(e.target.value) : '')}
            placeholder="Ej: 1, 2, 3..."
            required
            min={1}
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Categoría
          </label>
          <Input
            id="categoryName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Hombre - Camiseta"
            required
            maxLength={100}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Ejemplo: "Hombre - Camiseta", "Mujer - Pantalón", "Niños - Zapatos"
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : (mode === 'create' ? 'Crear' : 'Actualizar')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
