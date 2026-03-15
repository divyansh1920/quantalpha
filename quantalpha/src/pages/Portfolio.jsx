import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Plus, Trash2, ChevronRight,
  AlertTriangle, RefreshCw
} from 'lucide-react';
import { getQuote } from '../api/fmp';
import { fmt, colorForChange } from '../utils/formatters';
import {
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const PIE_COLORS = [
  '#0ea5e9','#22c55e','#a855f7','#f97316',
  '#eab308','#ec4899','#14b8a6','#f43f5e'
];

const PRESET_PORTFOLIOS = [
  { name: '🇺🇸 Big Tech',      tickers: ['AAPL','MSFT','GOOGL','META','NVDA']                    },
  { name: '🇺🇸 Dividend Kings', tickers: ['JNJ','KO','PG','T','XOM']                             },
  { name: '🇺🇸 Growth Leaders', tickers: ['TSLA','AMZN','NFLX','SHOP']                           },
  { name: '🇮🇳 Nifty IT',       tickers: ['TCS.NS','INFY.NS','WIPRO.NS','HCLTECH.NS']            },
  { name: '🇮🇳 Top Banks',      tickers: ['HDFCBANK.NS','ICICIBANK.NS','KOTAKBANK.NS','SBIN.NS'] },
  { name: '🇮🇳 Blue Chips',     tickers: ['RELIANCE.NS','TCS.NS','HINDUNILVR.NS','ASIANPAINT.NS']},
];

const getVerdict = (s) => {
  if (s >= 75) return { label: 'Strong Buy', bg: 'bg-green-500/20',  text: 'text-green-400'  };
  if (s >= 60) return { label: 'Buy',         bg: 'bg-lime-500/20',   text: 'text-lime-400'   };
  if (s >= 45) return { label: 'Hold',         bg: 'bg-yellow-500/20', text: 'text-yellow-400' };
  if (s >= 30) return { label: 'Weak',         bg: 'bg-orange-500/20', text: 'text-orange-400' };
  return               { label: 'Avoid',        bg: 'bg-red-500/20',    text: 'text-red-400'   };
};

const getScoreColor = (score) => {
  if (score >= 75) return '#22c55e';
  if (score >= 60) return '#84cc16';
  if (score >= 45) return '#eab308';
  if (score >= 30) return '#f97316';
  return '#ef4444';
};

const quickScore = (q) => {
  let score = 50;
  const pe  = q?.pe            || null;
  const eps = q?.eps           || null;
  const pb  = q?.priceToBook   || null;
  if (pe  !== null && pe > 0)           score += pe  < 20  ? 10 : pe  < 35 ? 5 : -5;
  if (pb  !== null && pb > 0)           score += pb  < 3   ? 8  : pb  < 6  ? 3 : -3;
  if (eps !== null)                     score += eps > 0   ? 7  : -10;
  if ((q?.changesPercentage || 0) > 0)  score += 3;
  return Math.max(10, Math.min(90, Math.round(score)));
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white font-semibold">{payload[0].name}</p>
      <p className="text-sky-400">Score: {payload[0].value}</p>
    </div>
  );
};

export default function Portfolio() {
  const [inputTicker, setInputTicker]     = useState('');
  const [portfolio, setPortfolio]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [loadingTicker, setLoadingTicker] = useState('');
  const [presetLoading, setPresetLoading] = useState(false);
  const [error, setError]                 = useState('');
  const navigate                          = useNavigate();

  const addStock = useCallback(async (ticker) => {
    const symbol = (ticker || inputTicker).toUpperCase().trim();
    if (!symbol) return;

    if (!/^[A-Z]{1,20}(\.[A-Z]{1,3})?$/.test(symbol)) {
      setError('Invalid ticker. Use AAPL for US or RELIANCE.NS for Indian stocks.');
      return;
    }
    if (portfolio.find((p) => p.ticker === symbol)) {
      setError(`${symbol} is already in your portfolio.`);
      return;
    }
    if (portfolio.length >= 8) {
      setError('Maximum 8 stocks allowed in portfolio.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingTicker(symbol);

    try {
      const q = await getQuote(symbol);
      if (!q) throw new Error(`Could not fetch data for ${symbol}.`);

      const score    = quickScore(q);
      const isIndian = symbol.includes('.NS');

      setPortfolio((prev) => [...prev, {
        ticker:    symbol,
        name:      q.name || q.companyName || symbol,
        price:     q.price     || 0,
        change:    q.changesPercentage || 0,
        marketCap: q.marketCap || 0,
        pe:        q.pe        || null,
        score,
        verdict:   getVerdict(score),
        isIndian,
      }]);
      setInputTicker('');
    } catch (e) {
      setError(e.message || `Failed to add ${symbol}. Check the ticker symbol.`);
    } finally {
      setLoading(false);
      setLoadingTicker('');
    }
  }, [inputTicker, portfolio]);

  const loadPreset = useCallback(async (tickers) => {
    setPortfolio([]);
    setError('');
    setPresetLoading(true);
    for (const t of tickers) {
      await addStock(t);
    }
    setPresetLoading(false);
  }, [addStock]);

  const removeStock = (ticker) =>
    setPortfolio((prev) => prev.filter((p) => p.ticker !== ticker));

  /* ── Calculations ── */
  const avgScore = portfolio.length
    ? Math.round(portfolio.reduce((a, s) => a + s.score, 0) / portfolio.length)
    : null;

  const avgChange = portfolio.length
    ? portfolio.reduce((a, s) => a + (s.change || 0), 0) / portfolio.length
    : null;

  const totalMarketCap = portfolio.reduce((a, s) => a + (s.marketCap || 0), 0);

  const pieData = portfolio.map((s) => ({
    name:  s.ticker.replace('.NS', ''),
    value: s.marketCap || 1,
  }));

  const barData = portfolio.map((s) => ({
    name:  s.ticker.replace('.NS', ''),
    score: s.score,
  }));

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-purple-500/20 border border-purple-500/30
              rounded-xl flex items-center justify-center">
              <PieChart size={18} className="text-purple-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Portfolio Analytics</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            Build a portfolio of up to 8 stocks — US or Indian market.
            Get combined AI score, sector breakdown and comparative analysis.
          </p>
        </div>

        {/* Preset Portfolios */}
        <div className="mb-6">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            Quick Load — Preset Portfolio
          </p>
          <div className="flex flex-wrap gap-2">
            {PRESET_PORTFOLIOS.map((p) => (
              <button
                key={p.name}
                onClick={() => loadPreset(p.tickers)}
                disabled={loading || presetLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800
                  border border-slate-700 hover:border-sky-500/50 hover:bg-slate-700
                  text-slate-300 hover:text-white rounded-xl text-sm font-medium
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={12} />
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Add Stock Input */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 mb-6">
          <p className="text-white font-semibold text-sm mb-3">Add Stock to Portfolio</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputTicker}
              onChange={(e) => { setInputTicker(e.target.value.toUpperCase()); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && addStock()}
              placeholder="AAPL for US · RELIANCE.NS for India"
              className="flex-1 bg-slate-700 border border-slate-600 focus:border-sky-500
                text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm
                outline-none transition-colors"
            />
            <button
              onClick={() => addStock()}
              disabled={loading || !inputTicker}
              className="flex items-center gap-2 px-5 py-2.5 bg-sky-500
                hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed
                text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
            >
              {loading && loadingTicker === inputTicker ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white
                  rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Add
            </button>
          </div>
          {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
          <p className="text-slate-500 text-xs mt-2">
            {portfolio.length}/8 stocks · Supports 🇺🇸 US (AAPL) and 🇮🇳 Indian (RELIANCE.NS) stocks
          </p>
        </div>

        {/* Loading indicator */}
        {(loading || presetLoading) && loadingTicker && (
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <span className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500
              rounded-full animate-spin" />
            Loading {loadingTicker}...
          </div>
        )}

        {/* Portfolio Content */}
        {portfolio.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Stocks</p>
                <p className="text-white font-black text-2xl">{portfolio.length}</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Avg AI Score</p>
                <p className="font-black text-2xl"
                  style={{ color: getScoreColor(avgScore) }}>
                  {avgScore}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Avg Change Today</p>
                <p className={`font-black text-2xl ${colorForChange(avgChange)}`}>
                  {avgChange !== null ? (avgChange >= 0 ? '+' : '') + avgChange.toFixed(2) + '%' : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Combined Mkt Cap</p>
                <p className="text-white font-black text-xl">
                  {fmt.currency(totalMarketCap)}
                </p>
              </div>
            </div>

            {/* Holdings Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl
              overflow-hidden mb-6">
              <div className="px-5 py-4 border-b border-slate-700">
                <h2 className="text-white font-bold">Holdings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/50">
                      {['Symbol','Company','Price','Change','P/E','AI Score','Verdict','Actions'].map((h) => (
                        <th key={h} className="text-left text-slate-500 text-xs
                          font-medium uppercase tracking-wide px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((stock) => (
                      <tr key={stock.ticker}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30
                          transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold">
                              {stock.ticker.replace('.NS', '')}
                            </span>
                            {stock.isIndian && (
                              <span className="text-xs text-orange-400 font-normal">NSE</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-300 text-xs line-clamp-1
                            max-w-[140px] block">
                            {stock.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">
                          {stock.isIndian
                            ? `₹${Number(stock.price).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : fmt.price(stock.price)}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${colorForChange(stock.change)}`}>
                          {stock.change >= 0 ? '+' : ''}{Number(stock.change).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {stock.pe ? Number(stock.pe).toFixed(1) : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-black text-lg"
                            style={{ color: getScoreColor(stock.score) }}>
                            {stock.score}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                            ${stock.verdict?.bg} ${stock.verdict?.text}`}>
                            {stock.verdict?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/analysis/${stock.ticker}`)}
                              className="p-1.5 bg-sky-500/20 hover:bg-sky-500/40
                                text-sky-400 rounded-lg transition-colors"
                              title="View Full Analysis"
                            >
                              <ChevronRight size={13} />
                            </button>
                            <button
                              onClick={() => removeStock(stock.ticker)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/40
                                text-red-400 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* AI Score Bar Chart */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm mb-4">AI Score Comparison</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="score" name="AI Score" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={getScoreColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart by Market Cap */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <h3 className="text-white font-bold text-sm mb-4">
                  Portfolio Weight by Market Cap
                </h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="50%" height={180}>
                    <RechartsPie>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => fmt.currency(val)}
                        contentStyle={{
                          background: '#1e293b', border: '1px solid #334155',
                          borderRadius: '8px', fontSize: '12px',
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 flex-1">
                    {portfolio.map((s, i) => (
                      <div key={s.ticker} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-slate-300 text-xs font-medium">
                          {s.ticker.replace('.NS', '')}
                          {s.isIndian && <span className="text-orange-400 ml-0.5 text-xs">🇮🇳</span>}
                        </span>
                        <span className="text-slate-500 text-xs">
                          {fmt.currency(s.marketCap)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-400 font-semibold text-sm mb-1">
                    Portfolio Note
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    AI scores shown here are estimated from quote data only.
                    For a full deep-analysis, click the → button on any stock to open
                    the complete analysis with all 25+ metrics.
                    This tool is for educational purposes only — not financial advice.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {portfolio.length === 0 && !loading && !presetLoading && (
          <div className="text-center py-20">
            <PieChart size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Your portfolio is empty</p>
            <p className="text-slate-600 text-sm mt-1">
              Add stocks above or click a preset — supports 🇺🇸 US and 🇮🇳 Indian stocks
            </p>
          </div>
        )}

      </div>
    </div>
  );
}