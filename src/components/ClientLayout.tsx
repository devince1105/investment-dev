'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import GlobalNavbar from '@/components/GlobalNavbar';
import GlobalFooter from '@/components/GlobalFooter';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <body className="h-screen overflow-hidden bg-[#020617] text-slate-100 flex flex-col">
      <GlobalNavbar 
        isSidebarCollapsed={isSidebarCollapsed} 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isCollapsed={isSidebarCollapsed} />
        <main className="flex-1 overflow-y-auto scrollbar-hide relative bg-[#020617]">
          {children}
        </main>
      </div>
    </body>
  );
}
