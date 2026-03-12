export const calculateDCF = (cashFlows, incomeStatements, profile) => {
  if (!cashFlows || cashFlows.length === 0) return null;

  const latestFCF = cashFlows[0]?.freeCashFlow;
  const shares =
    profile?.sharesOutstanding ||
    incomeStatements?.[0]?.weightedAverageShsOut ||
    null;

  if (!latestFCF || latestFCF <= 0 || !shares || shares <= 0) return null;

  let estimatedGrowth = 0.07;
  if (cashFlows.length >= 2) {
    const prev = cashFlows[1]?.freeCashFlow;
    if (prev && prev > 0) {
      const raw = (latestFCF - prev) / prev;
      estimatedGrowth = Math.max(-0.05, Math.min(0.30, raw));
    }
  }

  const DISCOUNT_RATE   = 0.10;
  const TERMINAL_GROWTH = 0.025;
  const YEARS           = 5;

  const projections = [];
  let fcf = latestFCF;
  for (let yr = 1; yr <= YEARS; yr++) {
    fcf = fcf * (1 + estimatedGrowth);
    const pv = fcf / Math.pow(1 + DISCOUNT_RATE, yr);
    projections.push({ year: `Y+${yr}`, fcf: Math.round(fcf), pv: Math.round(pv) });
  }

  const terminalFCF   = projections[YEARS - 1].fcf * (1 + TERMINAL_GROWTH);
  const terminalValue = terminalFCF / (DISCOUNT_RATE - TERMINAL_GROWTH);
  const terminalPV    = terminalValue / Math.pow(1 + DISCOUNT_RATE, YEARS);

  const sumPV              = projections.reduce((acc, p) => acc + p.pv, 0);
  const totalValue         = sumPV + terminalPV;
  const intrinsicPerShare  = totalValue / shares;

  return {
    intrinsicPerShare: Math.round(intrinsicPerShare * 100) / 100,
    totalValue:        Math.round(totalValue),
    terminalPV:        Math.round(terminalPV),
    sumPV:             Math.round(sumPV),
    projections,
    assumptions: {
      growthRate:        (estimatedGrowth * 100).toFixed(1),
      discountRate:      (DISCOUNT_RATE * 100).toFixed(1),
      terminalGrowthRate:(TERMINAL_GROWTH * 100).toFixed(1),
      latestFCF,
      shares,
    },
  };
};

export const getMarginOfSafety = (intrinsic, currentPrice) => {
  if (!intrinsic || !currentPrice || currentPrice <= 0) return null;
  const pct = ((intrinsic - currentPrice) / currentPrice) * 100;
  if (pct > 40)  return { label: 'Deeply Undervalued',       color: '#22c55e', textClass: 'text-green-400',  pct };
  if (pct > 15)  return { label: 'Undervalued',              color: '#84cc16', textClass: 'text-lime-400',   pct };
  if (pct > -15) return { label: 'Fairly Valued',            color: '#eab308', textClass: 'text-yellow-400', pct };
  if (pct > -35) return { label: 'Overvalued',               color: '#f97316', textClass: 'text-orange-400', pct };
  return           { label: 'Significantly Overvalued', color: '#ef4444', textClass: 'text-red-400',    pct };
};