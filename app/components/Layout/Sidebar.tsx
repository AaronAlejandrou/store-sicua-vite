import React from 'react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const NAVIGATION_ITEMS = [
  { key: 'home', label: 'Inicio', icon: '🏠' },
  { key: 'inventario', label: 'Inventario', icon: '📦' },
  { key: 'ventas', label: 'Nueva Venta', icon: '🧾' },
  { key: 'historial', label: 'Historial', icon: '📜' },
  { key: 'config', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:translate-x-0">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 px-4 dark:border-gray-700 dark:from-blue-800 dark:to-blue-900">
          <div className="text-2xl font-bold text-white">SICUA</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {NAVIGATION_ITEMS.map(navItem => (
            <button
              key={navItem.key}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentPage === navItem.key
                  ? 'bg-blue-100 text-blue-700 shadow-sm dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
              }`}
              onClick={() => onPageChange(navItem.key)}
              title={navItem.label}
            >
              <span className="text-lg">{navItem.icon}</span>
              <span className="truncate">{navItem.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Footer */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Sistema de Inventario y Control de Ventas
          </div>
        </div>
      </div>
    </aside>
  );
} 