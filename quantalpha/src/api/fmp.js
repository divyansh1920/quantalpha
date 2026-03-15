import axios from 'axios';

const BASE_URL = 'https://financialmodelingprep.com/stable';
const API_KEY  = import.meta.env.VITE_FMP_API_KEY;

const client = axios.create({ baseURL: BASE_URL, timeout: 15000 });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 401 || status === 403)
      throw new Error('Invalid FMP API key. Check your .env file.');
    if (status === 402)
      throw new Error('PAID_ENDPOINT');
    if (status === 429)
      throw new Error('FMP rate limit reached. Please wait and try again.');
    if (status === 404)
      return Promise.resolve({ data: [] });
    throw new Error(err.message || 'Network error.');
  }
);

const get = (path, params = {}) =>
  client.get(path, { params: { ...params, apikey: API_KEY } }).then((r) => r.data);

const toArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.data && Array.isArray(data.data)) return data.data;
  return [data];
};

export const getCompanyProfile = async (ticker) => {
  try {
    const data = await get('/profile', { symbol: ticker });
    const arr  = toArray(data);
    if (!arr.length) throw new Error(`Ticker "${ticker}" not found.`);
    return arr[0];
  } catch (e) {
    if (e.message === 'PAID_ENDPOINT') return null;
    throw e;
  }
};

export const getQuote = async (ticker) => {
  try {
    const data = await get('/quote', { symbol: ticker });
    const arr  = toArray(data);
    if (!arr.length) throw new Error(`No quote for "${ticker}".`);
    const q = arr[0];
    return {
      ...q,
      price:             q.price            ?? 0,
      changesPercentage: q.changesPercentage ?? q.changePercent ?? 0,
      marketCap:         q.marketCap         ?? q.mktCap ?? 0,
      yearHigh:          q.yearHigh          ?? null,
      yearLow:           q.yearLow           ?? null,
      pe:                q.pe                ?? null,
    };
  } catch (e) {
    if (e.message === 'PAID_ENDPOINT') return null;
    throw e;
  }
};

export const getIncomeStatement = async (ticker, limit = 5) => {
  try {
    const data = await get('/income-statement', { symbol: ticker, limit, period: 'annual' });
    const arr  = toArray(data);
    return arr.length ? arr : null;
  } catch { return null; }
};

export const getBalanceSheet = async (ticker, limit = 5) => {
  try {
    const data = await get('/balance-sheet-statement', { symbol: ticker, limit, period: 'annual' });
    const arr  = toArray(data);
    return arr.length ? arr : null;
  } catch { return null; }
};

export const getCashFlow = async (ticker, limit = 5) => {
  try {
    const data = await get('/cash-flow-statement', { symbol: ticker, limit, period: 'annual' });
    const arr  = toArray(data);
    return arr.length ? arr : null;
  } catch { return null; }
};

export const getFinancialRatios = async (ticker, limit = 5) => {
  try {
    const data = await get('/ratios', { symbol: ticker, limit, period: 'annual' });
    const arr  = toArray(data);
    return arr.length ? arr : null;
  } catch { return null; }
};

export const getKeyMetrics = async (ticker, limit = 5) => {
  try {
    const data = await get('/key-metrics', { symbol: ticker, limit, period: 'annual' });
    const arr  = toArray(data);
    return arr.length ? arr : null;
  } catch { return null; }
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
  try {
    const data = await get('/historical-price-eod/light', { symbol: ticker, limit: 365 });
    const arr  = toArray(data);
    if (!arr.length) return null;
    return [...arr].reverse();
  } catch { return null; }
};

export const getScreenerResults = async (strategy) => {
  try {
    const params = buildScreenerParams(strategy);
    const data   = await get('/company-screener', params);
    return toArray(data).slice(0, 20);
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