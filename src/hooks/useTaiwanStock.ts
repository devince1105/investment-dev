'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { StockQuote } from '@/types/stock';

const fetcher = async (url: string): Promise<StockQuote> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

interface UseTaiwanStockOptions {
  refreshInterval?: number;
  staggerIndex?: number;
}

export function useTaiwanStock(symbol: string, options: UseTaiwanStockOptions = {}) {
  const { refreshInterval = 60_000, staggerIndex = 0 } = options;
  const [isReady, setIsReady] = useState(staggerIndex === 0);

  useEffect(() => {
    if (staggerIndex > 0) {
      const timer = setTimeout(() => setIsReady(true), staggerIndex * 300);
      return () => clearTimeout(timer);
    }
  }, [staggerIndex]);

  const { data, error, isLoading, isValidating, mutate } = useSWR<StockQuote>(
    (symbol && isReady) ? `/api/stock/tw/${symbol}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Retry with exponential backoff
      onErrorRetry: (err: any, _key, _config, revalidate, { retryCount }) => {
        if (err.status === 404 || err.status === 500) return;
        if (retryCount >= 5) return;
        const delay = err.status === 429 
          ? Math.pow(2, retryCount) * 2000 + Math.random() * 1000 
          : Math.pow(2, retryCount) * 1000;
        setTimeout(() => revalidate({ retryCount }), delay);
      },
    }
  );

  return {
    data,
    error,
    isLoading: isLoading || (!!symbol && !isReady && !data),
    isValidating,
    refresh: mutate,
  };
}

/** Batch hook — fetches multiple symbols, each with independent SWR keys */
export function useTaiwanStocks(symbols: string[], options: UseTaiwanStockOptions = {}) {
  // We need multiple SWR calls; since hooks can't be called in loops
  // we handle this by calling individual hooks inside a compound component.
  // Export the individual hook for usage per card.
  return symbols.map((s) => s); // used externally with useTaiwanStock per symbol
}
