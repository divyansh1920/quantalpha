import { useContext } from 'react';
import { StockContext } from './StockContextProvider';

export const useStock = () => {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error('useStock must be used inside <StockProvider>');
  return ctx;
};
