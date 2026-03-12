import axios from 'axios';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;

const avGet = (params) =>
  axios.get(BASE_URL, { params: { ...params, apikey: API_KEY }, timeout: 15000 })
    .then((r) => r.data);

export const getRSI = async (ticker) => {
  try {
    const data = await avGet({
      function: 'RSI',
      symbol: ticker,
      interval: 'weekly',
      time_period: 14,
      series_type: 'close',
    });
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage rate limit hit');
      return null;
    }
    if (data['Error Message']) return null;

    const raw = data['Technical Analysis: RSI'];
    if (!raw) return null;

    return Object.keys(raw)
      .slice(0, 20)
      .reverse()
      .map((date) => ({ date, rsi: parseFloat(raw[date]['RSI']) }));
  } catch (err) {
    console.warn('RSI fetch failed:', err.message);
    return null;
  }
};

export const getMACD = async (ticker) => {
  try {
    const data = await avGet({
      function: 'MACD',
      symbol: ticker,
      interval: 'daily',
      series_type: 'close',
    });
    if (data['Note'] || data['Information']) {
      console.warn('Alpha Vantage rate limit hit');
      return null;
    }
    if (data['Error Message']) return null;

    const raw = data['Technical Analysis: MACD'];
    if (!raw) return null;

    return Object.keys(raw)
      .slice(0, 30)
      .reverse()
      .map((date) => ({
        date,
        macd: parseFloat(raw[date]['MACD']),
        signal: parseFloat(raw[date]['MACD_Signal']),
        histogram: parseFloat(raw[date]['MACD_Hist']),
      }));
  } catch (err) {
    console.warn('MACD fetch failed:', err.message);
    return null;
  }
};