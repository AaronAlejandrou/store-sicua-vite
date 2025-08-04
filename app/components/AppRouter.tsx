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
import { config as envConfig } from '../config/environment';

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
        const authResponse = await fetch(`${envConfig.apiBaseUrl}/auth/status`, {
          credentials: 'include' // Include cookies for session management
        });
        const isAuth = authResponse.ok;
        
        console.log('Authentication status:', isAuth);
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // User is authenticated, load store config
          console.log('Loading store configuration...');
          try {
            const storeConfig = await configRepo.get();
            console.log('Store config loaded:', storeConfig);
            console.log('Store config type:', typeof storeConfig);
            console.log('Store config null?', storeConfig === null);
            setConfig(storeConfig);
          } catch (configError) {
            console.error('Error loading store configuration:', configError);
            setConfig(null);
          }
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

  const handleAuthenticated = async () => {
    try {
      console.log('=== HANDLE AUTHENTICATED START ===');
      console.log('User authenticated, loading store configuration...');
      setIsAuthenticated(true);
      
      // Try to load store config after successful authentication
      try {
        console.log('Calling configRepo.get()...');
        const storeConfig = await configRepo.get();
        console.log('Store config loaded after auth:', storeConfig);
        console.log('Store config type:', typeof storeConfig);
        console.log('Store config null?', storeConfig === null);
        
        if (storeConfig) {
          console.log('Setting config and should show MainLayout');
          setConfig(storeConfig);
        } else {
          console.log('Store config is null/falsy, will show ConfigPage');
          setConfig(null);
        }
      } catch (configError) {
        console.error('Error loading store configuration:', configError);
        console.log('Config loading failed, setting config to null - user will see ConfigPage');
        // If config fails to load, set config to null so ConfigPage shows
        setConfig(null);
      }
      
      console.log('=== HANDLE AUTHENTICATED END ===');
    } catch (error) {
      console.error('Error during authentication process:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${envConfig.apiBaseUrl}/auth/logout`, { 
        method: 'POST',
        credentials: 'include' // Include cookies for session management
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
    setIsAuthenticated(false);
    setConfig(null);
    setCurrentPage('home');
    setShowRegister(false); // Ensure we show login page, not registration
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