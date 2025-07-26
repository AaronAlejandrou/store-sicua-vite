import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MainLayout } from './Layout/MainLayout';
import { HomePage } from '../pages/HomePage';
import { InventoryPage } from '../pages/InventoryPage';
import { SalesPage } from '../pages/SalesPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ConfigPage } from '../pages/ConfigPage';
import { LoadingSpinner } from './UI/LoadingSpinner';

export function AppRouter() {
  const { configRepo } = useAppContext();
  const [config, setConfig] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        console.log('Loading store configuration...');
        const storeConfig = await configRepo.get();
        console.log('Store config loaded:', storeConfig);
        setConfig(storeConfig);
        
        // If no configuration, go to configuration page
        if (!storeConfig) {
          console.log('No configuration found, redirecting to config page');
          setCurrentPage('config');
        } else {
          console.log('Configuration found, staying on home page');
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
        setCurrentPage('config');
      } finally {
        console.log('Finished loading configuration, setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [configRepo]);

  const handlePageChange = (pageKey: string) => {
    setCurrentPage(pageKey);
    
    // Refresh home page stats when navigating back to home
    if (pageKey === 'home') {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleConfigComplete = () => {
    window.location.reload(); // Reload to apply new configuration
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Cargando aplicación..." />
      </div>
    );
  }

  // If no configuration, show configuration page
  if (!config) {
    return <ConfigPage onConfigured={handleConfigComplete} />;
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={handlePageChange}>
      {currentPage === 'home' && <HomePage key={refreshKey} onNavigate={handlePageChange} refreshKey={refreshKey} />}
      {currentPage === 'inventario' && <InventoryPage />}
      {currentPage === 'ventas' && <SalesPage />}
      {currentPage === 'historial' && <HistoryPage />}
      {currentPage === 'config' && <ConfigPage onConfigured={() => handlePageChange('home')} />}
    </MainLayout>
  );
} 