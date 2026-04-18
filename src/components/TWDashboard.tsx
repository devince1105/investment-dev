'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Shield,
  Activity,
  PlusCircle,
  X,
  LayoutGrid,
  BarChart2,
  Wallet,
  Landmark,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

import useSWR, { useSWRConfig } from 'swr';
import StockCard from '@/components/StockCard';
import { useTaiwanStock } from '@/hooks/useTaiwanStock';
import { WATCHLIST, WatchlistItem } from '@/types/stock';

/* ────────────────────────────────────────────────────────── */
/*  Sortable Wrapper Component                                */
/* ────────────────────────────────────────────────────────── */
function SortableStockItem({ 
  item, 
  onRemove,
  onDataUpdate
}: { 
  item: WatchlistItem; 
  onRemove: (id: string) => void;
  onDataUpdate?: (data: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.symbol });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/card touch-none">
      {/* Drag handle (top area) */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute inset-x-0 h-12 top-0 cursor-grab active:cursor-grabbing z-20" 
        title="按住拖動排序"
      />
      
      {/* Clickable link area */}
      <Link href={`/stock/${item.symbol}`} className="block">
        <div className="hover:ring-2 hover:ring-blue-500/20 rounded-lg transition-all active:scale-[0.98]">
          <StockCard 
            symbol={item.symbol} 
            name={item.name} 
            onDataUpdate={onDataUpdate}
            marketType="TW"
          />
        </div>
      </Link>

      <button
        onClick={() => onRemove(item.symbol)}
        className="absolute top-2 left-2 p-1 rounded border border-slate-800 bg-slate-900 text-slate-600 opacity-0 group-hover/card:opacity-100 hover:text-rose-400 hover:border-rose-900 transition-all z-30"
        title={`移除 ${item.name}`}
      >
        <X size={10} />
      </button>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  Main Dashboard                                           */
/* ────────────────────────────────────────────────────────── */
export default function TWDashboard() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>(WATCHLIST);
  const [addInput, setAddInput] = useState('');
  const [addNameInput, setAddNameInput] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortBy, setSortBy] = useState<'manual' | 'price' | 'change' | 'cap'>('manual');
  
  // Use a map to store latest sortable data for reactive rendering
  const [dataSnapshot, setDataSnapshot] = useState<Record<string, any>>({});

  // Sorting logic based on the snapshot
  const sortedWatchlist = useMemo(() => {
    if (sortBy === 'manual') return watchlist;
    
    return [...watchlist].sort((a, b) => {
      const snapA = dataSnapshot[a.symbol];
      const snapB = dataSnapshot[b.symbol];
      
      const getVal = (snap: any, field: string) => {
        if (!snap) return -1000000;
        if (field === 'price') return snap.lastPrice ?? 0;
        if (field === 'change') return snap.changePercent ?? -100;
        if (field === 'cap') return snap.marketCap ?? 0;
        return 0;
      };

      const valA = getVal(snapA, sortBy);
      const valB = getVal(snapB, sortBy);
      return valB - valA; // Descending
    });
  }, [watchlist, sortBy, dataSnapshot]);

  // Handler for cards to report data back for sorting
  const handleDataUpdate = (symbol: string, data: any) => {
    setDataSnapshot(prev => {
      // Small optimization: only update if changed significantly
      if (prev[symbol]?.lastPrice === data?.lastPrice && 
          prev[symbol]?.changePercent === data?.changePercent) return prev;
      return { ...prev, [symbol]: data };
    });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Use the first stock as an API health check
  const { data: healthCheck } = useTaiwanStock(watchlist[0]?.symbol, { 
    refreshInterval: 60_000 
  });
  
  const isApiConnected = !!(healthCheck && healthCheck.lastPrice);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#020617]" />;
  }

  const handleAddStock = () => {
    const sym = addInput.trim();
    const nm = addNameInput.trim() || sym;
    if (!sym || watchlist.some((w) => w.symbol === sym)) {
      setAddInput('');
      setAddNameInput('');
      setShowAddForm(false);
      return;
    }
    setWatchlist((prev) => [...prev, { symbol: sym, name: nm }]);
    setAddInput('');
    setAddNameInput('');
    setShowAddForm(false);
  };

  const handleRemoveStock = (symbol: string) => {
    setWatchlist((prev) => prev.filter((w) => w.symbol !== symbol));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWatchlist((items) => {
        const oldIndex = items.findIndex((i) => i.symbol === active.id);
        const newIndex = items.findIndex((i) => i.symbol === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="flex flex-col font-sans tracking-tight bg-[#020617] text-slate-100">
      {/* ── Consolidated Header Bar ── */}
      <div className="border-b border-slate-800 px-4 md:px-6 py-4 font-bold tracking-tight">
        <div className="flex flex-row items-center justify-between gap-4">
          {/* Brand & Title (Left) */}
          <div className="flex items-center gap-6">
            <div className="p-3.5 rounded border border-slate-800 bg-emerald-500/10 text-emerald-500 shadow-inner">
              <Landmark size={24} />
            </div>
            <div>
              <div className="text-xl font-black text-slate-100 uppercase tracking-tighter">
                台股權值股即時監控
              </div>
              <div className="text-[12px] font-black tracking-[0.15em] text-slate-500 uppercase mt-1">
                TW EQUITY MONITORING CORE · INDEX_WEIGHTED
              </div>
            </div>
          </div>

          {/* Controls & Status (Right) */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Sorting Tabs Inside Header */}
            <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded border border-slate-800/80">
              {[
                { id: 'manual', label: '自定義', icon: LayoutGrid },
                { id: 'price', label: '股價', icon: TrendingUp },
                { id: 'change', label: '漲跌', icon: BarChart2 },
                { id: 'cap', label: '市值', icon: Wallet },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-xs font-black uppercase tracking-widest ${
                    sortBy === tab.id 
                      ? 'bg-blue-600/90 text-white shadow-lg' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <tab.icon size={12} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Connection Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 shadow-inner">
              <div className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`} />
              <span className="text-xs font-black tracking-widest text-slate-500 uppercase">
                {isApiConnected ? '數據連線正常' : '診斷中...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 px-4 md:px-6 py-8 space-y-8">
        {/* Info banner - Only show if API not yet successful */}
        {!isApiConnected && (
          <div className="p-4 rounded border border-amber-900/40 bg-amber-950/20 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
            <Shield size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-400/80 font-medium leading-relaxed">
              <span className="font-black text-amber-400">注意：</span>
              請先於 <code className="bg-amber-900/30 px-1 py-0.5 rounded text-xs font-mono">.env.local</code> 填入您的{' '}
              <code className="bg-amber-900/30 px-1 py-0.5 rounded text-xs font-mono">FUGLE_API_KEY</code>，
              否則卡片將顯示 API 錯誤。取得 Key 請至{' '}
              <a
                href="https://developer.fugle.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-amber-300 hover:text-amber-200 transition-colors"
              >
                developer.fugle.tw
              </a>
              。
            </div>
          </div>
        )}

        {/* Stock cards grid — heavy-duty tuning for 2560 screens with potential scaling */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToWindowEdges]}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4k:grid-cols-8 gap-6 auto-rows-fr">
            <SortableContext
              items={sortedWatchlist.map(i => i.symbol)}
              strategy={rectSortingStrategy}
              disabled={sortBy !== 'manual'}
            >
              {sortedWatchlist.map((item) => (
                <SortableStockItem 
                  key={item.symbol} 
                  item={item} 
                  onRemove={handleRemoveStock} 
                  onDataUpdate={(data) => handleDataUpdate(item.symbol, data)}
                />
              ))}
            </SortableContext>

            {/* Add stock card - Keep outside SortableContext to prevent dragging it */}
            {showAddForm ? (
              <div className="flex flex-col gap-3 p-5 rounded border border-slate-800 bg-[#0f172a]">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                  新增自選股
                </div>
                <input
                  type="text"
                  placeholder="股票代碼 (e.g. 2454)"
                  value={addInput}
                  onChange={(e) => setAddInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                  className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors font-mono tracking-widest"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="股票名稱 (選填)"
                  value={addNameInput}
                  onChange={(e) => setAddNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStock()}
                  className="w-full px-3 py-2 rounded border border-slate-700 bg-slate-800 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddStock}
                    className="flex-1 py-2 rounded border border-blue-800 bg-blue-900/30 text-blue-400 text-xs font-black uppercase tracking-wider hover:bg-blue-900/50 transition-colors"
                  >
                    新增
                  </button>
                  <button
                    onClick={() => { setShowAddForm(false); setAddInput(''); setAddNameInput(''); }}
                    className="px-4 py-2 rounded border border-slate-700 text-slate-500 text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded border border-dashed border-slate-800 text-slate-700 hover:border-slate-600 hover:text-slate-500 hover:bg-slate-900/20 transition-all min-h-[200px]"
              >
                <PlusCircle size={24} strokeWidth={1.5} />
                <span className="text-xs font-black uppercase tracking-widest">
                  新增自選股
                </span>
              </button>
            )}
          </div>
        </DndContext>
      </main>

    </div>
  );
}
