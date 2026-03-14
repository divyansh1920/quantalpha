const safe = (val) =>
  val !== null && val !== undefined && !isNaN(Number(val)) ? Number(val) : null;

export const calculateInvestmentScore = (ratios, keyMetrics, incomeStatements, cashFlows) => {
  const r   = ratios?.[0]          || {};
  const km  = keyMetrics?.[0]      || {};
  const inc = incomeStatements     || [];
  const cf  = cashFlows            || [];

  const scored = [];   // { score, max } — only push when data exists

  // ── PROFITABILITY ──────────────────────────────────────
  const roe = safe(r.returnOnEquity);
  if (roe !== null) {
    const s = roe > 0.20 ? 8 : roe > 0.10 ? 5 : roe > 0.05 ? 2 : 0;
    scored.push({ dim: 'profitability', score: s, max: 8 });
  }
  const netMargin = safe(r.netProfitMargin);
  if (netMargin !== null) {
    const s = netMargin > 0.15 ? 8 : netMargin > 0.08 ? 5 : netMargin > 0.03 ? 2 : 0;
    scored.push({ dim: 'profitability', score: s, max: 8 });
  }
  const roa = safe(r.returnOnAssets);
  if (roa !== null) {
    const s = roa > 0.08 ? 5 : roa > 0.04 ? 3 : 0;
    scored.push({ dim: 'profitability', score: s, max: 5 });
  }
  const grossMargin = safe(r.grossProfitMargin);
  if (grossMargin !== null) {
    const s = grossMargin > 0.40 ? 4 : grossMargin > 0.25 ? 2 : 0;
    scored.push({ dim: 'profitability', score: s, max: 4 });
  }

  // ── VALUATION ──────────────────────────────────────────
  const pe = safe(r.priceEarningsRatio);
  if (pe !== null && pe > 0) {
    const s = pe < 12 ? 8 : pe < 18 ? 6 : pe < 25 ? 4 : pe < 35 ? 2 : 0;
    scored.push({ dim: 'valuation', score: s, max: 8 });
  }
  const pb = safe(r.priceToBookRatio);
  if (pb !== null && pb > 0) {
    const s = pb < 1.5 ? 6 : pb < 3 ? 4 : pb < 5 ? 2 : 0;
    scored.push({ dim: 'valuation', score: s, max: 6 });
  }
  const evEbitda = safe(km.enterpriseValueOverEBITDA);
  if (evEbitda !== null && evEbitda > 0) {
    const s = evEbitda < 10 ? 6 : evEbitda < 15 ? 4 : evEbitda < 20 ? 2 : 0;
    scored.push({ dim: 'valuation', score: s, max: 6 });
  }

  // ── GROWTH ─────────────────────────────────────────────
  if (inc.length >= 2) {
    const r0 = safe(inc[0].revenue), r1 = safe(inc[1].revenue);
    if (r0 !== null && r1 !== null && r1 !== 0) {
      const revGrowth = (r0 - r1) / Math.abs(r1);
      const s = revGrowth > 0.25 ? 10 : revGrowth > 0.12 ? 7 : revGrowth > 0.05 ? 4 : revGrowth > 0 ? 1 : 0;
      scored.push({ dim: 'growth', score: s, max: 10 });
    }
    const e0 = safe(inc[0].eps), e1 = safe(inc[1].eps);
    if (e0 !== null && e1 !== null && e1 !== 0) {
      const epsGrowth = (e0 - e1) / Math.abs(e1);
      const s = epsGrowth > 0.20 ? 10 : epsGrowth > 0.10 ? 7 : epsGrowth > 0.03 ? 4 : epsGrowth > 0 ? 1 : 0;
      scored.push({ dim: 'growth', score: s, max: 10 });
    }
  }

  // ── HEALTH ─────────────────────────────────────────────
  const deRatio = safe(r.debtEquityRatio);
  if (deRatio !== null) {
    const s = deRatio < 0.3 ? 8 : deRatio < 0.7 ? 6 : deRatio < 1.5 ? 3 : 0;
    scored.push({ dim: 'health', score: s, max: 8 });
  }
  const currentRatio = safe(r.currentRatio);
  if (currentRatio !== null) {
    const s = currentRatio > 2.5 ? 6 : currentRatio > 1.5 ? 4 : currentRatio > 1.0 ? 2 : 0;
    scored.push({ dim: 'health', score: s, max: 6 });
  }
  const intCoverage = safe(r.interestCoverage);
  if (intCoverage !== null) {
    const s = intCoverage > 10 ? 4 : intCoverage > 5 ? 3 : intCoverage > 2 ? 1 : 0;
    scored.push({ dim: 'health', score: s, max: 4 });
  }

  // ── CASH FLOW ──────────────────────────────────────────
  const fcf0 = cf.length > 0 ? safe(cf[0].freeCashFlow) : null;
  const fcf1 = cf.length > 1 ? safe(cf[1].freeCashFlow) : null;
  if (fcf0 !== null) {
    scored.push({ dim: 'cashFlow', score: fcf0 > 0 ? 8 : 0, max: 8 });
  }
  if (fcf0 !== null && fcf1 !== null && fcf1 !== 0) {
    const fcfGrowth = (fcf0 - fcf1) / Math.abs(fcf1);
    const s = fcfGrowth > 0.15 ? 7 : fcfGrowth > 0.05 ? 5 : fcfGrowth > 0 ? 2 : 0;
    scored.push({ dim: 'cashFlow', score: s, max: 7 });
  }

  // ── NORMALIZE — only score what we have data for ───────
  if (scored.length === 0) return buildResult(0, 0, {});

  const totalEarned = scored.reduce((a, x) => a + x.score, 0);
  const totalMax    = scored.reduce((a, x) => a + x.max, 0);
  const normalized  = Math.round((totalEarned / totalMax) * 100);

  // Dimension breakdown
  const dims = ['profitability','valuation','growth','health','cashFlow'];
  const dimMax = { profitability: 25, valuation: 20, growth: 20, health: 20, cashFlow: 15 };
  const breakdown = {};
  dims.forEach((d) => {
    const items  = scored.filter((x) => x.dim === d);
    const earned = items.reduce((a, x) => a + x.score, 0);
    const avail  = items.reduce((a, x) => a + x.max, 0);
    const norm   = avail > 0 ? Math.round((earned / avail) * dimMax[d]) : null;
    breakdown[d] = {
      score:    norm ?? 0,
      max:      dimMax[d],
      pct:      avail > 0 ? Math.round((earned / avail) * 100) : 0,
      hasData:  items.length > 0,
    };
  });

  const dataCompleteness = Math.round((scored.length / 12) * 100);

  return buildResult(normalized, dataCompleteness, breakdown);
};

function buildResult(total, completeness, breakdown) {
  return {
    total,
    dataCompleteness: completeness,
    breakdown,
    verdict: getVerdict(total),
    isPartial: completeness < 60,
  };
}

const getVerdict = (score) => {
  if (score >= 75) return { label: 'Strong Buy', color: '#22c55e', bg: 'bg-green-500/20',  text: 'text-green-400',  stars: 5 };
  if (score >= 60) return { label: 'Buy',         color: '#84cc16', bg: 'bg-lime-500/20',   text: 'text-lime-400',   stars: 4 };
  if (score >= 45) return { label: 'Hold',         color: '#eab308', bg: 'bg-yellow-500/20', text: 'text-yellow-400', stars: 3 };
  if (score >= 30) return { label: 'Weak',         color: '#f97316', bg: 'bg-orange-500/20', text: 'text-orange-400', stars: 2 };
  return             { label: 'Avoid',        color: '#ef4444', bg: 'bg-red-500/20',    text: 'text-red-400',    stars: 1 };
};