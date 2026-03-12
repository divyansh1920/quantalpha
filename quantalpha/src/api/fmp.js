import axios from 'axios';

const BASE_URL = 'https://financialmodelingprep.com/stable';
const API_KEY  = import.meta.env.VITE_FMP_API_KEY;

const client = axios.create({ baseURL: BASE_URL, timeout: 15000 });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403)
      throw new Error('Invalid FMP API key. Please check your .env file.');
    if (status === 429)
      throw new Error('FMP rate limit reached. Please wait and try again.');
    throw new Error(err.message || 'Network error. Check your connection.');
  }
);

const get = (path, params = {}) =>
  client.get(path, { params: { ...params, apikey: API_KEY } }).then((r) => r.data);

/* ── Normalize: new API returns object OR array depending on endpoint ── */
const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [data];
};

export const getCompanyProfile = async (ticker) => {
  const data = await get('/profile', { symbol: ticker });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`Ticker "${ticker}" not found. Please verify the symbol.`);
  return arr[0];
};

export const getQuote = async (ticker) => {
  const data = await get('/quote', { symbol: ticker });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No live quote available for "${ticker}".`);
  return arr[0];
};

export const getIncomeStatement = async (ticker, limit = 5) => {
  const data = await get('/income-statement', { symbol: ticker, limit, period: 'annual' });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No income statement data for "${ticker}".`);
  return arr;
};

export const getBalanceSheet = async (ticker, limit = 5) => {
  const data = await get('/balance-sheet-statement', { symbol: ticker, limit, period: 'annual' });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No balance sheet data for "${ticker}".`);
  return arr;
};

export const getCashFlow = async (ticker, limit = 5) => {
  const data = await get('/cash-flow-statement', { symbol: ticker, limit, period: 'annual' });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No cash flow data for "${ticker}".`);
  return arr;
};

export const getFinancialRatios = async (ticker, limit = 5) => {
  const data = await get('/ratios', { symbol: ticker, limit, period: 'annual' });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No ratio data for "${ticker}".`);
  return arr;
};

export const getKeyMetrics = async (ticker, limit = 5) => {
  const data = await get('/key-metrics', { symbol: ticker, limit, period: 'annual' });
  const arr  = toArray(data);
  if (!arr.length) throw new Error(`No key metrics for "${ticker}".`);
  return arr;
};

export const getDCFValue = async (ticker) => {
  try {
    const data = await get('/discounted-cash-flow', { symbol: ticker });
    const arr  = toArray(data);
    return arr.length ? arr[0] : null;
  } catch { return null; }
};

export const getRating = async (ticker) => {
  try {
    const data = await get('/ratings', { symbol: ticker });
    const arr  = toArray(data);
    return arr.length ? arr[0] : null;
  } catch { return null; }
};

export const getHistoricalPrice = async (ticker) => {
  const data = await get('/historical-price-full', { symbol: ticker, serietype: 'line' });
  const hist = data?.historical || (Array.isArray(data) ? data : null);
  if (!hist) throw new Error(`No historical price data for "${ticker}".`);
  return [...hist].reverse().slice(-365);
};

export const getScreenerResults = async (strategy) => {
  try {
    const params = buildScreenerParams(strategy);
    const data   = await get('/company-screener', params);
    const arr    = toArray(data);
    return arr.slice(0, 20);
  } catch { return []; }
};

const buildScreenerParams = (strategy) => {
  const base = { limit: 20, exchange: 'NASDAQ,NYSE', isEtf: false };
  const map  = {
    value:    { ...base, peRatioLowerThan: 20,   priceToBookLowerThan: 3, marketCapMoreThan: 1000000000 },
    growth:   { ...base, revenueMoreThan: 500000000,                       marketCapMoreThan: 2000000000 },
    dividend: { ...base, dividendMoreThan: 1,                              marketCapMoreThan: 1000000000 },
    quality:  { ...base, roaMoreThan: 10,                                  marketCapMoreThan: 5000000000 },
  };
  return map[strategy] || base;
};