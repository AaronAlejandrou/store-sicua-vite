import React from 'react';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const NAVIGATION_CARDS = [
  {
    key: 'inventario',
    title: 'Inventario',
    description: 'Gestiona productos, stock y categorías',
    icon: '📦',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'from-blue-600 to-blue-700'
  },
  {
    key: 'ventas',
    title: 'Nueva Venta',
    description: 'Crea boletas y registra ventas',
    icon: '🧾',
    color: 'from-green-500 to-green-600',
    hoverColor: 'from-green-600 to-green-700'
  },
  {
    key: 'historial',
    title: 'Historial',
    description: 'Consulta ventas y boletas anteriores',
    icon: '📜',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'from-purple-600 to-purple-700'
  },
  {
    key: 'config',
    title: 'Configuración',
    description: 'Configura datos de la tienda',
    icon: '⚙️',
    color: 'from-gray-500 to-gray-600',
    hoverColor: 'from-gray-600 to-gray-700'
  }
];

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Bienvenido a SICUA
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Sistema de Inventario y Control de Ventas
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {NAVIGATION_CARDS.map((card) => (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className={`
                group relative overflow-hidden rounded-xl bg-gradient-to-br ${card.color} 
                p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 
                hover:shadow-xl cursor-pointer transform
              `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ventas Hoy</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">S/ 0.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 