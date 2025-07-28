import React from 'react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
}

const NAVIGATION_ITEMS = [
  { key: 'home', label: 'Inicio', icon: '🏠' },
  { key: 'inventario', label: 'Inventario', icon: '📦' },
  { key: 'ventas', label: 'Nueva Venta', icon: '🧾' },
  { key: 'historial', label: 'Historial', icon: '📜' },
  { key: 'config', label: 'Configuración', icon: '⚙️' },
];

export function Sidebar({ currentPage, onPageChange, onLogout }: SidebarProps) {
  return (
    <aside className="h-full w-64 bg-gray-800 shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-gray-700 bg-gradient-to-r from-blue-800 to-blue-900 px-4">
          <div className="text-2xl font-bold text-white">SICUA</div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {NAVIGATION_ITEMS.map(navItem => (
            <button
              key={navItem.key}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-gray-700 ${
                currentPage === navItem.key
                  ? 'bg-blue-900 text-blue-300 shadow-sm'
                  : 'text-gray-300 hover:text-white'
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
        <div className="border-t border-gray-700 p-4 space-y-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
              title="Cerrar Sesión"
            >
              <span className="text-lg">🚪</span>
              <span className="truncate">Cerrar Sesión</span>
            </button>
          )}
          <div className="text-xs text-gray-400">
            Sistema de Inventario y Control de Ventas
          </div>
          <div className="text-xs text-gray-500 italic">
            Hecho por Roandro (Aaron Muriel)
          </div>
        </div>
      </div>
    </aside>
  );
} 