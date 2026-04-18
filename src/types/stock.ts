export interface StockQuote {
  symbol: string;
  name: string;
  lastPrice: number | null;
  openPrice: number | null;
  highPrice: number | null;
  lowPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  volume: number | null;
  logo?: string | null;
  /** e.g. "NYSE", "NASDAQ", "NYSEARCA" — returned by the US API route. */
  exchange?: string | null;
  marketCap?: number | null;
  timestamp: string;
  isMock: boolean;
  error?: string;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
}

export const WATCHLIST: WatchlistItem[] = [
  { symbol: '2330', name: '台積電' },
  { symbol: '2317', name: '鴻海' },
  { symbol: '2454', name: '聯發科' },
  { symbol: '2382', name: '廣達' },
  { symbol: '2303', name: '聯電' },
  { symbol: '2308', name: '台達電' },
  { symbol: '3711', name: '日月光投控' },
  { symbol: '2357', name: '華碩' },
  { symbol: '3231', name: '緯創' },
  { symbol: '6669', name: '緯穎' },
  { symbol: '2412', name: '中華電' },
  { symbol: '2881', name: '富邦金' },
  { symbol: '2882', name: '國泰金' },
  { symbol: '2002', name: '中鋼' },
  { symbol: '2603', name: '長榮' },
  { symbol: '0050', name: '元大台灣 50' },
  { symbol: '0056', name: '元大高股息' },
  { symbol: '00878', name: '國泰永續高股息' },
];
