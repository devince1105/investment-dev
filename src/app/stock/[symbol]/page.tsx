'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  RefreshCw,
  Calendar
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  Cell,
  Line,
  ReferenceDot,
  Text
} from 'recharts';
import useSWR from 'swr';
import { useTaiwanStock } from '@/hooks/useTaiwanStock';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type Period = '1H' | '1D' | '1W' | '1M';

// Custom Candlestick Component
const Candlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  if (!payload || payload.open === undefined || payload.close === undefined) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? '#f43f5e' : '#10b981';
  
  // Recharts Bar with dataKey={[low, high]} gives us:
  // y: pixel coordinate of 'high'
  // height: pixel distance between 'high' and 'low'
  const ratio = height / Math.max(high - low, 0.001);
  const bodyTop = y + (high - Math.max(open, close)) * ratio;
  const bodyHeight = Math.max(Math.abs(open - close) * ratio, 1);
  const wickX = x + width / 2;

  return (
    <g>
      {/* High-Low Wick */}
      <line x1={wickX} y1={y} x2={wickX} y2={y + height} stroke={color} strokeWidth={1} />
      {/* Open-Close Body */}
      <rect 
        x={x + width * 0.15} 
        y={bodyTop} 
        width={width * 0.7} 
        height={bodyHeight} 
        fill={color} 
      />
    </g>
  );
};

// Smart volume formatter: Lots vs Shares
const formatVolume = (vol: number) => {
  if (vol === undefined) return '--';
  const rounded = Math.round(vol);
  if (rounded >= 1000) return `${(rounded/1000).toFixed(1)}張`;
  return `${rounded}股`;
};

// Professional Glassmorphism Tooltip
const YahooTooltip = ({ active, payload, period }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  const isUp = d.close >= d.open;
  const colorClass = isUp ? 'text-rose-500' : 'text-emerald-500';

  const dateObj = new Date(d.time);
  const displayLabel = period === '1H' 
    ? dateObj.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false }) 
    : d.time?.split('T')[0];

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 p-2.5 rounded-lg shadow-2xl min-w-[150px] space-y-2 pointer-events-none ring-1 ring-white/10">
      <div className="flex justify-between items-center border-b border-white/5 pb-1 gap-4">
        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{displayLabel}</span>
        <span className={`text-xs font-black ${colorClass}`}>{isUp ? '▲' : '▼'}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-bold">
        <span className="text-slate-500">開盤</span><span className="text-slate-200 text-right">{d.open?.toFixed(2)}</span>
        <span className="text-slate-500">收盤</span><span className={`${colorClass} text-right`}>{d.close?.toFixed(2)}</span>
        <span className="text-slate-500">最高</span><span className="text-rose-500 text-right">{d.high?.toFixed(2)}</span>
        <span className="text-slate-500">最低</span><span className="text-emerald-500 text-right">{d.low?.toFixed(2)}</span>
        <span className="text-slate-400">成交</span><span className="text-slate-100 text-right font-sans">{formatVolume(d.volume)}</span>
      </div>
      <div className="pt-1 border-t border-white/5 space-y-0.5">
         <div className="flex justify-between text-xs font-black uppercase"><span className="text-blue-500">MA5</span><span className="text-blue-400">{d.ma5 || '--'}</span></div>
         <div className="flex justify-between text-xs font-black uppercase"><span className="text-purple-500">MA10</span><span className="text-purple-400">{d.ma10 || '--'}</span></div>
         <div className="flex justify-between text-xs font-black uppercase"><span className="text-orange-500">MA20</span><span className="text-orange-400">{d.ma20 || '--'}</span></div>
         <div className="flex justify-between text-xs font-black uppercase"><span className="text-yellow-500">MA60</span><span className="text-yellow-400">{d.ma60 || '--'}</span></div>
         <div className="flex justify-between text-xs font-black uppercase"><span className="text-slate-500">MA250</span><span className="text-slate-400">{d.ma250 || '--'}</span></div>
      </div>
    </div>
  );
};

export default function StockDetailPage() {
  const { symbol } = useParams() as { symbol: string };
  
  useEffect(() => {
    if (symbol) {
      document.title = `${symbol} | NEXUS Terminal`;
    }
  }, [symbol]);

  const [period, setPeriod] = useState<Period>('1D');
  const [hoverData, setHoverData] = useState<any>(null);
  
  const isUS = /^[A-Z.]+$/.test(symbol) && !/^\d+$/.test(symbol);
  const marketPrefix = isUS ? 'us' : 'tw';
  
  const { data: quote, isLoading: isQuoteLoading } = useSWR(`/api/stock/${marketPrefix}/${symbol}`, fetcher, { refreshInterval: 60_000 });
  const { data: candleData, isLoading: isCandleLoading } = useSWR(
    `/api/stock/${marketPrefix}/${symbol}/candles?period=${period}`, 
    fetcher
  );

  const chartData = useMemo(() => {
    if (!candleData?.chartData || !Array.isArray(candleData.chartData)) return [];
    
    let raw = [...candleData.chartData].sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // ── Aggregation Logic ──
    const aggregate = (data: any[], mode: 'W' | 'M' | '5M') => {
      const results: any[] = [];
      let currentGroup: any[] = [];
      let currentKey = '';

      data.forEach((d) => {
        const date = new Date(d.time);
        if (isNaN(date.getTime())) return;
        
        let key = '';
        if (mode === 'M') {
          key = `${date.getFullYear()}-${date.getMonth()}`;
        } else if (mode === 'W') {
          const tempDate = new Date(date.getTime());
          tempDate.setHours(0, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
          const week1 = new Date(tempDate.getFullYear(), 0, 4);
          const weekNum = 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
          key = `${tempDate.getFullYear()}-W${weekNum}`;
        } else if (mode === '5M') {
          // Group by 5 minute intervals
          const day = date.toISOString().split('T')[0];
          const groupIdx = Math.floor((date.getHours() * 60 + date.getMinutes()) / 5);
          key = `${day}-G${groupIdx}`;
        }

        if (key !== currentKey && currentGroup.length > 0) {
          results.push(finalizeGroup(currentGroup));
          currentGroup = [];
        }
        currentKey = key;
        currentGroup.push(d);
      });
      if (currentGroup.length > 0) results.push(finalizeGroup(currentGroup));
      return results;
    };

    const finalizeGroup = (group: any[]) => ({
      time: group[group.length - 1].time,
      open: group[0].open,
      close: group[group.length - 1].close,
      high: Math.max(...group.map(g => g.high)),
      low: Math.min(...group.map(g => g.low)),
      volume: group.reduce((sum, g) => sum + (g.volume || 0), 0)
    });

    if (period === '1H' && !isUS) raw = aggregate(raw, '5M');
    if (period === '1W') raw = aggregate(raw, 'W');
    if (period === '1M') raw = aggregate(raw, 'M');
    
    // Density: 1D = 120, 1W = 120, 1M = all
    if (period === '1D' || period === '1W') raw = raw.slice(-120);

    // ── Indicators Calc ──
    const getMA = (data: any[], count: number, key: string = 'close') => {
      return data.map((_, idx) => {
        if (idx < count - 1) return null;
        const sum = data.slice(idx - count + 1, idx + 1).reduce((acc, curr) => acc + (curr[key] || 0), 0);
        return parseFloat((sum / count).toFixed(2));
      });
    };

    const ma5 = getMA(raw, 5);
    const ma10 = getMA(raw, 10);
    const ma20 = getMA(raw, 20);
    const ma60 = getMA(raw, 60);
    const ma250 = getMA(raw, 250); // Yearly Line
    const mv5 = getMA(raw, 5, 'volume');
    const mv20 = getMA(raw, 20, 'volume');

    return raw.map((c: any, i: number) => {
      const dateObj = new Date(c.time);
      let displayTime = '';
      if (period === '1H') displayTime = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      else if (period === '1M') displayTime = `${dateObj.getFullYear()}/${dateObj.getMonth() + 1}`;
      else displayTime = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
      return { 
        ...c, displayTime, 
        range: [c.low, c.high],
        ma5: ma5[i], ma10: ma10[i], ma20: ma20[i], ma60: ma60[i], ma250: ma250[i],
        mv5: mv5[i], mv20: mv20[i]
      };
    });
  }, [candleData, period]);

  const maxPriceData = useMemo(() => {
    if (!chartData.length) return null;
    return chartData.reduce((prev, curr) => (prev.high > curr.high) ? prev : curr);
  }, [chartData]);

  const activeData = hoverData || (chartData.length > 0 ? chartData[chartData.length - 1] : null);
  const changeVal = activeData ? (activeData.close - activeData.open).toFixed(2) : '0';
  const changeColor = parseFloat(changeVal) > 0 ? 'text-rose-500' : (parseFloat(changeVal) < 0 ? 'text-emerald-500' : 'text-slate-400');

  if (isQuoteLoading) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><RefreshCw className="animate-spin text-slate-700" size={32} /></div>;

  return (
    <div className="flex flex-col min-h-screen font-sans tracking-tight bg-transparent text-slate-100 italic-none">
      {/* Header Info Bar */}
      <div className="px-4 md:px-6 pt-4 space-y-2 border-b border-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <h1 className="text-2xl font-black">{quote?.name || symbol} ({symbol})</h1>
             <div className="text-xs text-slate-500 uppercase tracking-widest font-black">資料時間：2026/04/17</div>
          </div>
          <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded">
            {[ {id:'1H',l:'5分'}, {id:'1D',l:'日'}, {id:'1W',l:'週'}, {id:'1M',l:'月'} ].map((p) => (
              <button key={p.id} onClick={() => setPeriod(p.id as Period)} className={`px-4 py-1 text-xs font-black transition-all ${period === p.id ? 'bg-blue-600/20 text-blue-400 rounded-[2px]' : 'text-slate-500 hover:text-slate-300'}`}>{p.l}</button>
            ))}
          </div>
        </div>

        {/* Dynamic Price Bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono">
          <div className="text-slate-400 font-sans font-bold tracking-wider">
            {activeData ? (
              period === '1H' 
                ? new Date(activeData.time).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
                : activeData.time?.split('T')[0]
            ) : '--'}
          </div>
          <div className="flex gap-1">開 <span className="text-slate-100">{activeData?.open?.toFixed(2) || '--'}</span></div>
          <div className="flex gap-1">高 <span className="text-rose-500">{activeData?.high?.toFixed(2) || '--'}</span></div>
          <div className="flex gap-1">低 <span className="text-emerald-500">{activeData?.low?.toFixed(2) || '--'}</span></div>
          <div className="flex gap-1">收 <span className={changeColor}>{activeData?.close?.toFixed(2) || '--'}</span></div>
          <div className="flex gap-1 text-slate-400">成交量 <span className="text-slate-100 font-sans font-bold">{formatVolume(activeData?.volume)}</span></div>
        </div>

        {/* MA Legend with Yearly Line */}
        <div className="flex flex-wrap gap-4 pt-1">
          {[ 
            {l:'MA5',v:activeData?.ma5,c:'#3b82f6'}, 
            {l:'MA10',v:activeData?.ma10,c:'#a855f7'}, 
            {l:'MA20',v:activeData?.ma20,c:'#f97316'}, 
            {l:'MA60',v:activeData?.ma60,c:'#e9b308'},
            {l:'MA250',v:activeData?.ma250,c:'#64748b'} 
          ].map((ma,i)=>(
            <div key={i} className="flex items-center gap-1.5 text-xs font-bold">
              <div className="w-2.5 h-2.5 rounded-sm border" style={{ backgroundColor: `${ma.c}22`, borderColor: ma.c }}></div>
              <span className="text-slate-400">{ma.l}</span>
              <span style={{ color: ma.c }}>{ma.v ? ma.v.toFixed(2) : '--'}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 md:px-6 py-4 space-y-4">
        <div className="space-y-4 p-8 bg-slate-950/20 border border-slate-900 rounded-2xl relative overflow-hidden shadow-2xl">
          {isCandleLoading ? (
            <div className="h-[520px] w-full flex items-center justify-center backdrop-blur-sm"><RefreshCw className="animate-spin text-blue-500" size={32} /></div>
          ) : chartData.length > 0 ? (
            <>
              <div className="h-[380px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} syncId="yahooSync" onMouseMove={(e: any) => e && e.activePayload && setHoverData(e.activePayload[0].payload)} onMouseLeave={() => setHoverData(null)}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="1 1" stroke="#1e293b" vertical opacity={0.3} />
                    <XAxis dataKey="displayTime" hide />
                    <YAxis yAxisId="price" domain={['auto', 'auto']} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                    <Tooltip cursor={{ stroke: 'rgba(71, 85, 105, 0.5)', strokeWidth: 1 }} content={<YahooTooltip period={period} />} isAnimationActive={false} />
                    
                    {isUS ? (
                      <Area
                        yAxisId="price"
                        type="monotone"
                        dataKey="close"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#colorPrice)"
                        isAnimationActive={false}
                      />
                    ) : (
                      <Bar 
                        yAxisId="price" 
                        dataKey={(d) => [d.low, d.high]} 
                        shape={<Candlestick />} 
                        isAnimationActive={false}
                      />
                    )}

                    <Line yAxisId="price" type="monotone" dataKey="ma5" stroke="#3b82f6" dot={false} strokeWidth={1} isAnimationActive={false} />
                    <Line yAxisId="price" type="monotone" dataKey="ma10" stroke="#a855f7" dot={false} strokeWidth={1} isAnimationActive={false} />
                    <Line yAxisId="price" type="monotone" dataKey="ma20" stroke="#f97316" dot={false} strokeWidth={1} isAnimationActive={false} />
                    <Line yAxisId="price" type="monotone" dataKey="ma60" stroke="#eab308" dot={false} strokeWidth={1} isAnimationActive={false} />
                    <Line yAxisId="price" type="monotone" dataKey="ma250" stroke="#64748b" dot={false} strokeWidth={1} isAnimationActive={false} />

                    {maxPriceData && (
                      <ReferenceDot yAxisId="price" x={maxPriceData.displayTime} y={maxPriceData.high} r={0} isFront>
                         <Text x={0} y={-15} fill="#f43f5e" fontSize={12} fontWeight="bold" textAnchor="middle">{maxPriceData.high}</Text>
                      </ReferenceDot>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[140px] w-full mt-4 border-t border-slate-900 pt-6">
                <div className="flex items-center gap-4 text-xs font-bold mb-2 ml-10">
                   <div className="flex gap-1">成交量 <span className="text-slate-100 font-sans">{activeData?.volume?.toLocaleString() || '--'}</span></div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} syncId="yahooSync">
                    <CartesianGrid strokeDasharray="1 1" stroke="#1e293b" vertical opacity={0.3} />
                    <XAxis dataKey="displayTime" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} minTickGap={60} />
                    <YAxis orientation="right" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickCount={3} />
                    
                    <Bar dataKey="volume">
                      {chartData.map((e, idx) => (
                        <Cell key={idx} fill={e.close >= (e.open || e.close) ? 'rgba(244, 63, 94, 0.5)' : 'rgba(16, 185, 129, 0.5)'} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="h-[520px] w-full flex flex-col items-center justify-center text-center">
              <BarChart3 className="text-slate-800 mb-6 opacity-40" size={64} strokeWidth={1} />
              <div className="text-sm font-black text-slate-400 mb-2 uppercase tracking-widest">無行情數據</div>
              <div className="text-xs text-slate-600 font-bold max-w-xs leading-relaxed">
                {candleData?.error ? `伺服器回報: ${candleData.error}` : (candleData?.status === 'no_data' ? '當前為週末休市或非交易時段' : '請確認網路連線或稍後再試')}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
