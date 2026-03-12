import axios from 'axios';

const BASE_URL = 'https://financialmodelingprep.com/api';
const API_KEY = import.meta.env.VITE_FMP_API_KEY;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

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

const get = (path) => client.get(`${path}&apikey=${API_KEY}`).then((r) => r.data);

export const getCompanyProfile = async (ticker) => {
  const data = await get(`/v3/profile/${ticker}?`);
  if (!data || data.length === 0)
    throw new Error(`Ticker "${ticker}" not found. Please verify the symbol.`);
  return data[0];
};

export const getQuote = async (ticker) => {
  const data = await get(`/v3/quote/${ticker}?`);
  if (!data || data.length === 0)
    throw new Error(`No live quote available for "${ticker}".`);
  return data[0];
};

export const getIncomeStatement = async (ticker, limit = 5) => {
  const data = await get(`/v3/income-statement/${ticker}?limit=${limit}&`);
  if (!data || data.length === 0)
    throw new Error(`No income statement data for "${ticker}".`);
  return data;
};

export const getBalanceSheet = async (ticker, limit = 5) => {
  const data = await get(`/v3/balance-sheet-statement/${ticker}?limit=${limit}&`);
  if (!data || data.length === 0)
    throw new Error(`No balance sheet data for "${ticker}".`);
  return data;
};

export const getCashFlow = async (ticker, limit = 5) => {
  const data = await get(`/v3/cash-flow-statement/${ticker}?limit=${limit}&`);
  if (!data || data.length === 0)
    throw new Error(`No cash flow data for "${ticker}".`);
  return data;
};

export const getFinancialRatios = async (ticker, limit = 5) => {
  const data = await get(`/v3/ratios/${ticker}?limit=${limit}&`);
  if (!data || data.length === 0)
    throw new Error(`No ratio data for "${ticker}".`);
  return data;
};

export const getKeyMetrics = async (ticker, limit = 5) => {
  const data = await get(`/v3/key-metrics/${ticker}?limit=${limit}&`);
  if (!data || data.length === 0)
    throw new Error(`No key metrics for "${ticker}".`);
  return data;
};

export const getDCFValue = async (ticker) => {
  const data = await get(`/v3/discounted-cash-flow/${ticker}?`);
  if (!data || data.length === 0) return null;
  return data[0];
};

export const getRating = async (ticker) => {
  const data = await get(`/v3/rating/${ticker}?`);
  if (!data || data.length === 0) return null;
  return data[0];
};

export const getHistoricalPrice = async (ticker) => {
  const data = await get(`/v3/historical-price-full/${ticker}?serietype=line&`);
  if (!data || !data.historical)
    throw new Error(`No historical price data for "${ticker}".`);
  return [...data.historical].reverse().slice(-365);
};

export const getScreenerResults = async (strategy) => {
  const params = buildScreenerParams(strategy);
  const qs = new URLSearchParams({ ...params, apikey: API_KEY }).toString();
  const data = await client.get(`/v3/stock-screener?${qs}`).then((r) => r.data);
  return Array.isArray(data) ? data.slice(0, 20) : [];
};

const buildScreenerParams = (strategy) => {
  const base = { limit: 20, exchange: 'NASDAQ,NYSE', isEtf: false };
  const strategies = {
    value: { ...base, peRatioLowerThan: 20, priceToBookLowerThan: 3, marketCapMoreThan: 1000000000 },
    growth: { ...base, revenueMoreThan: 500000000, marketCapMoreThan: 2000000000 },
    dividend: { ...base, dividendMoreThan: 1, marketCapMoreThan: 1000000000 },
    quality: { ...base, roaMoreThan: 10, marketCapMoreThan: 5000000000 },
  };
  return strategies[strategy] || base;
};