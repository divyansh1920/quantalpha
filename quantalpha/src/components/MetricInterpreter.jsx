import { useState } from 'react';
import { Info, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';

const interpretMetric = (key, value) => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return { signal: 'neutral', label: 'No Data', explanation: 'This metric is not available for this company.', color: 'text-slate-400', bg: 'bg-slate-700/50', border: 'border-slate-600' };
  }
  const v = Number(value);

  const signals = {
    priceEarningsRatio: () => {
      if (v <= 0) return { signal: 'negative', label: 'Negative Earnings', explanation: `P/E is ${v.toFixed(1)}x. The company is currently unprofitable. This doesn't automatically mean avoid — many growth companies lose money while building. Ask: is there a clear path to profitability?`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (v < 12) return { signal: 'positive', label: 'Potentially Undervalued', explanation: `P/E of ${v.toFixed(1)}x is low — you're paying just $${v.toFixed(0)} for every $1 of earnings. Either this is a genuine bargain, or the market expects earnings to decline. Investigate why it's this cheap.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 20) return { signal: 'positive', label: 'Fairly Valued', explanation: `P/E of ${v.toFixed(1)}x is in the "fair value" range for most stable businesses. The market isn't pricing in explosive growth, which also means less downside risk from multiple compression.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 35) return { signal: 'neutral', label: 'Growth Premium', explanation: `P/E of ${v.toFixed(1)}x reflects a growth expectation. This is reasonable only if revenue and earnings are growing 15%+ annually. Check the growth metrics — if growth is strong, this valuation is justified.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      return { signal: 'negative', label: 'Expensive Valuation', explanation: `P/E of ${v.toFixed(1)}x requires exceptional growth to justify. At this price, you need earnings to grow 25%+ annually for years. If growth disappoints, the stock could fall significantly even if the business is "doing fine."`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    },

    priceToBookRatio: () => {
      if (v < 0) return { signal: 'negative', label: 'Negative Book Value', explanation: `P/B is negative, meaning the company's liabilities exceed its assets. This is a serious red flag for traditional businesses — though common in software companies where intangible assets aren't on the balance sheet.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (v < 1) return { signal: 'positive', label: 'Below Asset Value', explanation: `P/B of ${v.toFixed(2)}x means you're buying the company for less than the value of its assets. Benjamin Graham's classic "margin of safety" — but verify the assets are real and not deteriorating.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 3) return { signal: 'positive', label: 'Reasonable', explanation: `P/B of ${v.toFixed(2)}x is moderate. The market is pricing in some value above physical assets (brand, IP, goodwill) but not excessively so. Acceptable for most industries.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 8) return { signal: 'neutral', label: 'Asset-Light Premium', explanation: `P/B of ${v.toFixed(2)}x is high relative to book value. For tech/software companies, this is normal — their most valuable assets (software, brand, talent) don't appear on the balance sheet. For manufacturing or banking, this would be expensive.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      return { signal: 'negative', label: 'Very High Premium', explanation: `P/B of ${v.toFixed(2)}x means the market values this company at ${v.toFixed(0)}x its net asset value. The business must generate extraordinary returns on equity to justify this. Check ROE — if it's consistently above 20%, the premium may be earned.`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    },

    returnOnEquity: () => {
      const pct = v * 100;
      if (pct < 0) return { signal: 'negative', label: 'Destroying Value', explanation: `ROE of ${pct.toFixed(1)}% is negative. For every $100 of shareholder money, management is losing $${Math.abs(pct).toFixed(1)}. Either the business is in distress, or heavy one-time charges distorted the figure. Investigate the income statement.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (pct < 8) return { signal: 'negative', label: 'Below Average', explanation: `ROE of ${pct.toFixed(1)}% is weak. Management is generating less than $8 for every $100 of shareholder equity — below what you could earn in a passive index fund. Why would you take the extra risk for these returns?`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      if (pct < 15) return { signal: 'neutral', label: 'Average', explanation: `ROE of ${pct.toFixed(1)}% is decent but not exceptional. The company is generating moderate returns. Acceptable, but Buffett prefers companies sustaining ROE above 15% consistently.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      if (pct < 25) return { signal: 'positive', label: 'Strong', explanation: `ROE of ${pct.toFixed(1)}% is strong. Management is efficiently deploying shareholder capital. This level of ROE often indicates a competitive advantage — the company earns superior returns that competitors can't easily replicate.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      return { signal: 'positive', label: 'World-Class', explanation: `ROE of ${pct.toFixed(1)}% is exceptional. Very few businesses sustain this level — Apple, Visa, Mastercard are examples. Verify it's from genuine profitability, not excessive debt. If debt-to-equity is below 1.0 and ROE is this high, you may have found a remarkable business.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    },

    netProfitMargin: () => {
      const pct = v * 100;
      if (pct < 0) return { signal: 'negative', label: 'Unprofitable', explanation: `Net margin of ${pct.toFixed(1)}% means the company is losing money. For every $100 in sales, it loses $${Math.abs(pct).toFixed(1)}. Not automatically bad — Amazon was unprofitable for years while building its flywheel. The question is: is there a credible path to profitability?`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (pct < 5) return { signal: 'neutral', label: 'Thin Margins', explanation: `Net margin of ${pct.toFixed(1)}% is thin. For every $100 in revenue, only $${pct.toFixed(1)} becomes profit. This is normal for grocers and distributors. But it means any cost shock (inflation, supply chain) can wipe out profits instantly. Requires high volume to compensate.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      if (pct < 15) return { signal: 'neutral', label: 'Healthy', explanation: `Net margin of ${pct.toFixed(1)}% is solid for most industries. The company keeps $${pct.toFixed(1)} of every $100 in revenue as profit after all expenses. Compare to industry peers — this may be excellent or average depending on the sector.`, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
      return { signal: 'positive', label: 'Excellent Margins', explanation: `Net margin of ${pct.toFixed(1)}% is outstanding. For every $100 in revenue, $${pct.toFixed(1)} flows to the bottom line. This level of margin typically indicates pricing power — the company can charge more than competitors because customers won't leave. This is the hallmark of a great business.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    },

    debtEquityRatio: () => {
      if (v < 0) return { signal: 'positive', label: 'Net Cash Position', explanation: `Negative D/E means the company has more cash than debt — a fortress balance sheet. This is extremely rare and valuable. The company can survive any storm, fund acquisitions without diluting shareholders, and return cash via buybacks.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 0.3) return { signal: 'positive', label: 'Conservative', explanation: `D/E of ${v.toFixed(2)}x is very low. For every $1 of equity, the company owes just $${v.toFixed(2)} in debt. Minimal financial risk — the company can handle recessions, rate hikes, and revenue drops without stress.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      if (v < 1.0) return { signal: 'positive', label: 'Healthy', explanation: `D/E of ${v.toFixed(2)}x is reasonable — debt is less than equity. The company uses some leverage to amplify returns without taking on dangerous risk. Standard for most healthy businesses.`, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
      if (v < 2.0) return { signal: 'neutral', label: 'Elevated', explanation: `D/E of ${v.toFixed(2)}x is elevated. The company has more debt than equity. Manageable if cash flows are predictable — but in a downturn, high interest payments could squeeze profits significantly. Check interest coverage ratio.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      return { signal: 'negative', label: 'High Leverage Risk', explanation: `D/E of ${v.toFixed(2)}x is concerning. The company carries ${v.toFixed(1)}x as much debt as equity. This amplifies both gains and losses. A 20% drop in revenue could cascade into inability to service debt. This level of leverage has bankrupted many otherwise healthy companies.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    },

    currentRatio: () => {
      if (v < 0.5) return { signal: 'negative', label: 'Liquidity Crisis Risk', explanation: `Current ratio of ${v.toFixed(2)}x is alarming. The company has less than $0.50 in liquid assets for every $1 of near-term obligations. Without external financing, it may struggle to pay bills within 12 months.`, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      if (v < 1.0) return { signal: 'negative', label: 'Below Safe Level', explanation: `Current ratio of ${v.toFixed(2)}x means current liabilities exceed current assets. The company can't fully cover near-term obligations from existing liquid assets alone. Unless it has strong recurring cash flows (like Amazon) or credit lines, this warrants scrutiny.`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      if (v < 1.5) return { signal: 'neutral', label: 'Adequate', explanation: `Current ratio of ${v.toFixed(2)}x is tight but functional. The company can cover its near-term obligations, but there's limited buffer. A sudden revenue shock could create stress. Acceptable if cash flows are predictable.`, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      if (v < 3.0) return { signal: 'positive', label: 'Comfortable', explanation: `Current ratio of ${v.toFixed(2)}x is healthy. For every $1 of near-term obligations, the company has $${v.toFixed(2)} in liquid assets. This provides a comfortable cushion against unexpected disruptions. The sweet spot for most businesses.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      return { signal: 'neutral', label: 'Very High — Check Efficiency', explanation: `Current ratio of ${v.toFixed(2)}x is very high. While financially safe, this may indicate the company is sitting on too much idle cash or inventory — capital that could be deployed more productively. Not dangerous, but worth investigating capital allocation.`, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' };
    },

    freeCashFlow: () => {
      if (v > 0) return { signal: 'positive', label: 'Positive FCF ✓', explanation: `The company generated real, positive free cash flow. This is the most important signal of financial health — it means the business produces more cash than it consumes. Management has real money to return to shareholders, pay debt, or reinvest.`, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
      return { signal: 'negative', label: 'Cash Consuming', explanation: `Negative free cash flow means the company spent more cash than it generated from operations. This isn't automatically bad — heavy investment phases (like building factories or acquiring customers) can cause temporary negative FCF. Ask: is this investment spending or operational weakness?`, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    },
  };

  const fn = signals[key];
  if (!fn) return null;
  return fn();
};

export default function MetricInterpreter({ metrics }) {
  const [open, setOpen] = useState(false);

  const items = [
    { key: 'priceEarningsRatio', label: 'P/E Ratio',       value: metrics?.priceEarningsRatio,     display: metrics?.priceEarningsRatio != null ? Number(metrics.priceEarningsRatio).toFixed(1) + 'x' : 'N/A' },
    { key: 'priceToBookRatio',   label: 'P/B Ratio',       value: metrics?.priceToBookRatio,        display: metrics?.priceToBookRatio != null ? Number(metrics.priceToBookRatio).toFixed(2) + 'x' : 'N/A' },
    { key: 'returnOnEquity',     label: 'Return on Equity',value: metrics?.returnOnEquity,          display: metrics?.returnOnEquity != null ? (Number(metrics.returnOnEquity) * 100).toFixed(1) + '%' : 'N/A' },
    { key: 'netProfitMargin',    label: 'Net Margin',      value: metrics?.netProfitMargin,         display: metrics?.netProfitMargin != null ? (Number(metrics.netProfitMargin) * 100).toFixed(1) + '%' : 'N/A' },
    { key: 'debtEquityRatio',    label: 'Debt / Equity',   value: metrics?.debtEquityRatio,         display: metrics?.debtEquityRatio != null ? Number(metrics.debtEquityRatio).toFixed(2) + 'x' : 'N/A' },
    { key: 'currentRatio',       label: 'Current Ratio',   value: metrics?.currentRatio,            display: metrics?.currentRatio != null ? Number(metrics.currentRatio).toFixed(2) + 'x' : 'N/A' },
    { key: 'freeCashFlow',       label: 'Free Cash Flow',  value: metrics?.freeCashFlow,            display: metrics?.freeCashFlow != null ? (Number(metrics.freeCashFlow) >= 0 ? '+' : '') + '$' + Math.abs(Number(metrics.freeCashFlow) / 1e9).toFixed(2) + 'B' : 'N/A' },
  ].map((item) => ({ ...item, interpretation: interpretMetric(item.key, item.value) }));

  const positives = items.filter((i) => i.interpretation?.signal === 'positive').length;
  const negatives = items.filter((i) => i.interpretation?.signal === 'negative').length;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-6">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4
          hover:bg-slate-700/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500/20 border border-sky-500/30
            rounded-lg flex items-center justify-center">
            <Info size={15} className="text-sky-400" />
          </div>
          <div className="text-left">
            <p className="text-white font-bold text-sm">
              How to Interpret These Numbers
            </p>
            <p className="text-slate-400 text-xs mt-0.5">
              Plain-English explanation of every key metric for this company
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-green-400 text-xs font-semibold">
              <TrendingUp size={12} /> {positives} green
            </span>
            <span className="flex items-center gap-1 text-red-400 text-xs font-semibold">
              <TrendingDown size={12} /> {negatives} red
            </span>
          </div>
          {open
            ? <ChevronUp size={18} className="text-slate-400" />
            : <ChevronDown size={18} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700">
          <div className="px-6 py-4 bg-sky-500/5 border-b border-slate-700">
            <p className="text-sky-400 text-xs font-medium">
              📚 <strong>Learning Mode Active</strong> — Each metric below shows the actual
              value for this company, what signal it gives, and how to think about it.
              Use this to build your own investment judgement.
            </p>
          </div>

          <div className="divide-y divide-slate-700/50">
            {items.map(({ key, label, display, interpretation }) => {
              if (!interpretation) return null;
              const SignalIcon = interpretation.signal === 'positive' ? TrendingUp
                : interpretation.signal === 'negative' ? TrendingDown : Minus;
              return (
                <div key={key} className="px-6 py-4 hover:bg-slate-700/20
                  transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg
                      border shrink-0 mt-0.5 ${interpretation.bg} ${interpretation.border}`}>
                      <SignalIcon size={12} className={interpretation.color} />
                      <span className={`text-xs font-bold ${interpretation.color}`}>
                        {display}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-white font-semibold text-sm">{label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${interpretation.bg} ${interpretation.color} border
                          ${interpretation.border}`}>
                          {interpretation.label}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${interpretation.color === 'text-slate-400' ? 'text-slate-500' : 'text-slate-300'}`}>
                        {interpretation.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 border-t border-slate-700 bg-slate-900/30">
            <p className="text-slate-500 text-xs text-center">
              ⚠️ These interpretations are general guidelines. Context matters —
              always compare metrics to industry peers and historical trends.
              This is for educational purposes, not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}