'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ChevronLeft, ChevronRight, List, X } from 'lucide-react';
import { StockQuote, US_WATCHLIST, WATCHLIST, WatchlistItem, isUSSymbol } from '@/types/stock';

const fetcher = async (url: string): Promise<StockQuote> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

interface StockListSidebarProps {
  currentSymbol: string;
}

interface WatchlistRowProps {
  item: WatchlistItem;
  marketLabel: string;
  apiPrefix: 'us' | 'tw';
  isActive: boolean;
}

function WatchlistRow({ item, marketLabel, apiPrefix, isActive }: WatchlistRowProps) {
  // Encode for US symbols that contain dots (e.g. BRK.B)
  const encoded = apiPrefix === 'us'
    ? encodeURIComponent(item.symbol).replace(/\./g, '%2E')
    : item.symbol;

  const { data } = useSWR<StockQuote>(
    `/api/stock/${apiPrefix}/${encoded}`,
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: false,
      dedupingInterval: 10_000,
    }
  );

  const price = data?.lastPrice;
  const changePct = data?.changePercent;
  const isUp = typeof changePct === 'number' && changePct > 0;
  const isDown = typeof changePct === 'number' && changePct < 0;
  const changeColor = isUp ? 'text-rose-500' : isDown ? 'text-emerald-500' : 'text-slate-500';

  return (
    <Link
      href={`/stock/${item.symbol}`}
      className={`block relative group transition-all border-l-2 ${
        isActive
          ? 'bg-blue-600/15 border-l-blue-500'
          : 'border-l-transparent hover:bg-slate-800/40 hover:border-l-slate-700'
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: symbol + name + market */}
        <div className="flex flex-col min-w-0">
          <span className={`text-sm font-black tracking-wider truncate ${
            isActive ? 'text-blue-400' : 'text-slate-100 group-hover:text-slate-50'
          }`}>
            {item.symbol}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
            {item.name !== item.symbol ? item.name : marketLabel}
          </span>
        </div>

        {/* Right: price + change % */}
        <div className="flex flex-col items-end ml-2 shrink-0">
          <span className="text-sm font-black font-mono tracking-tight text-slate-100">
            {typeof price === 'number' ? price.toFixed(2) : '--'}
          </span>
          <span className={`text-[10px] font-black font-mono tracking-tight ${changeColor}`}>
            {typeof changePct === 'number'
              ? `${isUp ? '+' : ''}${changePct.toFixed(2)}%`
              : '--'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function StockListSidebar({ currentSymbol }: StockListSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isUS = isUSSymbol(currentSymbol);
  const watchlist = isUS ? US_WATCHLIST : WATCHLIST;
  const marketLabel = isUS ? 'NASDAQ' : 'TWSE';
  const apiPrefix: 'us' | 'tw' = isUS ? 'us' : 'tw';

  return (
    <>
      {/* Mobile: floating toggle button (only rendered on small screens) */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 p-3 rounded-full bg-blue-600/90 text-white shadow-2xl border border-blue-500/50"
        aria-label="開啟自選股清單"
      >
        <List size={18} />
      </button>

      {/* Mobile: overlay backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          border-r border-slate-800 bg-[#0f172a]/60 backdrop-blur-xl shrink-0
          flex flex-col scrollbar-hide transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${isMobileOpen
            ? 'fixed inset-y-0 left-0 w-72 z-50 translate-x-0'
            : 'fixed inset-y-0 left-0 w-72 z-50 -translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-12' : 'md:w-60'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-3 py-3 shrink-0">
          {!isCollapsed && (
            <span className="text-xs font-black tracking-widest text-slate-400 uppercase">
              自選股清單
            </span>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            className={`hidden md:flex items-center justify-center p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors ${
              isCollapsed ? 'mx-auto' : ''
            }`}
            aria-label={isCollapsed ? '展開清單' : '收合清單'}
            title={isCollapsed ? '展開清單' : '收合清單'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded hover:bg-slate-800 text-slate-400"
            aria-label="關閉清單"
          >
            <X size={14} />
          </button>
        </div>

        {/* List body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isCollapsed ? (
            // Collapsed desktop: render symbol-only chips, each linking through
            <ul className="py-2 space-y-1">
              {watchlist.map((item) => {
                const active = item.symbol === currentSymbol;
                return (
                  <li key={item.symbol}>
                    <Link
                      href={`/stock/${item.symbol}`}
                      title={item.name}
                      className={`flex items-center justify-center mx-1 py-1.5 rounded text-[10px] font-black tracking-tight transition-colors ${
                        active
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {item.symbol.length > 4 ? item.symbol.slice(0, 4) : item.symbol}
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul onClick={() => setIsMobileOpen(false)}>
              {watchlist.map((item) => (
                <li key={item.symbol}>
                  <WatchlistRow
                    item={item}
                    marketLabel={marketLabel}
                    apiPrefix={apiPrefix}
                    isActive={item.symbol === currentSymbol}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer market indicator */}
        {!isCollapsed && (
          <div className="border-t border-slate-800 px-4 py-2.5 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider text-slate-500 uppercase">
                {marketLabel}
              </span>
              <span className="text-[10px] font-black tracking-wider text-slate-600 uppercase">
                {watchlist.length} 檔
              </span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
