import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout?: () => void;
}

export function MainLayout({ children, currentPage, onPageChange, onLogout }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page: string) => {
    onPageChange(page);
    setSidebarOpen(false); // Close sidebar on mobile when navigating
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Single Sidebar - works for both desktop and mobile */}
      <div className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar currentPage={currentPage} onPageChange={handlePageChange} onLogout={onLogout} />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header onToggleSidebar={handleToggleSidebar} currentPage={currentPage} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto pt-16 lg:ml-64">
          <div className="container mx-auto p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 