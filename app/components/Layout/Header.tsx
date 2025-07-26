import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
  currentPage: string;
}

export function Header({ onToggleSidebar, currentPage }: HeaderProps) {
  const getPageTitle = () => {
    const titles: Record<string, string> = {
      home: 'Inicio',
      inventario: 'Gestión de Inventario',
      ventas: 'Nueva Venta',
      historial: 'Historial de Ventas',
      config: 'Configuración'
    };
    return titles[currentPage] || 'SICUA';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-gray-800 shadow-sm lg:left-64">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="inline-flex items-center justify-center rounded-lg p-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300 lg:hidden"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Page title */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle placeholder */}
          <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
} 