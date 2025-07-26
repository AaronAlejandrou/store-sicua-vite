import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
}

export function Select({ 
  label, 
  error, 
  helperText, 
  options,
  onChange,
  className = '', 
  id,
  value,
  ...props 
}: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        value={value}
        onChange={handleChange}
        className={`
          block w-full rounded-lg border px-3 py-2 text-sm transition-colors
          focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
          disabled:cursor-not-allowed disabled:opacity-50
          dark:bg-gray-700 dark:text-white dark:border-gray-600
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-600' 
            : 'border-gray-300'
          }
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
} 