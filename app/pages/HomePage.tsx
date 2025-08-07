import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import type { Product } from '../domain/entities/Product';
import type { Sale } from '../domain/entities/Sale';

interface HomePageProps {
  onNavigate: (page: string) => void;
  refreshKey?: number; // Add refresh key to force re-render
}

interface Stats {
  totalProducts: number;
  todaySales: number;
  todayRevenue: number;
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

export function HomePage({ onNavigate, refreshKey }: HomePageProps) {
  const { productRepo, saleRepo } = useAppContext();
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    todaySales: 0,
    todayRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        
        // Get all products
        const products = await productRepo.getAll();
        const totalProducts = products.length;
        
        // Get all sales
        const sales = await saleRepo.getAll();
        
        // Filter today's sales
        const today = new Date().toDateString();
        const todaySales = sales.filter((sale: Sale) => {
          const saleDate = new Date(sale.date).toDateString();
          return saleDate === today;
        });
        
        // Calculate today's revenue
        const todayRevenue = todaySales.reduce((total: number, sale: Sale) => total + sale.total, 0);
        
        setStats({
          totalProducts,
          todaySales: todaySales.length,
          todayRevenue
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [productRepo, saleRepo, refreshKey]); // Add refreshKey to dependencies
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="text-center py-8 md:py-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Bienvenido a SICUA
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Sistema de Inventario y Control de Ventas
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {NAVIGATION_CARDS.map((card) => (
            <div
              key={card.key}
              onClick={() => onNavigate(card.key)}
              className={`
                group relative overflow-hidden rounded-xl bg-gradient-to-br ${card.color} 
                p-4 md:p-6 text-white shadow-lg transition-all duration-300 hover:scale-105 
                hover:shadow-xl cursor-pointer transform
              `}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="text-2xl md:text-4xl mb-2 md:mb-4">{card.icon}</div>
                <h3 className="text-lg md:text-xl font-semibold mb-1 md:mb-2">{card.title}</h3>
                <p className="text-blue-100 text-xs md:text-sm leading-relaxed hidden sm:block">
                  {card.description}
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg className="w-4 h-4 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Productos</p>
                <p className="text-xl md:text-2xl font-semibold text-white">
                  {isLoading ? '...' : stats.totalProducts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Ventas Hoy</p>
                <p className="text-xl md:text-2xl font-semibold text-white">
                  {isLoading ? '...' : stats.todaySales}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-400">Ingresos Hoy</p>
                <p className="text-xl md:text-2xl font-semibold text-white">
                  {isLoading ? '...' : `S/ ${stats.todayRevenue.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 