'use client';

import React from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Landmark,
  Globe,
} from 'lucide-react';
import { useTaiwanStock } from '@/hooks/useTaiwanStock';
import { useUSStock } from '@/hooks/useUSStock';
import { WATCHLIST } from '@/types/stock';

// Top-N symbols to summarize per side. Keep short so "約報" stays scannable.
const TW_TOP = WATCHLIST.slice(0, 10);
const US_TOP = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF' },
  { symbol: 'DIA', name: 'Dow Jones ETF' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'TSLA', name: 'Tesla' },
];

type Row = { symbol: string; name: string };

function ChangeBadge({ pct }: { pct: number | null | undefined }) {
  if (pct === null || pct === undefined || Number.isNaN(pct)) {
    return <span className="text-slate-600 text-xs font-mono">--</span>;
  }
  const up = pct >= 0;
  const color = up ? 'text-rose-400' : 'text-emerald-400';
  const Arrow = up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 ${color} text-xs font-mono tabular-nums`}>
      <Arrow size={12} strokeWidth={2.5} />
      {up ? '+' : ''}
      {pct.toFixed(2)}%
    </span>
  );
}

function TWRow({ item }: { item: Row }) {
  const { data, isLoading } = useTaiwanStock(item.symbol, { refreshInterval: 60_000 });
  return (
    <Link
      href={`/stock/${item.symbol}`}
      className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-black text-slate-500 font-mono w-14 shrink-0">{item.symbol}</span>
        <span className="text-xs text-slate-300 truncate max-w-[9rem] group-hover:text-slate-100 transition-colors">
          {data?.name || item.name}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs font-mono tabular-nums text-slate-200 w-16 text-right">
          {isLoading ? '—' : data?.lastPrice != null ? data.lastPrice.toFixed(2) : '--'}
        </span>
        <div className="w-20 text-right">
          <ChangeBadge pct={data?.changePercent ?? null} />
        </div>
      </div>
    </Link>
  );
}

function USRow({ item }: { item: Row }) {
  const { data, isLoading } = useUSStock(item.symbol, { refreshInterval: 60_000 });
  return (
    <Link
      href={`/stock/${item.symbol}`}
      className="flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xs font-black text-slate-500 font-mono w-14 shrink-0">{item.symbol}</span>
        <span className="text-xs text-slate-300 truncate max-w-[9rem] group-hover:text-slate-100 transition-colors">
          {data?.name || item.name}
        </span>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-xs font-mono tabular-nums text-slate-200 w-16 text-right">
          {isLoading ? '—' : data?.lastPrice != null ? data.lastPrice.toFixed(2) : '--'}
        </span>
        <div className="w-20 text-right">
          <ChangeBadge pct={data?.changePercent ?? null} />
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100 font-sans">
      <main className="flex-1 px-4 md:px-8 py-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase">市場總覽</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                Market Summary · TW + US Watchlists
              </p>
            </div>
          </div>
        </div>

        {/* Two-column summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TW column */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Landmark size={16} className="text-emerald-400" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-100">台灣市場</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">TWSE</span>
              </div>
              <Link
                href="/tw"
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-400/80 hover:text-emerald-300 transition-colors"
              >
                完整終端 <ArrowRight size={12} />
              </Link>
            </header>
            <div className="py-2">
              {TW_TOP.map((item) => (
                <TWRow key={item.symbol} item={item} />
              ))}
            </div>
          </section>

          {/* US column */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm overflow-hidden">
            <header className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-blue-400" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-100">國際市場</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">NASDAQ / NYSE</span>
              </div>
              <Link
                href="/us"
                className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-blue-400/80 hover:text-blue-300 transition-colors"
              >
                完整終端 <ArrowRight size={12} />
              </Link>
            </header>
            <div className="py-2">
              {US_TOP.map((item) => (
                <USRow key={item.symbol} item={item} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
