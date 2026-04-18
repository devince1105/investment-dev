'use client';

import React from 'react';
import Link from 'next/link';
import { TrendingUp, Globe, ArrowRight, BarChart3, Activity } from 'lucide-react';
import DigitalClock from '@/components/DigitalClock';

export default function MarketOverview() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100 font-sans">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
        {/* Background Decorative Blur */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl w-full space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-4">
              <Activity size={12} className="animate-pulse" />
              Real-time Global Intel
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
              Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-rose-400">Convergence</span>
            </h2>
            <p className="text-slate-500 font-medium tracking-wide max-w-xl mx-auto text-sm md:text-base">
              Unified monitoring terminal for local and international equities. 
              Sub-millisecond data aggregation across major exchanges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* TW Market Card */}
            <Link href="/tw" className="group">
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:border-rose-500/50 hover:bg-slate-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <TrendingUp size={120} className="text-rose-500" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100">台灣市場</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Taiwan Stock Exchange (TWSE)</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    進入終端 <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>

            {/* US Market Card */}
            <Link href="/us" className="group">
              <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm transition-all duration-500 hover:border-blue-500/50 hover:bg-slate-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                  <Globe size={120} className="text-blue-500" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-slate-100">國際市場</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">US Stock Market (NASDAQ/NYSE)</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                    進入終端 <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
