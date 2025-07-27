import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { MainLayout } from './Layout/MainLayout';
import { HomePage } from '../pages/HomePage';
import { InventoryPage } from '../pages/InventoryPage';
import { SalesPage } from '../pages/SalesPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ConfigPage } from '../pages/ConfigPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { LoadingSpinner } from './UI/LoadingSpinner';

export function AppRouter() {
  const { configRepo } = useAppContext();
  const [config, setConfig] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const checkAuthAndLoadConfig = async () => {
      try {
        console.log('Checking authentication status...');
        
        // Check if user is authenticated
        const authResponse = await fetch('/api/auth/status');
        const isAuth = authResponse.ok;
        
        console.log('Authentication status:', isAuth);
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // User is authenticated, load store config
          console.log('Loading store configuration...');
          const storeConfig = await configRepo.get();
          console.log('Store config loaded:', storeConfig);
          setConfig(storeConfig);
        }
        
      } catch (error) {
        console.error('Error checking auth or loading configuration:', error);
        setIsAuthenticated(false);
      } finally {
        console.log('Finished loading, setting isLoading to false');
        setIsLoading(false);
      }
    };

    checkAuthAndLoadConfig();
  }, [configRepo]);

  const handlePageChange = (pageKey: string) => {
    setCurrentPage(pageKey);
    
    // Refresh home page stats when navigating back to home
    if (pageKey === 'home') {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    window.location.reload(); // Reload to load the store configuration
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsAuthenticated(false);
    setConfig(null);
    setCurrentPage('home');
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

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return showRegister ? 
      <RegisterPage 
        onRegistered={handleAuthenticated} 
        onSwitchToLogin={() => setShowRegister(false)}
      /> :
      <LoginPage 
        onAuthenticated={handleAuthenticated} 
        onSwitchToRegister={() => setShowRegister(true)}
      />;
  }

  // If authenticated but no valid config, show config page
  if (!config) {
    return <ConfigPage onConfigured={handleConfigComplete} />;
  }

  return (
    <MainLayout currentPage={currentPage} onPageChange={handlePageChange} onLogout={handleLogout}>
      {currentPage === 'home' && <HomePage key={refreshKey} onNavigate={handlePageChange} refreshKey={refreshKey} />}
      {currentPage === 'inventario' && <InventoryPage />}
      {currentPage === 'ventas' && <SalesPage />}
      {currentPage === 'historial' && <HistoryPage />}
      {currentPage === 'config' && <ConfigPage onConfigured={() => handlePageChange('home')} />}
    </MainLayout>
  );
} 