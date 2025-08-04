import React, { useState, useEffect, useMemo } from 'react';
import { Select } from '../UI/Select';
import { Button } from '../UI/Button';
import { CategoryModal } from './CategoryModal';
import { useAppContext } from '../../context/AppContext';
import type { Category, CategoryOption, CreateCategoryRequest, UpdateCategoryRequest } from '../../domain/entities/Category';

interface CategorySelectWithCreateProps {
  value: number | null;
  onChange: (categoryNumber: number | null) => void;
  categories: CategoryOption[];
  onCategoryCreated: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CategorySelectWithCreate({ 
  value, 
  onChange, 
  categories, 
  onCategoryCreated,
  placeholder = "Seleccionar categoría",
  required = false,
  disabled = false,
  className = ""
}: CategorySelectWithCreateProps) {
  const { categoryService } = useAppContext();
  const [selectedValue, setSelectedValue] = useState<string>(
    value !== null ? value.toString() : ""
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    setSelectedValue(value !== null ? value.toString() : "");
  }, [value]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getAllCategories();
        setAllCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const handleChange = (newValue: string) => {
    if (newValue === "CREATE_NEW") {
      setShowCreateModal(true);
      return;
    }

    setSelectedValue(newValue);
    if (newValue === "") {
      onChange(null);
    } else {
      onChange(parseInt(newValue));
    }
  };

  const handleModalSave = async (request: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      const newCategory = await categoryService.createCategory(request as CreateCategoryRequest);
      
      // Update local categories list
      const updatedCategories = await categoryService.getAllCategories();
      setAllCategories(updatedCategories);
      
      // Close modal first
      setShowCreateModal(false);
      
      // Auto-select the newly created category
      const newCategoryNumber = newCategory.categoryNumber;
      setSelectedValue(newCategoryNumber.toString());
      onChange(newCategoryNumber);
      
      // Then notify parent to refresh its categories
      setTimeout(() => {
        onCategoryCreated();
      }, 100);
      
    } catch (error) {
      console.error('Error creating category:', error);
      // Let the modal handle the error display
      throw error;
    }
  };

  const handleGetNextNumber = async (): Promise<number> => {
    return await categoryService.getNextCategoryNumber();
  };

  // Generate options from both props and local categories to ensure we have the latest
  const allCategoryOptions = useMemo(() => {
    // Create a map to avoid duplicates, preferring allCategories (most up-to-date)
    const categoryMap = new Map<number, CategoryOption>();
    
    // Add prop categories first
    categories.forEach(cat => {
      categoryMap.set(cat.value, cat);
    });
    
    // Add/override with local categories (more up-to-date)
    allCategories.forEach(cat => {
      categoryMap.set(cat.categoryNumber, {
        value: cat.categoryNumber,
        label: cat.name,
        displayText: `${cat.categoryNumber} - ${cat.name}`
      });
    });
    
    return Array.from(categoryMap.values()).sort((a, b) => a.value - b.value);
  }, [categories, allCategories]);

  const options = [
    { value: "", label: placeholder },
    ...allCategoryOptions.map(cat => ({
      value: cat.value.toString(),
      label: cat.displayText
    })),
    { value: "CREATE_NEW", label: "➕ Crear nueva categoría" }
  ];

  return (
    <>
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={selectedValue}
            onChange={handleChange}
            options={options}
            required={required}
            disabled={disabled}
            className={className}
          />
        </div>
      </div>

      {/* Category Creation Modal */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleModalSave}
        onGetNextNumber={handleGetNextNumber}
        category={null}
        existingCategories={allCategories}
        mode="create"
      />
    </>
  );
}
