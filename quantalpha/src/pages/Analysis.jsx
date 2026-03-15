import MetricInterpreter from '../components/MetricInterpreter';
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine
} from 'recharts';
import {
  ArrowLeft, TrendingUp, TrendingDown, ExternalLink,
  AlertTriangle, RefreshCw, Building2, Globe,
  DollarSign, Users, Activity
} from 'lucide-react';
import { useStock } from '../context/StockContext';
import Loader from '../components/Loader';
import MetricCard from '../components/MetricCard';
import ScoreGauge from '../components/ScoreGauge';
import { fmt, isValid } from '../utils/formatters';
import { getMarginOfSafety } from '../utils/dcf';

/* ─── Tooltip Definitions ──────────────────────────────────── */
const TOOLTIPS = {
  pe:        'Price-to-Earnings: How much investors pay per $1 of earnings. Lower = cheaper. >35 may be expensive.',
  pb:        'Price-to-Book: Market price vs book value of assets. <1 = trading below asset value.',
  roe:       'Return on Equity: Net profit generated per dollar of shareholder equity. >15% is strong.',
  netMargin: 'Net Profit Margin: What % of revenue becomes profit after all expenses. Higher = more efficient.',
  deRatio:   'Debt-to-Equity: How much debt vs equity the company uses. >2 is considered risky.',
  currentR:  'Current Ratio: Short-term assets vs short-term liabilities. >1.5 means financially comfortable.',
  fcf:       'Free Cash Flow: Cash left after capital expenditures. The real measure of financial health.',
  evEbitda:  'EV/EBITDA: Enterprise value relative to operating earnings. <15 is generally attractive.',
};

/* ─── Custom Chart Tooltip ──────────────────────────────────── */
const ChartTooltip = ({ active, payload, label, prefix = '$', suffix = '' }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {prefix}{typeof p.value === 'number'
            ? Math.abs(p.value) >= 1e9
              ? `${(p.value / 1e9).toFixed(2)}B`
              : Math.abs(p.value) >= 1e6
              ? `${(p.value / 1e6).toFixed(2)}M`
              : p.value.toFixed(2)
            : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

/* ─── Section Header ────────────────────────────────────────── */
const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-white font-bold text-lg">{title}</h2>
    {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
  </div>
);

/* ─── Ratio Row ─────────────────────────────────────────────── */
const RatioRow = ({ label, value, benchmark, tooltip }) => {
  const [show, setShow] = React.useState(false);
  const good = value !== 'N/A' && benchmark && parseFloat(value) <= benchmark;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-700/50 relative">
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-sm">{label}</span>
        {tooltip && (
          <div className="relative">
            <span
              className="text-slate-600 hover:text-slate-400 cursor-pointer text-xs"
              onMouseEnter={() => setShow(true)}
              onMouseLeave={() => setShow(false)}
            >ⓘ</span>
            {show && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-700
                border border-slate-600 text-slate-300 text-xs rounded-lg p-2.5
                z-50 leading-relaxed shadow-xl">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm">{value}</span>
        {benchmark && value !== 'N/A' && (
          <span className={`w-2 h-2 rounded-full ${good ? 'bg-green-400' : 'bg-red-400'}`} />
        )}
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────── */
export default function Analysis() {
  const { ticker }                    = useParams();
  const navigate                      = useNavigate();
  const { stockData, loading, error, analyzeStock } = useStock();

  useEffect(() => {
    if (ticker && (!stockData || stockData.ticker !== ticker)) {
      analyzeStock(ticker);
    }
  }, [ticker, stockData, analyzeStock]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Loader message={`Analyzing ${ticker}...`} />
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-white font-bold text-xl mb-2">Analysis Failed</h2>
          <p className="text-slate-400 text-sm mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => analyzeStock(ticker)}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400
                text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw size={15} /> Retry
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600
                text-white rounded-lg text-sm font-medium transition-colors"
            >
              <ArrowLeft size={15} /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── No data yet ── */
  if (!stockData || stockData.ticker !== ticker) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">No data loaded.</p>
          <button onClick={() => analyzeStock(ticker)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm">
            Load Analysis
          </button>
        </div>
      </div>
    );
  }

  const {
    profile, quote, incomeStatements,
    cashFlows, ratios, keyMetrics, historicalPrice,
    investmentScore, dcfCalculated, fmpDcf, rating
  } = stockData;

  const r0  = ratios?.[0]       || {};
  const km0 = keyMetrics?.[0]   || {};
  const inc0= incomeStatements?.[0] || {};
  const cf0 = cashFlows?.[0]    || {};

  const currentPrice = quote?.price || profile?.price || 0;
  const change       = quote?.changesPercentage || 0;
  const isUp         = change >= 0;

  /* ── Chart Data ── */
  const priceChartData = (historicalPrice || []).filter((_, i) => i % 3 === 0).slice(-120);

  const revenueChartData = [...(incomeStatements || [])]
    .reverse()
    .map((s) => ({
      year:        s.calendarYear || s.date?.slice(0, 4) || '',
      Revenue:     s.revenue      || 0,
      NetIncome:   s.netIncome    || 0,
      GrossProfit: s.grossProfit  || 0,
    }));

  const cashFlowChartData = [...(cashFlows || [])]
    .reverse()
    .map((c) => ({
      year:    c.calendarYear || c.date?.slice(0, 4) || '',
      FCF:     c.freeCashFlow         || 0,
      OpCF:    c.operatingCashFlow    || 0,
      CapEx:   -(c.capitalExpenditure || 0),
    }));

  /* ── Score breakdown for bar display ── */
  const scoreBreakdown = investmentScore?.breakdown
    ? Object.entries(investmentScore.breakdown).map(([key, val]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        score: val.score,
        max:   val.max,
        pct:   val.pct,
      }))
    : [];

  /* ── DCF ── */
  const dcf        = dcfCalculated || null;
  const dcfPrice   = dcf?.intrinsicPerShare || fmpDcf?.dcf || null;
  const mos        = dcfPrice ? getMarginOfSafety(dcfPrice, currentPrice) : null;

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* ── Back Button ── */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white
            transition-colors text-sm mb-6"
        >
          <ArrowLeft size={16} /> Back to Search
        </button>

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — COMPANY HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Left: Company info */}
            <div className="flex items-start gap-4">
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={ticker}
                  className="w-14 h-14 rounded-xl object-contain bg-white p-1"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <div className="w-14 h-14 bg-slate-700 rounded-xl flex items-center
                  justify-center text-white font-bold text-lg">
                  {ticker?.slice(0, 2)}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-white font-bold text-2xl">{ticker}</h1>
                  <span className="px-2.5 py-0.5 bg-slate-700 text-slate-300
                    text-xs rounded-full font-medium">
                    {profile?.exchangeShortName || 'NYSE/NASDAQ'}
                  </span>
                  {rating?.rating && (
                    <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400
                      text-xs rounded-full font-medium border border-sky-500/30">
                      {rating.rating}
                    </span>
                  )}
                </div>
                <p className="text-slate-300 text-sm mt-0.5 font-medium">
                  {profile?.companyName || 'N/A'}
                </p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  {profile?.sector && (
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Building2 size={11} /> {profile.sector}
                    </span>
                  )}
                  {profile?.industry && (
                    <span className="text-slate-500 text-xs">· {profile.industry}</span>
                  )}
                  {profile?.country && (
                    <span className="flex items-center gap-1 text-slate-400 text-xs">
                      <Globe size={11} /> {profile.country}
                    </span>
                  )}
                  {profile?.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sky-400 text-xs hover:underline"
                    >
                      <ExternalLink size={11} /> Website
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Price */}
            <div className="text-right">
              <div className="text-3xl font-black text-white">
                {fmt.price(currentPrice)}
              </div>
              <div className={`flex items-center justify-end gap-1 mt-1
                ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                <span className="font-semibold text-sm">{fmt.change(change)}</span>
                <span className="text-xs opacity-70">today</span>
              </div>
              <div className="flex items-center justify-end gap-4 mt-2">
                <div className="text-xs text-slate-400">
                  52W High: <span className="text-white">{fmt.price(quote?.yearHigh)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  52W Low: <span className="text-white">{fmt.price(quote?.yearLow)}</span>
                </div>
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Mkt Cap: <span className="text-white font-medium">
                  {fmt.currency(profile?.mktCap || quote?.marketCap)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          {profile?.description && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-3">
                {profile.description}
              </p>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — AI INVESTMENT SCORE
        ══════════════════════════════════════════════════════ */}
        {investmentScore && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <SectionHeader
              title="AI Investment Score"
              subtitle="Proprietary 5-dimension scoring across profitability, valuation, growth, health & cash flow"
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Gauge */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <ScoreGauge
                  score={investmentScore.total}
                  verdict={investmentScore.verdict}
                />
                <div className={`px-4 py-1.5 rounded-full text-sm font-bold
                  ${investmentScore.verdict?.bg} ${investmentScore.verdict?.text}
                  border border-current/30`}>
                  {investmentScore.verdict?.label}
                </div>
                <p className="text-slate-500 text-xs text-center max-w-[140px]">
                  Score out of 100 based on 25+ financial metrics
                </p>
              </div>

              {/* Breakdown bars */}
              <div className="flex-1 w-full">
                <p className="text-slate-400 text-xs mb-4 font-medium uppercase tracking-wide">
                  Score Breakdown
                </p>
                <div className="space-y-3">
                  {scoreBreakdown.map(({ name, score, max, pct }) => {
                    const barColor =
                      pct >= 75 ? 'bg-green-500'  :
                      pct >= 50 ? 'bg-sky-500'     :
                      pct >= 25 ? 'bg-yellow-500'  : 'bg-red-500';
                    return (
                      <div key={name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-slate-300 text-sm font-medium">{name}</span>
                          <span className="text-white text-sm font-bold">
                            {score} <span className="text-slate-500 font-normal">/ {max}</span>
                          </span>
                        </div>
                        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scoring legend */}
                <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-700">
                  {[
                    { label: '75–100 Strong Buy', color: 'bg-green-500' },
                    { label: '60–74  Buy',        color: 'bg-lime-500'  },
                    { label: '45–59  Hold',       color: 'bg-yellow-500'},
                    { label: '30–44  Weak',       color: 'bg-orange-500'},
                    { label: '0–29   Avoid',      color: 'bg-red-500'  },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — KEY METRICS
        ══════════════════════════════════════════════════════ */}
        <div className="mb-6">
          <SectionHeader
            title="Key Financial Metrics"
            subtitle="Live data — hover the ⓘ icon on any metric to learn what it means"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <MetricCard
              label="P/E Ratio"
              value={fmt.ratio(r0.priceEarningsRatio)}
              subtext="Price / Earnings"
              color={isValid(r0.priceEarningsRatio) && r0.priceEarningsRatio < 25
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.pe}
            />
            <MetricCard
              label="P/B Ratio"
              value={fmt.ratio(r0.priceToBookRatio)}
              subtext="Price / Book Value"
              color={isValid(r0.priceToBookRatio) && r0.priceToBookRatio < 3
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.pb}
            />
            <MetricCard
              label="EV / EBITDA"
              value={fmt.ratio(km0.enterpriseValueOverEBITDA)}
              subtext="Enterprise Value Ratio"
              color={isValid(km0.enterpriseValueOverEBITDA) && km0.enterpriseValueOverEBITDA < 15
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.evEbitda}
            />
            <MetricCard
              label="Return on Equity"
              value={fmt.percent(r0.returnOnEquity)}
              subtext="Net Income / Equity"
              color={isValid(r0.returnOnEquity) && r0.returnOnEquity > 0.15
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.roe}
            />
            <MetricCard
              label="Net Margin"
              value={fmt.percent(r0.netProfitMargin)}
              subtext="Profit % of Revenue"
              color={isValid(r0.netProfitMargin) && r0.netProfitMargin > 0.1
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.netMargin}
            />
            <MetricCard
              label="Gross Margin"
              value={fmt.percent(r0.grossProfitMargin)}
              subtext="Gross Profit % of Revenue"
              color="text-white"
            />
            <MetricCard
              label="Debt / Equity"
              value={fmt.ratio(r0.debtEquityRatio)}
              subtext="Financial Leverage"
              color={isValid(r0.debtEquityRatio) && r0.debtEquityRatio < 1
                ? 'text-green-400' : 'text-red-400'}
              tooltip={TOOLTIPS.deRatio}
            />
            <MetricCard
              label="Current Ratio"
              value={fmt.ratio(r0.currentRatio)}
              subtext="Short-Term Liquidity"
              color={isValid(r0.currentRatio) && r0.currentRatio > 1.5
                ? 'text-green-400' : 'text-orange-400'}
              tooltip={TOOLTIPS.currentR}
            />
            <MetricCard
              label="Free Cash Flow"
              value={fmt.currency(cf0.freeCashFlow)}
              subtext="Annual FCF"
              color={isValid(cf0.freeCashFlow) && cf0.freeCashFlow > 0
                ? 'text-green-400' : 'text-red-400'}
              tooltip={TOOLTIPS.fcf}
            />
            <MetricCard
              label="Revenue"
              value={fmt.currency(inc0.revenue)}
              subtext="Annual Revenue"
              color="text-white"
            />
            <MetricCard
              label="Net Income"
              value={fmt.currency(inc0.netIncome)}
              subtext="Annual Net Income"
              color={isValid(inc0.netIncome) && inc0.netIncome > 0
                ? 'text-green-400' : 'text-red-400'}
            />
            <MetricCard
              label="EPS"
              value={fmt.price(inc0.eps)}
              subtext="Earnings Per Share"
              color={isValid(inc0.eps) && inc0.eps > 0
                ? 'text-green-400' : 'text-red-400'}
            />
          </div>
        </div>
        
        {/* ── Metric Interpreter ── */}
        {ratios?.[0] && cashFlows?.[0] && (
          <MetricInterpreter
            metrics={{
              priceEarningsRatio: r0.priceEarningsRatio,
              priceToBookRatio:   r0.priceToBookRatio,
              returnOnEquity:     r0.returnOnEquity,
              netProfitMargin:    r0.netProfitMargin,
              debtEquityRatio:    r0.debtEquityRatio,
              currentRatio:       r0.currentRatio,
              freeCashFlow:       cf0.freeCashFlow,
            }}
          />
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — PRICE CHART
        ══════════════════════════════════════════════════════ */}
        {priceChartData.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <SectionHeader
              title="Price History (1 Year)"
              subtitle={`${ticker} closing price over last 12 months`}
            />
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={priceChartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => v?.slice(0, 7) || ''}
                  interval={Math.floor(priceChartData.length / 6)}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `$${v}`}
                  domain={['auto', 'auto']}
                  width={60}
                />
                <Tooltip content={<ChartTooltip prefix="$" />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  name="Price"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — REVENUE & INCOME CHART
        ══════════════════════════════════════════════════════ */}
        {revenueChartData.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <SectionHeader
              title="Revenue & Profitability Trend"
              subtitle="Annual revenue, gross profit and net income over time"
            />
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueChartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip prefix="" />} />
                <Bar dataKey="Revenue"     name="Revenue"     fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="GrossProfit" name="Gross Profit" fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="NetIncome"   name="Net Income"  fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — CASH FLOW CHART
        ══════════════════════════════════════════════════════ */}
        {cashFlowChartData.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <SectionHeader
              title="Cash Flow Analysis"
              subtitle="Free cash flow, operating cash flow and capital expenditure trend"
            />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cashFlowChartData} margin={{ top: 5, right: 5, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(v) => `${(v / 1e9).toFixed(0)}B`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip prefix="" />} />
                <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
                <Bar dataKey="OpCF"  name="Operating CF" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                <Bar dataKey="FCF"   name="Free CF"      fill="#22c55e" radius={[3, 3, 0, 0]} />
                <Bar dataKey="CapEx" name="CapEx"        fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — DCF VALUATION
        ══════════════════════════════════════════════════════ */}
        {dcfPrice && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
            <SectionHeader
              title="Intrinsic Value Estimate (DCF)"
              subtitle="Two-stage discounted cash flow model — 5-year projection + terminal value"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Current Price */}
              <div className="bg-slate-700/50 rounded-xl p-4 text-center">
                <DollarSign size={20} className="text-slate-400 mx-auto mb-1" />
                <p className="text-slate-400 text-xs mb-1">Current Market Price</p>
                <p className="text-white font-black text-2xl">{fmt.price(currentPrice)}</p>
              </div>

              {/* Intrinsic Value */}
              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 text-center">
                <Activity size={20} className="text-sky-400 mx-auto mb-1" />
                <p className="text-slate-400 text-xs mb-1">Estimated Intrinsic Value</p>
                <p className="text-sky-400 font-black text-2xl">{fmt.price(dcfPrice)}</p>
              </div>

              {/* Margin of Safety */}
              {mos && (
                <div className={`rounded-xl p-4 text-center border
                  ${mos.pct > 0
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-red-500/10 border-red-500/30'}`}>
                  <Users size={20} className={`mx-auto mb-1 ${mos.textClass}`} />
                  <p className="text-slate-400 text-xs mb-1">Margin of Safety</p>
                  <p className={`font-black text-2xl ${mos.textClass}`}>
                    {mos.pct > 0 ? '+' : ''}{mos.pct.toFixed(1)}%
                  </p>
                  <p className={`text-xs mt-1 font-medium ${mos.textClass}`}>{mos.label}</p>
                </div>
              )}
            </div>

            {/* Assumptions */}
            {dcf?.assumptions && (
              <div className="bg-slate-900/50 rounded-xl p-4">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
                  Model Assumptions
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs">FCF Growth Rate</span>
                    <p className="text-white font-semibold">{dcf.assumptions.growthRate}% / yr</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Discount Rate (WACC)</span>
                    <p className="text-white font-semibold">{dcf.assumptions.discountRate}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs">Terminal Growth</span>
                    <p className="text-white font-semibold">{dcf.assumptions.terminalGrowthRate}%</p>
                  </div>
                </div>
                <p className="text-slate-600 text-xs mt-3">
                  ⚠ DCF models are sensitive to assumptions. This is for educational purposes only — not financial advice.
                </p>
              </div>
            )}

            {/* Projection table */}
            {dcf?.projections && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-slate-500 py-2 pr-4 font-medium">Year</th>
                      <th className="text-right text-slate-500 py-2 pr-4 font-medium">Projected FCF</th>
                      <th className="text-right text-slate-500 py-2 font-medium">Present Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcf.projections.map((row) => (
                      <tr key={row.year} className="border-b border-slate-800">
                        <td className="text-slate-300 py-2 pr-4">{row.year}</td>
                        <td className="text-right text-white py-2 pr-4 font-medium">
                          {fmt.currency(row.fcf)}
                        </td>
                        <td className="text-right text-sky-400 py-2 font-medium">
                          {fmt.currency(row.pv)}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-b border-slate-700">
                      <td className="text-slate-300 py-2 pr-4">Terminal Value</td>
                      <td className="text-right text-white py-2 pr-4 font-medium">—</td>
                      <td className="text-right text-purple-400 py-2 font-medium">
                        {fmt.currency(dcf.terminalPV)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-white font-bold py-2 pr-4">Total Intrinsic Value</td>
                      <td className="text-right py-2 pr-4">—</td>
                      <td className="text-right text-green-400 font-bold py-2">
                        {fmt.currency(dcf.totalValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — DETAILED RATIOS TABLE
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Valuation Ratios */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <SectionHeader title="Valuation Ratios" />
            <RatioRow label="P/E Ratio"          value={fmt.ratio(r0.priceEarningsRatio)} benchmark={35}  tooltip={TOOLTIPS.pe} />
            <RatioRow label="P/B Ratio"           value={fmt.ratio(r0.priceToBookRatio)}   benchmark={5}   tooltip={TOOLTIPS.pb} />
            <RatioRow label="P/S Ratio"           value={fmt.ratio(r0.priceToSalesRatio)}  benchmark={5}   />
            <RatioRow label="P/FCF Ratio"         value={fmt.ratio(r0.priceToFreeCashFlowsRatio)} benchmark={30} />
            <RatioRow label="EV/EBITDA"           value={fmt.ratio(km0.enterpriseValueOverEBITDA)} benchmark={20} tooltip={TOOLTIPS.evEbitda} />
            <RatioRow label="EV/Revenue"          value={fmt.ratio(km0.evToSales)}         benchmark={10}  />
            <RatioRow label="Dividend Yield"      value={fmt.percent(r0.dividendYield)}    />
            <RatioRow label="Earnings Yield"      value={fmt.percent(r0.earningsYield)}    />
          </div>

          {/* Profitability & Health */}
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
            <SectionHeader title="Profitability & Health" />
            <RatioRow label="Gross Margin"        value={fmt.percent(r0.grossProfitMargin)}    />
            <RatioRow label="Operating Margin"    value={fmt.percent(r0.operatingProfitMargin)} />
            <RatioRow label="Net Profit Margin"   value={fmt.percent(r0.netProfitMargin)}      tooltip={TOOLTIPS.netMargin} />
            <RatioRow label="Return on Equity"    value={fmt.percent(r0.returnOnEquity)}       tooltip={TOOLTIPS.roe} />
            <RatioRow label="Return on Assets"    value={fmt.percent(r0.returnOnAssets)}       />
            <RatioRow label="Return on Capital"   value={fmt.percent(r0.returnOnCapitalEmployed)} />
            <RatioRow label="Debt / Equity"       value={fmt.ratio(r0.debtEquityRatio)}        benchmark={2}   tooltip={TOOLTIPS.deRatio} />
            <RatioRow label="Interest Coverage"   value={fmt.ratio(r0.interestCoverage)}       />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — ANALYST RATING & DISCLAIMER
        ══════════════════════════════════════════════════════ */}
        {rating && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
            <SectionHeader
              title="Analyst Rating Summary"
              subtitle="Based on FMP aggregated analyst consensus"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Overall Rating',      value: rating.rating,              color: 'text-sky-400'    },
                { label: 'DCF Score',           value: rating.ratingDetailsDCFScore !== undefined ? `${rating.ratingDetailsDCFScore}/5` : 'N/A', color: 'text-green-400'  },
                { label: 'ROE Score',           value: rating.ratingDetailsROEScore !== undefined ? `${rating.ratingDetailsROEScore}/5` : 'N/A', color: 'text-purple-400' },
                { label: 'P/B Score',           value: rating.ratingDetailsPBScore  !== undefined ? `${rating.ratingDetailsPBScore}/5`  : 'N/A', color: 'text-yellow-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-slate-700/50 rounded-xl p-3 text-center">
                  <p className="text-slate-400 text-xs mb-1">{label}</p>
                  <p className={`font-bold text-lg ${color}`}>{value || 'N/A'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
          <p className="text-amber-400/70 text-xs leading-relaxed">
            ⚠ <strong>Educational Purposes Only.</strong> This analysis is generated using
            publicly available financial data and quantitative models. It is not financial
            advice. Always conduct your own research before making any investment decisions.
            Past performance does not guarantee future results.
          </p>
        </div>

      </div>
    </div>
  );
}