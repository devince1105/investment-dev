// 台股已發行股數：上市取自證交所 OpenAPI、上櫃取自櫃買中心 OpenAPI，
// 上市 ETF 取證交所基金基本資料的發行單位數。清單每天更新一次，免金鑰；
// 上櫃 ETF 沒有對應資料，查不到時回傳 null。

const TWSE_URL = 'https://openapi.twse.com.tw/v1/opendata/t187ap03_L';
const TPEX_URL = 'https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O';
const TWSE_FUND_URL = 'https://openapi.twse.com.tw/v1/opendata/t187ap47_L';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let cache: { shares: Map<string, number>; fetchedAt: number } | null = null;
let pending: Promise<Map<string, number>> | null = null;

async function fetchList(url: string, codeKey: string, sharesKey: string): Promise<[string, number][]> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const rows: Record<string, string>[] = await res.json();
    return rows
      .map((row): [string, number] => [String(row[codeKey] ?? '').trim(), Number(String(row[sharesKey] ?? '').replace(/,/g, ''))])
      .filter(([code, shares]) => code && shares > 0);
  } catch {
    return [];
  }
}

async function loadShares(): Promise<Map<string, number>> {
  const [listed, otc, etf] = await Promise.all([
    fetchList(TWSE_URL, '公司代號', '已發行普通股數或TDR原股發行股數'),
    fetchList(TPEX_URL, 'SecuritiesCompanyCode', 'IssueShares'),
    fetchList(TWSE_FUND_URL, '基金代號', '發行單位數/轉換數'),
  ]);
  return new Map([...etf, ...otc, ...listed]);
}

export async function getIssuedShares(symbol: string): Promise<number | null> {
  if (!cache || Date.now() - cache.fetchedAt > ONE_DAY_MS) {
    pending ??= loadShares().finally(() => { pending = null; });
    const shares = await pending;
    // 全部抓失敗時不寫入快取，下次請求再試
    if (shares.size > 0) cache = { shares, fetchedAt: Date.now() };
    else return null;
  }
  return cache.shares.get(symbol) ?? null;
}
