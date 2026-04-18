'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function GlobalFooter() {
  const pathname = usePathname();
  
  // Decide which source text to show based on the route
  const getSourceText = () => {
    if (pathname.includes('/tw')) return '資料來源：富果 Fugle MarketData API';
    if (pathname.includes('/us')) return '資料來源：Finnhub.io Market API';
    return '資料來源：聚合市場即時數據庫';
  };

  const getNodeTag = () => {
    if (pathname.includes('/tw')) return 'TWS_CENTRAL_NODE';
    if (pathname.includes('/us')) return 'USA_MARKET_NODE';
    return 'GLOBAL_MONITOR_HUB';
  };

  const getAccentColor = () => {
    if (pathname.includes('/tw')) return 'bg-rose-500';
    if (pathname.includes('/us')) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <footer className="h-10 border-t border-slate-800 bg-[#0f172a]/95 backdrop-blur-xl flex items-center justify-between px-6 w-full shrink-0 z-[100]">
      <div className="flex items-center gap-4 text-xs font-black tracking-widest text-slate-600">
        <div className="flex items-center gap-2 px-2 py-0.5 rounded border border-slate-800 opacity-60">
          <div className={`w-1.5 h-1.5 rounded-full ${getAccentColor()} animate-pulse`} />
          <span className="uppercase text-xs">{getNodeTag()}</span>
        </div>
        <span className="text-blue-500/60 font-bold">SYSTEM v1.0.0</span>
        <span className="opacity-20 hidden sm:inline">|</span>
        <span className="hidden md:inline opacity-60 uppercase">Operations: Active & Stable</span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-slate-700">
          <span>{getSourceText()}</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span>授權等級：即時報價終端</span>
        </div>
        <div className="text-xs font-black tracking-[0.2em] text-slate-500/40 uppercase hidden sm:block">
          © 2026 Nexus Integrated Terminal
        </div>
      </div>
    </footer>
  );
}
