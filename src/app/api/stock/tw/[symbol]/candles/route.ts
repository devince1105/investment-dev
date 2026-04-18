import { NextRequest, NextResponse } from 'next/server';

// Fugle's /historical/candles endpoint caps a single request's from→to
// span to roughly 1 year. Anything wider returns a 400 with no `data`
// field, which previously made 1D/1W/1M charts silently render as empty.
// We chunk into ≤ CHUNK_DAYS windows and concatenate.
const CHUNK_DAYS = 365;

// How many calendar days of history we want per period, tuned to what
// the client actually plots (1D/1W slice to 120 points; 1M takes all).
const RANGE_BY_PERIOD: Record<string, number> = {
  '1D': 400,   // ~ last 270 trading days → 120-point slice has headroom
  '1W': 1100,  // ~ 3 years → ~150 weekly candles
  '1M': 2600,  // ~ 7+ years → ~85 monthly candles
};

// Format a Date as YYYY-MM-DD in Asia/Taipei, so "today" doesn't flip
// back a day for users in TPE when the server clock is UTC.
function tpeDateString(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${day}`;
}

function addDays(iso: string, days: number): string {
  // iso is YYYY-MM-DD; treat as UTC midnight so arithmetic is stable.
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

type FugleCandle = {
  date?: string;
  time?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

type FugleResponse = {
  data?: FugleCandle[];
  message?: string;
  statusCode?: number;
};

async function fetchWindow(
  symbol: string,
  from: string,
  to: string,
  apiKey: string
): Promise<{ data: FugleCandle[]; error?: string }> {
  const url = `https://api.fugle.tw/marketdata/v1.0/stock/historical/candles/${symbol}?from=${from}&to=${to}`;
  const res = await fetch(url, {
    headers: { 'X-API-KEY': apiKey },
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as FugleResponse;
  if (!res.ok || !Array.isArray(json.data)) {
    return {
      data: [],
      error: json.message || `Fugle ${res.status}`,
    };
  }
  return { data: json.data };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const period = request.nextUrl.searchParams.get('period') || '1D';

  const apiKey = process.env.FUGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FUGLE_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const now = new Date();
    const todayStr = tpeDateString(now);

    // ── Intraday (5-min) branch, with weekend/holiday backfill ──
    if (period === '1H') {
      const intradayUrl = `https://api.fugle.tw/marketdata/v1.0/stock/intraday/candles/${symbol}`;
      const res = await fetch(intradayUrl, {
        headers: { 'X-API-KEY': apiKey },
        cache: 'no-store',
      });
      const data = (await res.json().catch(() => ({}))) as FugleResponse;
      let rawData = Array.isArray(data.data) ? data.data : [];

      if (rawData.length === 0) {
        // Find the most recent trading day via a short historical query.
        const from = addDays(todayStr, -10);
        const hist = await fetchWindow(symbol, from, todayStr, apiKey);
        if (hist.data.length > 0) {
          // Fugle returns historical in descending order; first entry = latest trading day.
          const lastDate = hist.data[0].date;
          if (lastDate) {
            const fbRes = await fetch(`${intradayUrl}?date=${lastDate}`, {
              headers: { 'X-API-KEY': apiKey },
              cache: 'no-store',
            });
            const fbJson = (await fbRes.json().catch(() => ({}))) as FugleResponse;
            rawData = Array.isArray(fbJson.data) ? fbJson.data : [];
          }
        }
      }

      const normalized = rawData.map((c) => ({
        time: c.time || c.date || now.toISOString(),
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }));
      return NextResponse.json({ symbol, period, chartData: normalized });
    }

    // ── Historical (1D / 1W / 1M) with chunked pagination ──
    const totalDays = RANGE_BY_PERIOD[period] ?? RANGE_BY_PERIOD['1D'];
    const startStr = addDays(todayStr, -totalDays);

    // Build [from, to] chunks of at most CHUNK_DAYS.
    const chunks: Array<{ from: string; to: string }> = [];
    let cursor = startStr;
    while (cursor <= todayStr) {
      const end = addDays(cursor, CHUNK_DAYS - 1);
      const to = end < todayStr ? end : todayStr;
      chunks.push({ from: cursor, to });
      cursor = addDays(to, 1);
    }

    const results = await Promise.all(
      chunks.map((c) => fetchWindow(symbol, c.from, c.to, apiKey))
    );

    // Surface API-level errors (e.g. bad symbol) when no window returned data.
    const combined = results.flatMap((r) => r.data);
    if (combined.length === 0) {
      const firstErr = results.find((r) => r.error)?.error;
      return NextResponse.json({
        symbol,
        period,
        chartData: [],
        error: firstErr || 'No historical data returned',
      });
    }

    // Dedupe by date (chunks are non-overlapping, but be defensive), normalize, sort asc.
    const seen = new Set<string>();
    const normalized = combined
      .map((c) => ({
        time: c.date,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
        volume: c.volume,
      }))
      .filter((c) => {
        if (!c.time || c.open === undefined) return false;
        if (seen.has(c.time)) return false;
        seen.add(c.time);
        return true;
      })
      .sort((a, b) => (a.time! < b.time! ? -1 : a.time! > b.time! ? 1 : 0));

    return NextResponse.json({ symbol, period, chartData: normalized });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server exception';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
