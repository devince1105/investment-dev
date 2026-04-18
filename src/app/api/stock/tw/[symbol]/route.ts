import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TW_STOCK_LOGOS: Record<string, string> = {
  '2330': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/TSMC_logo.svg/512px-TSMC_logo.svg.png',
  '2317': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Foxconn-logo.svg/512px-Foxconn-logo.svg.png',
  '2454': 'https://upload.wikimedia.org/wikipedia/zh/thumb/d/d4/MediaTek_logo.svg/512px-MediaTek_logo.svg.png',
  '2308': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/87/Delta_Electronics_Logo.svg/1024px-Delta_Electronics_Logo.svg.png',
  '2303': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/UMC_Logo.svg/512px-UMC_Logo.svg.png',
  '2603': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Evergreen_Group.svg/512px-Evergreen_Group.svg.png',
  '2609': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Yang_Ming_Logo_2014.svg/512px-Yang_Ming_Logo_2014.svg.png',
  '2881': 'https://upload.wikimedia.org/wikipedia/zh/thumb/9/9f/Fubon_Group_logo.svg/512px-Fubon_Group_logo.svg.png',
  '2882': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Cathay_Financial_Holding_Company_Logo.svg',
  '5880': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Taiwan_Cooperative_Bank_logo.svg/512px-Taiwan_Cooperative_Bank_logo.svg.png',
  '2412': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Chunghwa_Telecom_logo.svg/512px-Chunghwa_Telecom_logo.svg.png',
  '0050': 'https://www.yuantaetfs.com/api/Asset/Icon/0050.png',
  '0056': 'https://www.yuantaetfs.com/api/Asset/Icon/0056.png',
  '3711': 'https://upload.wikimedia.org/wikipedia/en/2/23/ASE_Technology_Holding_logo.png'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  const apiKey = process.env.FUGLE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'FUGLE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const quoteUrl = `https://api.fugle.tw/marketdata/v1.0/stock/intraday/quote/${symbol}`;
    const metaUrl = `https://api.fugle.tw/marketdata/v1.0/stock/intraday/meta/${symbol}`;

    const [quoteRes, metaRes] = await Promise.all([
      fetch(quoteUrl, { headers: { 'X-API-KEY': apiKey }, cache: 'no-store' }),
      fetch(metaUrl, { headers: { 'X-API-KEY': apiKey }, cache: 'no-store' })
    ]);

    if (!quoteRes.ok) return NextResponse.json({ error: `Fugle error: ${quoteRes.status}` }, { status: quoteRes.status });

    const qData = await quoteRes.json();
    const mData = metaRes.ok ? await metaRes.json() : null;
    
    // Normalize symbol for logo lookup (e.g., 2330.tw -> 2330)
    const lookupKey = symbol.split('.')[0];

    return NextResponse.json({
      symbol: qData.symbol ?? symbol,
      name: qData.name ?? symbol,
      logo: TW_STOCK_LOGOS[lookupKey] || null,
      lastPrice: qData.lastPrice ?? null,
      openPrice: qData.openPrice ?? null,
      highPrice: qData.highPrice ?? null,
      lowPrice: qData.lowPrice ?? null,
      previousClose: qData.previousClose ?? null,
      change: qData.change ?? null,
      changePercent: qData.changePercent ?? null,
      marketCap: mData?.marketCapitalization ?? qData.total?.tradeValue ?? null, 
      timestamp: qData.updatedAt ?? qData.time ?? new Date().toISOString()
    });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 502 });
  }
}
