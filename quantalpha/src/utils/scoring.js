const safe = (val) =>
  val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : null;

export const calculateInvestmentScore = (
  ratios,
  keyMetrics,
  incomeStatements,
  cashFlows
) => {
  const r   = ratios?.[0]          || {};
  const km  = keyMetrics?.[0]      || {};
  const inc = incomeStatements     || [];
  const cf  = cashFlows            || [];

  const roe         = safe(r.returnOnEquity);
  const netMargin   = safe(r.netProfitMargin);
  const roa         = safe(r.returnOnAssets);
  const grossMargin = safe(r.grossProfitMargin);

  const p1 = roe !== null
    ? roe > 0.20 ? 8 : roe > 0.10 ? 5 : roe > 0.05 ? 2 : 0 : 0;
  const p2 = netMargin !== null
    ? netMargin > 0.15 ? 8 : netMargin > 0.08 ? 5 : netMargin > 0.03 ? 2 : 0 : 0;
  const p3 = roa !== null
    ? roa > 0.08 ? 5 : roa > 0.04 ? 3 : 0 : 0;
  const p4 = grossMargin !== null
    ? grossMargin > 0.40 ? 4 : grossMargin > 0.25 ? 2 : 0 : 0;
  const profitabilityScore = p1 + p2 + p3 + p4;

  const pe       = safe(r.priceEarningsRatio);
  const pb       = safe(r.priceToBookRatio);
  const evEbitda = safe(km.enterpriseValueOverEBITDA);

  const v1 = pe !== null && pe > 0
    ? pe < 12 ? 8 : pe < 18 ? 6 : pe < 25 ? 4 : pe < 35 ? 2 : 0 : 0;
  const v2 = pb !== null && pb > 0
    ? pb < 1.5 ? 6 : pb < 3 ? 4 : pb < 5 ? 2 : 0 : 0;
  const v3 = evEbitda !== null && evEbitda > 0
    ? evEbitda < 10 ? 6 : evEbitda < 15 ? 4 : evEbitda < 20 ? 2 : 0 : 0;
  const valuationScore = v1 + v2 + v3;

  let revGrowth = null;
  let epsGrowth = null;

  if (inc.length >= 2) {
    const r0 = safe(inc[0].revenue);
    const r1 = safe(inc[1].revenue);
    if (r0 !== null && r1 !== null && r1 !== 0)
      revGrowth = (r0 - r1) / Math.abs(r1);

    const e0 = safe(inc[0].eps);
    const e1 = safe(inc[1].eps);
    if (e0 !== null && e1 !== null && e1 !== 0)
      epsGrowth = (e0 - e1) / Math.abs(e1);
  }

  const g1 = revGrowth !== null
    ? revGrowth > 0.25 ? 10 : revGrowth > 0.12 ? 7 : revGrowth > 0.05 ? 4 : revGrowth > 0 ? 1 : 0 : 0;
  const g2 = epsGrowth !== null
    ? epsGrowth > 0.20 ? 10 : epsGrowth > 0.10 ? 7 : epsGrowth > 0.03 ? 4 : epsGrowth > 0 ? 1 : 0 : 0;
  const growthScore = g1 + g2;

  const deRatio      = safe(r.debtEquityRatio);
  const currentRatio = safe(r.currentRatio);
  const intCoverage  = safe(r.interestCoverage);
  const quickRatio   = safe(r.quickRatio);

  const h1 = deRatio !== null
    ? deRatio < 0.3 ? 8 : deRatio < 0.7 ? 6 : deRatio < 1.5 ? 3 : 0 : 0;
  const h2 = currentRatio !== null
    ? currentRatio > 2.5 ? 6 : currentRatio > 1.5 ? 4 : currentRatio > 1.0 ? 2 : 0 : 0;
  const h3 = intCoverage !== null
    ? intCoverage > 10 ? 4 : intCoverage > 5 ? 3 : intCoverage > 2 ? 1 : 0 : 0;
  const h4 = quickRatio !== null && quickRatio > 1.0 ? 2 : 0;
  const healthScore = h1 + h2 + h3 + h4;

  const fcf0 = cf.length > 0 ? safe(cf[0].freeCashFlow) : null;
  const fcf1 = cf.length > 1 ? safe(cf[1].freeCashFlow) : null;

  let fcfGrowth = null;
  if (fcf0 !== null && fcf1 !== null && fcf1 !== 0)
    fcfGrowth = (fcf0 - fcf1) / Math.abs(fcf1);

  const c1 = fcf0 !== null ? (fcf0 > 0 ? 8 : 0) : 0;
  const c2 = fcfGrowth !== null
    ? fcfGrowth > 0.15 ? 7 : fcfGrowth > 0.05 ? 5 : fcfGrowth > 0 ? 2 : 0 : 0;
  const cashFlowScore = c1 + c2;

  const total = Math.min(
    100,
    profitabilityScore + valuationScore + growthScore + healthScore + cashFlowScore
  );

  return {
    total,
    breakdown: {
      profitability: { score: profitabilityScore, max: 25, pct: Math.round((profitabilityScore / 25) * 100) },
      valuation:     { score: valuationScore,     max: 20, pct: Math.round((valuationScore / 20) * 100) },
      growth:        { score: growthScore,         max: 20, pct: Math.round((growthScore / 20) * 100) },
      health:        { score: healthScore,          max: 20, pct: Math.round((healthScore / 20) * 100) },
      cashFlow:      { score: cashFlowScore,        max: 15, pct: Math.round((cashFlowScore / 15) * 100) },
    },
    inputs: {
      roe, netMargin, roa, grossMargin,
      pe, pb, evEbitda,
      revGrowth, epsGrowth,
      deRatio, currentRatio, intCoverage,
      fcf0, fcfGrowth,
    },
    verdict: getVerdict(total),
  };
};

const getVerdict = (score) => {
  if (score >= 75) return { label: 'Strong Buy', color: '#22c55e', bg: 'bg-green-500/20',  text: 'text-green-400',  stars: 5 };
  if (score >= 60) return { label: 'Buy',         color: '#84cc16', bg: 'bg-lime-500/20',   text: 'text-lime-400',   stars: 4 };
  if (score >= 45) return { label: 'Hold',         color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', stars: 3 };
  if (score >= 30) return { label: 'Weak',         color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', stars: 2 };
  return             { label: 'Avoid',        color: '#ef4444', bg: 'bg-red-500/20',    text: 'text-red-400',    stars: 1 };
};