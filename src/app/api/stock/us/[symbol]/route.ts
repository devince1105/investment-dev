import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ─────────────────────────────────────────────────────────────
// Chinese display names
// ─────────────────────────────────────────────────────────────
const US_STOCK_NAMES_CN: Record<string, string> = {
  AAPL: '蘋果',
  MSFT: '微軟',
  GOOG: '谷歌 C',
  GOOGL: '谷歌 A',
  AMZN: '亞馬遜',
  TSLA: '特斯拉',
  NVDA: '輝達',
  META: '臉書',
  TSM: '台積電',
  NFLX: '網飛',
  'BRK.B': '波克夏',
  JPM: '摩根大通',
  V: 'Visa',
  MA: '萬事達卡',
  UNH: '聯合健康',
  HD: '家得寶',
  PG: '寶潔',
  JNJ: '強生',
  XOM: '艾克森美孚',
  CVX: '雪佛龍',
  MCD: '麥當勞',
  KO: '可口可樂',
  PEP: '百事可樂',
  COST: '好市多',
  WMT: '沃爾瑪',
  LLY: '禮來',
  ABBV: '艾伯維',
  AVGO: '博通',
  ADBE: '奧多比',
  CRM: '賽富時',
  ORCL: '甲骨文',
  AMD: '超微',
  QCOM: '高通',
  TXN: '德州儀器',
  INTC: '英特爾',
  MU: '美光',
  CSCO: '思科',
  AMAT: '應用材料',
  ASML: '艾司摩爾',
  ADP: '自動數據處理',
  PYPL: 'PayPal',
  NOW: 'ServiceNow',
  PANW: '帕羅奧圖網絡',
  SNOW: 'Snowflake',
  MSTR: '微策略',
  PLTR: '帕蘭提爾',
  SMCI: '美超微',
  COIN: 'Coinbase',
  SBUX: '星巴克',
  DIS: '迪士尼',
  DIA: '道瓊指數 ETF',
  SPY: '標普 500 ETF',
  QQQ: '納指 100 ETF',
  VOO: '先鋒標普 500',
  IWM: '羅素 2000 ETF',
  SQ: 'Block (Square)',
  SHOP: 'Shopify',
  NET: 'Cloudflare',
  CRWD: 'CrowdStrike',
  ARM: 'Arm',
  U: 'Unity',
  MDB: 'MongoDB',
  DDOG: 'Datadog',
  ZS: 'Zscaler',
};

// ─────────────────────────────────────────────────────────────
// Domain mapping for Clearbit logo API
// ─────────────────────────────────────────────────────────────
const US_COMPANY_DOMAINS: Record<string, string> = {
  AAPL: 'apple.com',
  MSFT: 'microsoft.com',
  GOOG: 'google.com',
  GOOGL: 'google.com',
  AMZN: 'amazon.com',
  TSLA: 'tesla.com',
  NVDA: 'nvidia.com',
  META: 'meta.com',
  TSM: 'tsmc.com',
  NFLX: 'netflix.com',
  JPM: 'jpmorganchase.com',
  V: 'visa.com',
  MA: 'mastercard.com',
  UNH: 'unitedhealthgroup.com',
  HD: 'homedepot.com',
  PG: 'pg.com',
  JNJ: 'jnj.com',
  XOM: 'exxonmobil.com',
  CVX: 'chevron.com',
  MCD: 'mcdonalds.com',
  KO: 'coca-cola.com',
  PEP: 'pepsico.com',
  COST: 'costco.com',
  WMT: 'walmart.com',
  LLY: 'lilly.com',
  ABBV: 'abbvie.com',
  AVGO: 'broadcom.com',
  ADBE: 'adobe.com',
  CRM: 'salesforce.com',
  ORCL: 'oracle.com',
  AMD: 'amd.com',
  QCOM: 'qualcomm.com',
  TXN: 'ti.com',
  INTC: 'intel.com',
  MU: 'micron.com',
  CSCO: 'cisco.com',
  AMAT: 'appliedmaterials.com',
  ASML: 'asml.com',
  PYPL: 'paypal.com',
  SNOW: 'snowflake.com',
  PLTR: 'palantir.com',
  COIN: 'coinbase.com',
  SBUX: 'starbucks.com',
  DIS: 'disney.com',
  NOW: 'servicenow.com',
  PANW: 'paloaltonetworks.com',
  MSTR: 'microstrategy.com',
  SMCI: 'supermicro.com',
  ADP: 'adp.com',
  SQ: 'block.xyz',
  SHOP: 'shopify.com',
  NET: 'cloudflare.com',
  CRWD: 'crowdstrike.com',
  ARM: 'arm.com',
  U: 'unity.com',
  MDB: 'mongodb.com',
  DDOG: 'datadoghq.com',
  ZS: 'zscaler.com',
};

// ─────────────────────────────────────────────────────────────
// Logo fallbacks — high-quality Wikipedia / vendor SVGs
// Used when SerpAPI's knowledge_graph doesn't expose a thumbnail.
// ─────────────────────────────────────────────────────────────
const US_LOGO_FALLBACKS: Record<string, string> = {
  AAPL: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  MSFT: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
  GOOG: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  GOOGL: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  AMZN: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
  TSLA: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
  NVDA: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg',
  META: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
  TSM: 'https://upload.wikimedia.org/wikipedia/commons/4/45/TSMC_logo.svg',
  NFLX: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
  'BRK.B': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Berkshire_Hathaway_logo.svg/2560px-Berkshire_Hathaway_logo.svg.png',
  JPM: 'https://upload.wikimedia.org/wikipedia/commons/a/af/J_P_Morgan_Logo_2008_1.svg',
  V: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg',
  MA: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg',
  UNH: 'https://upload.wikimedia.org/wikipedia/commons/0/07/UnitedHealth_Group_logo.svg',
  HD: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/HD_logo.svg',
  PG: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Procter_%26_Gamble_logo.svg',
  JNJ: 'https://upload.wikimedia.org/wikipedia/commons/1/17/Johnson_and_Johnson_Logo.svg',
  XOM: 'https://upload.wikimedia.org/wikipedia/commons/8/87/ExxonMobil_Logo.svg',
  CVX: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Chevron_Logo.svg',
  MCD: 'https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg',
  KO: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
  PEP: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Pepsi_2023.svg',
  COST: 'https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg',
  WMT: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg',
  LLY: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Eli_Lilly_and_Company.svg',
  ABBV: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/AbbVie_logo.svg',
  AVGO: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/Broadcom_Inc._logo_%282018%29.svg',
  ADBE: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Adobe_Corporate_logo.svg',
  CRM: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg',
  ORCL: 'https://upload.wikimedia.org/wikipedia/commons/5/50/Oracle_logo.svg',
  AMD: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg',
  QCOM: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Qualcomm-Logo.svg',
  TXN: 'https://upload.wikimedia.org/wikipedia/commons/6/68/Texas_Instruments_Logo.svg',
  INTC: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Intel_logo_%282006-2020%29.svg',
  MU: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Micron_Technology_logo.svg',
  CSCO: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Cisco_logo_blue_2016.svg',
  AMAT: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Applied_Materials_logo.svg',
  ASML: 'https://upload.wikimedia.org/wikipedia/commons/2/22/ASML_Holding_N.V._logo.svg',
  PYPL: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg',
  SNOW: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Snowflake_Logo.svg',
  PLTR: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Palantir_Technologies_logo.svg',
  COIN: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Coinbase.svg',
  SBUX: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
  DIS: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Walt_Disney_Studios_2023_logo.svg',
  // Missing / Newly added
  NOW: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/ServiceNow_logo.svg',
  PANW: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Palo_Alto_Networks_logo.svg',
  MSTR: 'https://upload.wikimedia.org/wikipedia/commons/2/22/MicroStrategy_logo.svg',
  SMCI: 'https://upload.wikimedia.org/wikipedia/commons/6/67/Super_Micro_Computer_Logo.svg',
  ADP: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Automatic_Data_Processing_%28logo%29_2014.svg',
  SQ: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Square%2C_Inc._logo.svg',
  SHOP: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
  NET: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg',
  CRWD: 'https://upload.wikimedia.org/wikipedia/commons/3/36/CrowdStrike_Logo.svg',
  ARM: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Arm_logo.svg',
  // ETFs
  DIA: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/State_Street_Corporation_logo.svg/1024px-State_Street_Corporation_logo.svg.png',
  SPY: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/State_Street_Corporation_logo.svg/1024px-State_Street_Corporation_logo.svg.png',
  QQQ: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Invesco_Logo.svg',
  VOO: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/The_Vanguard_Group_Logo.svg',
  IWM: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/BlackRock_wordmark.svg',
};

// ─────────────────────────────────────────────────────────────
// Google Finance exchange suffix hints
// ─────────────────────────────────────────────────────────────
const NASDAQ_TICKERS = new Set([
  'AAPL', 'MSFT', 'NVDA', 'GOOG', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NFLX',
  'ADBE', 'AVGO', 'AMD', 'QCOM', 'INTC', 'MU', 'CSCO', 'AMAT', 'ASML',
  'ADP', 'PYPL', 'CRM', 'ORCL', 'NOW', 'PANW', 'SNOW', 'MSTR', 'PLTR',
  'SMCI', 'COIN', 'SBUX', 'COST', 'PEP',
  // TXN (Texas Instruments) trades on NASDAQ Global Select, not NYSE.
  'TXN',
]);

const NYSE_TICKERS = new Set([
  'TSM', 'V', 'KO', 'MCD', 'BRK.B', 'JPM', 'UNH', 'HD', 'PG', 'JNJ',
  'XOM', 'CVX', 'LLY', 'ABBV', 'WMT', 'DIS', 'MA',
]);

// ETFs on NYSE Arca
const NYSEARCA_TICKERS = new Set(['DIA', 'SPY', 'VOO', 'IWM', 'EEM', 'VTI', 'ARKK']);
// QQQ is officially NASDAQ-listed
const NASDAQ_ETFS = new Set(['QQQ']);

function buildQuery(symbol: string): string {
  if (NASDAQ_TICKERS.has(symbol) || NASDAQ_ETFS.has(symbol)) return `${symbol}:NASDAQ`;
  if (NYSE_TICKERS.has(symbol)) return `${symbol}:NYSE`;
  if (NYSEARCA_TICKERS.has(symbol)) return `${symbol}:NYSEARCA`;
  return symbol;
}

/**
 * Free-text fallback queries for tickers that SerpAPI's google_finance
 * engine struggles to resolve from the ticker alone. Using the company name
 * as a search term is the last-resort path.
 */
const NAME_FALLBACKS: Record<string, string> = {
  'BRK.B': 'Berkshire Hathaway Class B',
  'BRK.A': 'Berkshire Hathaway Class A',
};

/**
 * Ordered list of queries to try against SerpAPI for a given ticker.
 * Tickers with a dot (e.g. "BRK.B") are tricky — different feeds variously
 * accept "BRK.B:NYSE", "BRK-B:NYSE", "BRKB:NYSE", or just the company name.
 * We try each in turn and stop at the first usable payload.
 */
function candidateQueries(symbol: string): string[] {
  const primary = buildQuery(symbol);
  const queries = new Set<string>();
  queries.add(primary);

  if (symbol.includes('.')) {
    const hyphen = symbol.replace(/\./g, '-');
    const concat = symbol.replace(/\./g, '');
    if (NYSE_TICKERS.has(symbol)) {
      queries.add(`${hyphen}:NYSE`);
      queries.add(`${concat}:NYSE`);
    } else if (NASDAQ_TICKERS.has(symbol)) {
      queries.add(`${hyphen}:NASDAQ`);
      queries.add(`${concat}:NASDAQ`);
    }
    queries.add(hyphen);
    queries.add(concat);
  }

  queries.add(symbol); // bare ticker

  const nameFallback = NAME_FALLBACKS[symbol];
  if (nameFallback) queries.add(nameFallback);

  return [...queries];
}

// ─────────────────────────────────────────────────────────────
// Parsing helpers
// ─────────────────────────────────────────────────────────────

/** Parse a numeric value out of strings like "$270.23", "1,234.56", "58.04M", "4.00T USD". */
function parseNum(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && !isNaN(v)) return v;
  const s = String(v).trim();
  if (!s) return null;
  const m = s.match(/-?[0-9][0-9,]*(?:\.[0-9]+)?/);
  if (!m) return null;
  const n = parseFloat(m[0].replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

/** Expand unit suffixes (T/B/M/K) present in strings like "4.00T USD" or "58.04M". */
function parseScaled(v: unknown): number | null {
  const n = parseNum(v);
  if (n === null) return null;
  const s = String(v ?? '').toUpperCase();
  if (s.includes('T')) return n * 1e12;
  if (s.includes('B')) return n * 1e9;
  if (s.includes('M')) return n * 1e6;
  if (s.includes('K')) return n * 1e3;
  return n;
}

/** Parse a Google Finance "Day range" string: "$269.00 - $272.30" → [269, 272.30]. */
function parseRange(v: unknown): { low: number | null; high: number | null } {
  if (!v) return { low: null, high: null };
  const parts = String(v).split(/[-–—]/).map((p) => p.trim());
  if (parts.length < 2) return { low: null, high: null };
  return { low: parseNum(parts[0]), high: parseNum(parts[1]) };
}

/**
 * Scan a knowledge_graph.key_stats.stats array for an entry whose label contains the keyword.
 * The array shape is typically: [{ label: "Previous close", value: "$266.08" }, ...]
 */
/**
 * Normalize SerpAPI's exchange string into one of our canonical labels.
 * SerpAPI has been observed to return "NYSE", "NasdaqGS", "NASDAQ", "NYSEARCA",
 * "NYSE Arca", etc., so we canonicalize case + whitespace.
 */
function normalizeExchange(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const s = String(raw).toUpperCase().replace(/\s+/g, '');
  if (s.includes('NYSEARCA') || s.includes('NYSE ARCA')) return 'NYSEARCA';
  if (s.includes('NASDAQ')) return 'NASDAQ';
  if (s.includes('NYSE')) return 'NYSE';
  return raw;
}

/** Fallback classification used when SerpAPI doesn't surface the exchange. */
function classifyExchange(symbol: string): string {
  if (NYSEARCA_TICKERS.has(symbol)) return 'NYSEARCA';
  if (NYSE_TICKERS.has(symbol)) return 'NYSE';
  if (NASDAQ_TICKERS.has(symbol) || NASDAQ_ETFS.has(symbol)) return 'NASDAQ';
  return 'NASDAQ'; // reasonable default for unknown US tickers
}

function findStat(stats: any[], keyword: string): string | null {
  if (!Array.isArray(stats)) return null;
  const needle = keyword.toLowerCase();
  for (const s of stats) {
    const label = String(s?.label ?? s?.title ?? '').toLowerCase();
    if (label.includes(needle)) {
      return s?.value ?? s?.text ?? null;
    }
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Route handler
// ─────────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  // Next.js already URL-decodes path params, but decode defensively in case a
  // client double-encodes (e.g. "BRK%252EB" from an over-eager middleware).
  let decoded = rawSymbol;
  try {
    decoded = decodeURIComponent(rawSymbol);
  } catch {
    /* rawSymbol wasn't valid URL encoding — keep it as-is */
  }
  const symbol = decoded.toUpperCase();
  const apiKey = process.env.SERP_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'SERP_API_KEY is not configured' },
      { status: 500 }
    );
  }

  try {
    // Some tickers only resolve under a specific exchange suffix, and tickers
    // with dots (BRK.B) can need the hyphenated form. Walk through candidates
    // until one returns a response that actually contains a usable price.
    const queries = candidateQueries(symbol);
    let data: any = null;
    let lastError: string | undefined;

    for (const q of queries) {
      const result = await fetchSerp(q, apiKey);
      if (result?.error) {
        lastError = result.error;
        continue;
      }
      if (hasUsablePayload(result)) {
        data = result;
        break;
      }
    }

    if (!data) {
      return NextResponse.json(
        { error: lastError || 'Data unavailable from SerpAPI', triedQueries: queries },
        { status: 502 }
      );
    }

    return NextResponse.json(shapeQuote(data, symbol));
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error', detail: String(err) },
      { status: 502 }
    );
  }
}

/**
 * A SerpAPI response is only "usable" if it contains an actual price somewhere.
 * An empty `summary: {}` object or a knowledge_graph with only boilerplate
 * shouldn't count — otherwise we'd commit to a junk response on the first try
 * and never get to the fallback queries.
 */
function hasUsablePayload(d: any): boolean {
  if (!d || d.error) return false;
  const summaryPrice = d.summary?.extracted_price ?? d.summary?.price;
  if (summaryPrice) return true;
  const stockResults = d.markets?.stock_results;
  if (Array.isArray(stockResults) && stockResults.length && stockResults[0]?.price) return true;
  const stats = d.knowledge_graph?.key_stats?.stats;
  if (Array.isArray(stats) && stats.length) return true;
  return false;
}

async function fetchSerp(q: string, apiKey: string) {
  const url = `https://serpapi.com/search.json?engine=google_finance&q=${encodeURIComponent(q)}&api_key=${apiKey}`;
  // Cache for 60s — client polls every 60s, so this is a sane bound
  // that still serves fresh data and avoids hammering the quota.
  const res = await fetch(url, { next: { revalidate: 60 } });
  return res.json();
}

function shapeQuote(data: any, symbol: string) {
  const summary = data.summary || {};
  const kg = data.knowledge_graph || {};
  const stockResult = data.markets?.stock_results?.[0] || {};
  const stats = kg.key_stats?.stats || [];
  const graph: any[] = Array.isArray(data.graph) ? data.graph : [];

  // ── Price & change
  const lastPrice =
    parseNum(summary.extracted_price) ??
    parseNum(summary.price) ??
    parseNum(stockResult.price) ??
    null;

  const priceMovement = summary.price_movement || {};
  const movementSign = (priceMovement.movement || '').toLowerCase() === 'down' ? -1 : 1;
  const rawChange = parseNum(priceMovement.value);
  const rawChangePct = parseNum(priceMovement.percentage);
  const change = rawChange !== null ? movementSign * Math.abs(rawChange) : null;
  const changePercent = rawChangePct !== null ? movementSign * Math.abs(rawChangePct) : null;

  // ── Previous close, day range, market cap, volume (from key_stats)
  const previousClose = parseNum(findStat(stats, 'Previous close'));

  const dayRangeStr = findStat(stats, 'Day range');
  const { low: lowPrice, high: highPrice } = parseRange(dayRangeStr);

  const marketCapStr = findStat(stats, 'Market cap');
  const marketCap = parseScaled(marketCapStr);

  const volumeStr = findStat(stats, 'Avg volume') || findStat(stats, 'Volume');
  const volume = parseScaled(volumeStr);

  // ── Open price: SerpAPI Google Finance doesn't expose an explicit "Open"
  //    field, so we approximate with the earliest intraday graph point.
  //    If no intraday points are available (weekends / pre-market), fall
  //    back to previousClose so the UI shows something reasonable.
  const firstGraphPrice = graph.length
    ? parseNum(graph[0].price ?? graph[0].value ?? graph[0].close)
    : null;
  const openPrice = firstGraphPrice ?? previousClose ?? null;

  // ── Logo priority: SerpAPI thumbnail → hardcoded fallback
  const serpLogo =
    kg.logo ||
    kg.image ||
    kg.thumbnail ||
    summary.thumbnail ||
    stockResult.thumbnail ||
    null;
  
  const domain = US_COMPANY_DOMAINS[symbol];
  const clearbitFallback = domain ? `https://logo.clearbit.com/${domain}` : null;
  const logo = serpLogo || US_LOGO_FALLBACKS[symbol] || clearbitFallback || null;

  // ── Display name: prefer our curated Chinese name, then SerpAPI
  const name =
    US_STOCK_NAMES_CN[symbol] ||
    kg.title ||
    summary.title ||
    stockResult.name ||
    symbol;

  // ── Exchange: read from the SerpAPI response so the UI always matches
  //    reality (e.g. BRK.B on NYSE, TXN on NASDAQ). Fall back to our
  //    ticker-set classification if SerpAPI doesn't surface it.
  const serpExchange =
    summary.exchange ||
    stockResult.exchange ||
    findStat(stats, 'Primary exchange') ||
    null;
  const exchange = normalizeExchange(serpExchange) || classifyExchange(symbol);

  return {
    symbol,
    name,
    logo,
    exchange,
    lastPrice,
    openPrice,
    highPrice,
    lowPrice,
    previousClose,
    change,
    changePercent,
    volume,
    marketCap,
    timestamp: new Date().toISOString(),
    isMock: false,
  };
}
