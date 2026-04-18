'use client';

import useSWR from 'swr';
import { StockQuote } from '@/types/stock';

const fetcher = async (url: string): Promise<StockQuote> => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
};

interface UseUSStockOptions {
  refreshInterval?: number;
}

export function useUSStock(symbol: string, options: UseUSStockOptions = {}) {
  const { refreshInterval = 60_000 } = options;

  // Encode the symbol for safe use as a URL path segment. encodeURIComponent
  // leaves '.' alone, but a literal "BRK.B" in the path can confuse routers
  // that treat ".B" as a file extension, so we manually escape dots too.
  const encoded = symbol ? encodeURIComponent(symbol).replace(/\./g, '%2E') : '';

  const { data, error, isLoading, isValidating, mutate } = useSWR<StockQuote>(
    symbol ? `/api/stock/us/${encoded}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
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
