import React, { useState, useEffect } from 'react';
import { Select } from '../UI/Select';
import type { CategoryOption } from '../../domain/entities/Category';

interface CategorySelectProps {
  value: number | null;
  onChange: (categoryNumber: number | null) => void;
  categories: CategoryOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CategorySelect({ 
  value, 
  onChange, 
  categories, 
  placeholder = "Seleccionar categoría",
  required = false,
  disabled = false,
  className = ""
}: CategorySelectProps) {
  const [selectedValue, setSelectedValue] = useState<string>(
    value !== null ? value.toString() : ""
  );

  useEffect(() => {
    setSelectedValue(value !== null ? value.toString() : "");
  }, [value]);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    if (newValue === "") {
      onChange(null);
    } else {
      onChange(parseInt(newValue));
    }
  };

  const options = [
    { value: "", label: placeholder },
    ...categories.map(cat => ({
      value: cat.value.toString(),
      label: cat.displayText
    }))
  ];

  return (
    <Select
      value={selectedValue}
      onChange={handleChange}
      options={options}
      required={required}
      disabled={disabled}
      className={className}
    />
  );
}
