'use client';

import useSWR from 'swr';
import { StockQuote } from '@/types/stock';

const fetcher = async (url: string): Promise<StockQuote> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

interface UseTaiwanStockOptions {
  refreshInterval?: number; // ms, default 60000
}

export function useTaiwanStock(symbol: string, options: UseTaiwanStockOptions = {}) {
  const { refreshInterval = 60_000 } = options;

  const { data, error, isLoading, isValidating, mutate } = useSWR<StockQuote>(
    symbol ? `/api/stock/tw/${symbol}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      // Retry with exponential backoff (max 3 times)
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), Math.pow(2, retryCount) * 1000);
      },
    }
  );

  return {
    data,
    error,
    isLoading,
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
