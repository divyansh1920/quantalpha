import axios from 'axios';

const BASE_URL = 'https://api.twelvedata.com';
const API_KEY  = import.meta.env.VITE_TWELVE_DATA_KEY;

// Convert RELIANCE.NS → RELIANCE:NSE (Twelve Data format)
export const toTwelveSymbol = (ticker) => {
  if (ticker.endsWith('.NS')) return ticker.replace('.NS', '') + ':NSE';
  if (ticker.endsWith('.BO')) return ticker.replace('.BO', '') + ':BSE';
  return ticker;
};

export const isIndianStock = (ticker) =>
  ticker.endsWith('.NS') || ticker.endsWith('.BO');

// Single stock quote — works for both US and Indian
export const getTwelveQuote = async (ticker) => {
  try {
    const symbol = toTwelveSymbol(ticker);
    const { data } = await axios.get(`${BASE_URL}/quote`, {
      params: { symbol, apikey: API_KEY },
      timeout: 15000,
    });
    if (data.status === 'error' || !data.close) return null;

    const price   = parseFloat(data.close);
    const prevClose = parseFloat(data.previous_close || data.close);
    const change  = price - prevClose;
    const changePct = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol:            ticker,
      name:              data.name || ticker,
      price,
      changesPercentage: parseFloat(changePct.toFixed(2)),
      change:            parseFloat(change.toFixed(2)),
      volume:            parseInt(data.volume || 0, 10),
      yearHigh:          parseFloat(data.fifty_two_week?.high || 0),
      yearLow:           parseFloat(data.fifty_two_week?.low  || 0),
      exchange:          data.exchange || 'NSE',
      currency:          data.currency || 'INR',
      open:              parseFloat(data.open  || 0),
      high:              parseFloat(data.high  || 0),
      low:               parseFloat(data.low   || 0),
      marketCap:         null, // not provided by Twelve Data free
      pe:                null,
      isIndian:          true,
    };
  } catch (err) {
    console.warn('Twelve Data quote failed:', err.message);
    return null;
  }
};

// Historical daily prices for chart
export const getOHLCV = async (ticker, outputsize = 365) => {
  try {
    const symbol = toTwelveSymbol(ticker);
    const { data } = await axios.get(`${BASE_URL}/time_series`, {
      params: { symbol, interval: '1day', outputsize, apikey: API_KEY },
      timeout: 15000,
    });
    if (data.status === 'error' || !data.values) return null;
    return [...data.values].reverse().map((item) => ({
      date:   item.datetime,
      open:   parseFloat(item.open),
      high:   parseFloat(item.high),
      low:    parseFloat(item.low),
      close:  parseFloat(item.close),
      volume: parseInt(item.volume || 0, 10),
    }));
  } catch (err) {
    console.warn('Twelve Data OHLCV failed:', err.message);
    return null;
  }
};

// Batch quotes for screener — fetches one by one with delay
export const getBatchIndianQuotes = async (tickers, maxCount = 12) => {
  const results = [];
  const limited = tickers.slice(0, maxCount);
  for (let i = 0; i < limited.length; i++) {
    const q = await getTwelveQuote(limited[i]);
    if (q) results.push({ ...q, ticker: limited[i] });
    // Small delay to respect rate limits (8 req/min on free tier)
    if (i < limited.length - 1) await new Promise((r) => setTimeout(r, 500));
  }
  return results;
};

// Fundamental data from FMP v3 (different endpoint, may work for Indian stocks)
export const getIndianFundamentals = async (ticker) => {
  const API_KEY_FMP = import.meta.env.VITE_FMP_API_KEY;
  const base = 'https://financialmodelingprep.com/api/v3';
  const headers = {};

  const tryFetch = async (path) => {
    try {
      const { data } = await axios.get(`${base}${path}`, {
        params: { apikey: API_KEY_FMP, limit: 5 },
        timeout: 12000,
        headers,
      });
      if (Array.isArray(data) && data.length > 0) return data;
      return null;
    } catch { return null; }
  };

  const [income, balance, cashFlow, ratios] = await Promise.all([
    tryFetch(`/income-statement/${ticker}`),
    tryFetch(`/balance-sheet-statement/${ticker}`),
    tryFetch(`/cash-flow-statement/${ticker}`),
    tryFetch(`/ratios/${ticker}`),
  ]);

  return { income, balance, cashFlow, ratios };
};