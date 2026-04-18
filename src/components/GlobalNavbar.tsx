'use client';

import React from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LayoutDashboard,
  TrendingUp,
  Globe,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DigitalClock from '@/components/DigitalClock';

interface GlobalNavbarProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export default function GlobalNavbar({ isSidebarCollapsed, onToggleSidebar }: GlobalNavbarProps) {
  const [twseOpen, setTwseOpen] = React.useState(false);
  const [nasdaqOpen, setNasdaqOpen] = React.useState(false);

  React.useEffect(() => {
    const updateStats = () => {
      const now = new Date();
      // Taiwan is UTC+8
      const twnTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
      const day = twnTime.getDay();
      const hours = twnTime.getHours();
      const mins = twnTime.getMinutes();
      const timeVal = hours * 100 + mins;

      // TWSE: Mon-Fri 09:00 - 13:30
      const isTwOpen = day >= 1 && day <= 5 && timeVal >= 900 && timeVal <= 1330;
      setTwseOpen(isTwOpen);

      // NASDAQ (Summer Time DST): 
      // Mon-Fri Night (21:30 - 23:59)
      // Tue-Sat Dawn (00:00 - 04:00)
      let isUsOpen = false;
      if (day === 6) { // Sat
        isUsOpen = timeVal < 400; // Session from Friday night
      } else if (day === 0) { // Sun
        isUsOpen = false;
      } else if (day === 1) { // Mon
        isUsOpen = timeVal >= 2130;
      } else { // Tue - Fri
        isUsOpen = timeVal < 400 || timeVal >= 2130;
      }
      setNasdaqOpen(isUsOpen);
    };

    updateStats();
    const timer = setInterval(updateStats, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="h-16 border-b border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl flex items-center justify-between px-6 w-full shrink-0">
      <div className="flex items-center gap-6">
        <button 
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all active:scale-90"
        >
          {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>

        <div className="flex items-center gap-4">
          <TrendingUp size={20} className="text-blue-500" strokeWidth={2.5} />
          <h1 className="text-xs font-black uppercase tracking-[0.4em] text-slate-100 whitespace-nowrap">
            Nexus Integrated Stock Terminal
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Market Status Indicators */}
        <div className="hidden lg:flex items-center gap-6 pr-6 border-r border-slate-800">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-slate-500">TWSE</span>
              <div className={`w-1.5 h-1.5 rounded-full ${twseOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 opacity-60'}`} />
            </div>
            <span className={`text-xs font-bold ${twseOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
              {twseOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-slate-500">NASDAQ</span>
              <div className={`w-1.5 h-1.5 rounded-full ${nasdaqOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 opacity-60'}`} />
            </div>
            <span className={`text-xs font-bold ${nasdaqOpen ? 'text-emerald-400' : 'text-slate-500'}`}>
              {nasdaqOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DigitalClock />
          
          <div className="h-8 w-px bg-slate-800 hidden md:block" />
          
          <button className="p-2 text-slate-400 hover:text-slate-100 transition-colors hidden sm:block">
            <Bell size={18} />
          </button>
          
          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-200 uppercase tracking-tight">Vincelo Dev</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Admin Node</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:border-blue-500 transition-colors">
              <User size={18} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
