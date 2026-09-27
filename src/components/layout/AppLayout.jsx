import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SuperAdminSidebar } from '../superAdmin/SuperAdminSidebar';
import { Header } from './Header';
import { SessionExpiryModal } from './SessionExpiryModal';

export const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');

  return (
    <div className="flex min-h-screen bg-[#F5F6F3] text-[#111827] font-sans antialiased">
      {isSuperAdminRoute ? <SuperAdminSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      <SessionExpiryModal />
    </div>
  );
};

export default AppLayout;
