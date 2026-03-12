export const fmt = {
  currency: (val, decimals = 2) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    const abs = Math.abs(val);
    if (abs >= 1e12) return `$${(val / 1e12).toFixed(decimals)}T`;
    if (abs >= 1e9)  return `$${(val / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6)  return `$${(val / 1e6).toFixed(decimals)}M`;
    if (abs >= 1e3)  return `$${(val / 1e3).toFixed(decimals)}K`;
    return `$${val.toFixed(decimals)}`;
  },

  price: (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return `$${Number(val).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

  percent: (val, alreadyPercent = false) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    const pct = alreadyPercent ? val : val * 100;
    return `${pct.toFixed(2)}%`;
  },

  ratio: (val, decimals = 2) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return Number(val).toFixed(decimals);
  },

  change: (val) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    const sign = val >= 0 ? '+' : '';
    return `${sign}${Number(val).toFixed(2)}%`;
  },

  number: (val, decimals = 2) => {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    const abs = Math.abs(val);
    if (abs >= 1e12) return `${(val / 1e12).toFixed(decimals)}T`;
    if (abs >= 1e9)  return `${(val / 1e9).toFixed(decimals)}B`;
    if (abs >= 1e6)  return `${(val / 1e6).toFixed(decimals)}M`;
    if (abs >= 1e3)  return `${(val / 1e3).toFixed(decimals)}K`;
    return Number(val).toFixed(decimals);
  },
};

export const isValid = (val) =>
  val !== null && val !== undefined && !isNaN(val);

export const isPositive = (val) => isValid(val) && Number(val) >= 0;

export const colorForChange = (val) => {
  if (val === null || val === undefined || isNaN(Number(val))) return 'text-slate-400';
  return Number(val) >= 0 ? 'text-green-400' : 'text-red-400';
};