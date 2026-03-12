import axios from 'axios';

const BASE_URL = 'https://api.twelvedata.com';
const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY;

export const getOHLCV = async (ticker, outputsize = 90) => {
  try {
    const { data } = await axios.get(`${BASE_URL}/time_series`, {
      params: { symbol: ticker, interval: '1day', outputsize, apikey: API_KEY },
      timeout: 15000,
    });
    if (data.status === 'error') throw new Error(data.message);
    if (!data.values) throw new Error('No OHLCV data returned');

    return [...data.values].reverse().map((item) => ({
      date: item.datetime,
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseInt(item.volume, 10),
    }));
  } catch (err) {
    console.warn('Twelve Data OHLCV failed:', err.message);
    return null;
  }
};