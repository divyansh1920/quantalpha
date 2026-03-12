import { useState, useCallback } from 'react';
import {
  getCompanyProfile,
  getQuote,
  getIncomeStatement,
  getBalanceSheet,
  getCashFlow,
  getFinancialRatios,
  getKeyMetrics,
  getDCFValue,
  getRating,
  getHistoricalPrice,
} from '../api/fmp';
import { calculateInvestmentScore } from '../utils/scoring';
import { calculateDCF } from '../utils/dcf';
import { StockContext } from './StockContextProvider';

export const StockProvider = ({ children }) => {
  const [stockData, setStockData]     = useState(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');

  const analyzeStock = useCallback(async (ticker) => {
    const symbol = ticker.toUpperCase().trim();
    if (!symbol) return;

    setLoading(true);
    setError(null);
    setStockData(null);
    setCurrentTicker(symbol);

    try {
      // All requests run in parallel — fail gracefully per request
      const [
        profileRes,
        quoteRes,
        incomeRes,
        balanceRes,
        cashRes,
        ratiosRes,
        metricsRes,
        dcfRes,
        ratingRes,
        histRes,
      ] = await Promise.allSettled([
        getCompanyProfile(symbol),
        getQuote(symbol),
        getIncomeStatement(symbol),
        getBalanceSheet(symbol),
        getCashFlow(symbol),
        getFinancialRatios(symbol),
        getKeyMetrics(symbol),
        getDCFValue(symbol),
        getRating(symbol),
        getHistoricalPrice(symbol),
      ]);

      const ok  = (r) => r.status === 'fulfilled' ? r.value : null;
      const err = (r) => r.status === 'rejected'  ? r.reason?.message : null;

      const profile    = ok(profileRes);
      const quote      = ok(quoteRes);
      const income     = ok(incomeRes);
      const balance    = ok(balanceRes);
      const cashFlow   = ok(cashRes);
      const ratios     = ok(ratiosRes);
      const metrics    = ok(metricsRes);
      const fmpDcf     = ok(dcfRes);
      const rating     = ok(ratingRes);
      const historical = ok(histRes);

      // If both critical requests fail, show error
      if (!profile && !quote) {
        const reason = err(profileRes) || `Ticker "${symbol}" not found or API limit reached.`;
        throw new Error(reason);
      }

      const investmentScore = calculateInvestmentScore(ratios, metrics, income, balance, cashFlow);
      const dcfCalculated   = calculateDCF(cashFlow, income, profile);

      setStockData({
        ticker: symbol,
        profile,
        quote,
        incomeStatements: income,
        balanceSheets:    balance,
        cashFlows:        cashFlow,
        ratios,
        keyMetrics:       metrics,
        fmpDcf,
        rating,
        historicalPrice:  historical,
        investmentScore,
        dcfCalculated,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setStockData(null);
    setError(null);
    setCurrentTicker('');
  }, []);

  return (
    <StockContext.Provider value={{ stockData, loading, error, currentTicker, analyzeStock, clearData }}>
      {children}
    </StockContext.Provider>
  );
};