import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { SuperAdminSidebar } from '../superAdmin/SuperAdminSidebar';
import { Header } from './Header';
import { SessionExpiryModal } from './SessionExpiryModal';
import { GlobalSearchModal } from '../superAdmin/GlobalSearchModal';

export const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSuperAdminRoute = location.pathname.startsWith('/super-admin');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#EFEAE1] text-[#0F172A] font-sans antialiased">
      {isSuperAdminRoute ? <SuperAdminSidebar /> : <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
      <SessionExpiryModal />
      <GlobalSearchModal />
    </div>
  );
};

export default AppLayout;
