'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  BarChart2,
  AlertTriangle,
  X,
} from 'lucide-react';
import useSWR from 'swr';
import { useTaiwanStock } from '@/hooks/useTaiwanStock';
import { useUSStock } from '@/hooks/useUSStock';

interface StockCardProps {
  symbol: string;
  name: string;
  marketType?: 'TW' | 'US';
  onDataUpdate?: (data: any) => void;
  onRemove?: (symbol: string) => void;
}

function fmt(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return '--';
  return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtCap(value: number | null, marketType: 'TW' | 'US'): string {
  if (value === null || value === undefined || value === 0) return '--';
  
  if (marketType === 'TW') {
    if (value >= 1_000_000_000_000) return `${(value / 1_000_000_000_000).toFixed(2)}兆`;
    if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(2)}億`;
    return `${(value / 10_000).toFixed(0)}萬`;
  } else {
    let valInM = value;
    if (valInM > 10_000_000) valInM = valInM / 1_000_000;
    if (valInM >= 1_000_000) return `$${(valInM / 1_000_000).toFixed(2)}T`;
    if (valInM >= 1_000) return `$${(valInM / 1_000).toFixed(2)}B`;
    return `$${valInM.toFixed(1)}M`;
  }
}

export default function StockCard({ symbol, name, marketType = 'TW', onDataUpdate, onRemove }: StockCardProps) {
  const tw = useTaiwanStock(marketType === 'TW' ? symbol : '', { refreshInterval: 60_000 });
  const us = useUSStock(marketType === 'US' ? symbol : '', { refreshInterval: 60_000 });
  
  const { data, error, isLoading, isValidating, refresh } = marketType === 'TW' ? tw : us;
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    if (data && onDataUpdate) {
      onDataUpdate(data);
    }
  }, [data, onDataUpdate]);

  const changePercent = data?.changePercent ?? 0;
  const isUp = changePercent > 0;
  const isDown = changePercent < 0;
  const isFlat = changePercent === 0;

  const upColor = marketType === 'TW' ? '#f43f5e' : '#10b981';
  const downColor = marketType === 'TW' ? '#10b981' : '#f43f5e';
  const accentColor = isUp ? upColor : isDown ? downColor : '#94a3b8';

  const accentBg = isUp ? `${accentColor}15` : isDown ? `${accentColor}15` : 'rgba(148,163,184,0.06)';

  // Prefer the exchange reported by the API (ground truth from SerpAPI) so
  // cards like BRK.B correctly show NYSE even though it has a dot in its
  // ticker. Fall back to a local classification if the API hasn't answered
  // yet (initial render / error state).
  const getUSExchangeFallback = (sym: string) => {
    const s = sym.toUpperCase();
    if (['DIA', 'VOO', 'SPY', 'IWM'].includes(s)) return 'NYSEARCA';
    if (['QQQ'].includes(s)) return 'NASDAQ';
    if (['TSM', 'V', 'KO', 'MCD', 'DIS', 'BRK.B', 'JPM', 'UNH', 'HD', 'PG', 'JNJ', 'XOM', 'CVX', 'LLY', 'ABBV', 'WMT', 'MA'].includes(s)) return 'NYSE';
    return 'NASDAQ';
  };

  const usExchange = data?.exchange || getUSExchangeFallback(symbol);
  const exchangeDisplay = marketType === 'TW'
    ? 'TWSE'
    : `${usExchange} · USD`;

  return (
    <div
      className="relative flex flex-col p-5 rounded border transition-all duration-500 group hover:-translate-y-1 overflow-hidden"
      style={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px -12px ${accentColor}40`;
        (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}50`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 0 0 transparent';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#1e293b';
      }}
    >
      {/* Dynamic Background Orb */}
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)` }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className={`w-10 h-10 rounded flex items-center justify-center transition-all ${data?.logo && !imgError ? '' : 'bg-slate-900 border border-slate-800 p-2.5'}`} 
            style={{ color: accentColor }}
          >
            {data?.logo && !imgError ? (
              <img 
                src={data.logo} 
                alt={name} 
                className="w-8 h-8 object-contain" 
                onError={() => setImgError(true)}
              />
            ) : (
              <BarChart2 size={18} strokeWidth={2.5} />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5 flex-nowrap max-w-[180px] overflow-hidden">
              <span className="text-base font-black uppercase tracking-wider text-slate-100 shrink-0">{symbol}</span>
              {marketType === 'US' && data?.name && data.name !== symbol && (
                <span className="text-sm font-bold text-slate-400 truncate whitespace-nowrap">{data.name}</span>
              )}
              {marketType === 'TW' && (
                <span className="text-sm font-bold text-slate-400 truncate whitespace-nowrap">{name}</span>
              )}
            </div>
            <div className="text-xs font-bold tracking-[0.15em] uppercase text-slate-500 mt-1">
              {exchangeDisplay}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => refresh()} className="p-1.5 rounded border border-slate-800 text-slate-500 hover:text-slate-300 transition-all">
            <RefreshCw size={12} className={isValidating ? 'animate-spin' : ''} />
          </button>
          {onRemove && (
            <button onClick={() => onRemove(symbol)} className="p-1.5 rounded border border-slate-800 text-slate-500 hover:text-rose-400 transition-all">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton accentColor={accentColor} />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <>
          {/* Price Section */}
          <div className="flex items-end justify-between mb-5 relative z-10">
            <div>
              <div className="text-3xl font-black tabular-nums tracking-tighter" style={{ color: data?.lastPrice ? '#f8fafc' : '#475569' }}>
                {fmt(data?.lastPrice ?? null)}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 mb-1">
              <div className="flex items-center gap-1 font-black text-sm" style={{ color: accentColor }}>
                {isUp && <TrendingUp size={16} />}
                {isDown && <TrendingDown size={16} />}
                {isFlat && <Minus size={16} />}
                <span>{isUp ? '+' : ''}{fmt(changePercent)}%</span>
              </div>
              <div className="text-xs font-bold tabular-nums text-slate-500">
                {isUp ? '+' : ''}{fmt(data?.change ?? 0)}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-slate-800/50 relative z-10">
            <StatRow label="開盤" value={fmt(data?.openPrice ?? null)} />
            <StatRow label="最高" value={fmt(data?.highPrice ?? null)} highlight={upColor} />
            <StatRow label="最低" value={fmt(data?.lowPrice ?? null)} highlight={downColor} />
            <StatRow label="前收" value={fmt(data?.previousClose ?? null)} />
          </div>

          {/* Market Cap Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">總市值</span>
            <span className="text-sm font-black tabular-nums text-slate-400">
              {fmtCap(data?.marketCap ?? null, marketType)}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-black uppercase tracking-widest text-slate-600">{label}</span>
      <span className="text-[12px] font-black tabular-nums" style={{ color: highlight ?? '#94a3b8' }}>{value}</span>
    </div>
  );
}

function LoadingSkeleton({ accentColor }: { accentColor: string }) {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-2/3 rounded bg-slate-800/50" />
      <div className="h-28 w-full rounded bg-slate-900/40 border border-slate-800/20" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-4 rounded bg-slate-800/30" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: any }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <AlertTriangle size={24} className="text-amber-500/50" />
      <div className="text-xs font-black uppercase tracking-widest text-slate-600">資料載入延遲</div>
      <div className="text-xs text-slate-700 max-w-[160px] leading-relaxed">
        {error?.status === 404 ? '查無代碼' : '請確認網路連線'}
      </div>
    </div>
  );
}
