import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '1D'; 

  try {
    // ADVANCED YAHOO FETCHING WITH STEALTH HEADERS FOR VOLUMETRIC DATA
    let interval = '1d';
    let range = '1y';

    switch (period) {
      case '1H':
        interval = '5m';
        range = '2d'; // 2 days is perfect for 5m intraday focus
        break;
      case '1D':
        interval = '1d';
        range = '1y';
        break;
      case '1W':
        interval = '1wk';
        range = '5y';
        break;
      case '1M':
        interval = '1mo';
        range = 'max';
        break;
      default:
        interval = '1d';
        range = '1y';
    }

    // Using query2 which is often more resilient
    const yfUrl = `https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
    
    const res = await fetch(yfUrl, { 
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://finance.yahoo.com/'
      },
      next: { revalidate: 3600 } 
    });

    if (!res.ok) {
      // LOGICAL FALLBACK: If Yahoo fails, we go back to SerpAPI but warn about volume
      return fetchSerpFallback(symbol, period);
    }

    const data = await res.json();
    const result = data.chart?.result?.[0];
    
    if (!result || !result.timestamp) {
      return fetchSerpFallback(symbol, period);
    }

    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];
    
    // Validate we have real volume
    const hasRealVolume = quotes.volume && quotes.volume.some((v: any) => v > 0);

    const chartData = timestamps.map((t: number, i: number) => ({
      time: new Date(t * 1000).toISOString(),
      open: quotes.open[i] || quotes.close[i],
      high: quotes.high[i] || quotes.close[i],
      low: quotes.low[i] || quotes.close[i],
      close: quotes.close[i],
      volume: quotes.volume[i] || 0
    })).filter((c: any) => c.close !== null)
    .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());

    return NextResponse.json({ symbol, period, chartData, source: 'yahoo' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal Server Error', detail: String(err) }, { status: 500 });
  }
}

async function fetchSerpFallback(symbol: string, period: string) {
  const apiKey = process.env.SERP_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'Data providers unavailable' }, { status: 503 });

  const q = (symbol === 'TSM' || symbol === 'V' || symbol === 'KO') ? `${symbol}:NYSE` : `${symbol}:NASDAQ`;
  const url = `https://serpapi.com/search.json?engine=google_finance&q=${encodeURIComponent(q)}&api_key=${apiKey}`;
  
  const res = await fetch(url);
  const data = await res.json();
  const graph = data.graph || [];
  
  const chartData = graph.map((p: any, idx: number) => ({
    time: p.date || p.time,
    open: p.price,
    high: p.price,
    low: p.price,
    close: p.price,
    volume: 100 // Flat volume warning
  }));

  return NextResponse.json({ symbol, period, chartData, source: 'serp_fallback', note: 'Real volume unavailable via Google Finance' });
}
