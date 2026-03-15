import { createContext, useContext, useState, useCallback } from 'react';
import {
  getCompanyProfile, getQuote, getIncomeStatement, getBalanceSheet,
  getCashFlow, getFinancialRatios, getKeyMetrics, getDCFValue,
  getRating, getHistoricalPrice,
} from '../api/fmp';
import {
  getTwelveQuote, getOHLCV, getIndianFundamentals, isIndianStock,
} from '../api/twelvedata';
import { calculateInvestmentScore } from '../utils/scoring';
import { calculateDCF } from '../utils/dcf';

const StockContext = createContext(null);

export function StockProvider({ children }) {
  const [stockData, setStockData]         = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [currentTicker, setCurrentTicker] = useState('');

  const analyzeStock = useCallback(async (ticker) => {
    const symbol = ticker.toUpperCase().trim();
    if (!symbol) return;
    setLoading(true);
    setError(null);
    setStockData(null);
    setCurrentTicker(symbol);
    try {
      if (isIndianStock(symbol)) {
        const [twelveQuote, twelveHistory, fundamentals] = await Promise.all([
          getTwelveQuote(symbol),
          getOHLCV(symbol, 365),
          getIndianFundamentals(symbol),
        ]);
        if (!twelveQuote) {
          throw new Error(
            `Could not fetch "${symbol}". Use NSE format — e.g. RELIANCE.NS, TCS.NS`
          );
        }
        const profile = {
          symbol,
          companyName:       twelveQuote.name,
          exchangeShortName: 'NSE',
          currency:          'INR',
          price:             twelveQuote.price,
          mktCap:            null,
          sector:            null,
          industry:          null,
          country:           'IN',
          description:       null,
          image:             null,
        };
        const investmentScore = calculateInvestmentScore(
          fundamentals.ratios, null,
          fundamentals.income, fundamentals.cashFlow
        );
        const dcfCalculated = calculateDCF(
          fundamentals.cashFlow, fundamentals.income, profile
        );
        setStockData({
          ticker:           symbol,
          isIndian:         true,
          profile,
          quote:            twelveQuote,
          incomeStatements: fundamentals.income,
          balanceSheets:    fundamentals.balance,
          cashFlows:        fundamentals.cashFlow,
          ratios:           fundamentals.ratios,
          keyMetrics:       null,
          fmpDcf:           null,
          rating:           null,
          historicalPrice:  twelveHistory,
          investmentScore,
          dcfCalculated,
        });
      } else {
        const results = await Promise.allSettled([
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
        const val = (i) => results[i].status === 'fulfilled' ? results[i].value : null;
        const profile    = val(0);
        const quote      = val(1);
        const income     = val(2);
        const balance    = val(3);
        const cashFlow   = val(4);
        const ratios     = val(5);
        const metrics    = val(6);
        const fmpDcf     = val(7);
        const rating     = val(8);
        const historical = val(9);
        if (!profile && !quote) {
          throw new Error(
            results[0].reason?.message ||
            `"${symbol}" not found. For Indian stocks use .NS — e.g. RELIANCE.NS`
          );
        }
        const investmentScore = calculateInvestmentScore(ratios, metrics, income, cashFlow);
        const dcfCalculated   = calculateDCF(cashFlow, income, profile);
        setStockData({
          ticker: symbol, isIndian: false,
          profile, quote,
          incomeStatements: income,
          balanceSheets:    balance,
          cashFlows:        cashFlow,
          ratios, keyMetrics: metrics,
          fmpDcf, rating,
          historicalPrice:  historical,
          investmentScore, dcfCalculated,
        });
      }
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
    <StockContext.Provider value={{
      stockData, loading, error, currentTicker, analyzeStock, clearData,
    }}>
      {children}
    </StockContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStock() {  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock must be used inside StockProvider');
  return ctx;
}
