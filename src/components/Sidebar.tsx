'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Globe, 
  Landmark, 
  ChevronRight
} from 'lucide-react';

const navItems = [
  { name: '市場總覽', href: '/dashboard', icon: LayoutDashboard, activeClass: 'bg-blue-600/15 text-blue-400 border-blue-500/20', iconClass: 'text-blue-400' },
  { name: '國際市場 (US)', href: '/us', icon: Globe, activeClass: 'bg-blue-600/15 text-blue-400 border-blue-500/20', iconClass: 'text-blue-400' },
  { name: '台灣市場 (TW)', href: '/tw', icon: Landmark, activeClass: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20', iconClass: 'text-emerald-400' },
];

interface SidebarProps {
  isCollapsed: boolean;
}

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={`border-r border-slate-800 bg-[#0f172a]/40 backdrop-blur-xl flex flex-col scrollbar-hide shrink-0 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20 overflow-y-hidden' : 'w-64 overflow-y-auto'
      } hidden md:flex`}
    >
      <nav className={`flex-1 pt-4 pb-8 px-4 space-y-2 ${isCollapsed ? 'items-center' : ''}`}>
        {navItems.map((item) => {
          // Smart path matching for stock detail pages
          let isActive = pathname === item.href;
          if (pathname.startsWith('/stock/')) {
            const sym = pathname.split('/').pop()?.toUpperCase() || '';
            const isUSSymbol = /^[A-Z.]+$/.test(sym) && !/^\d+$/.test(sym);
            if (item.href === '/us' && isUSSymbol) isActive = true;
            if (item.href === '/tw' && !isUSSymbol) isActive = true;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center rounded-xl transition-all group ${
                isCollapsed ? 'justify-center w-12 h-12 p-0' : 'justify-between px-4 py-3.5'
              } ${
                isActive 
                  ? `${item.activeClass} border` 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={isCollapsed ? 20 : 18} className={isActive ? item.iconClass : 'text-slate-500 group-hover:text-slate-300'} />
                {!isCollapsed && <span className="text-sm font-black tracking-widest uppercase">{item.name}</span>}
              </div>
              {!isCollapsed && isActive && <ChevronRight size={14} className={item.iconClass} />}
            </Link>
          );
        })}
      </nav>

      <div className={`p-6 border-t border-slate-800 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 p-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="px-4 py-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
              Operational: <span className="text-slate-400">Stable</span>
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
