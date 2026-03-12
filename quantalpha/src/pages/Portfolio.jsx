import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Plus, Trash2, BarChart2, TrendingUp,
  AlertTriangle, ChevronRight, RefreshCw
} from 'lucide-react';
import { getQuote, getFinancialRatios, getKeyMetrics } from '../api/fmp';
import { calculateInvestmentScore } from '../utils/scoring';
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
  {
    name: 'Big Tech',
    tickers: ['AAPL','MSFT','GOOGL','META','NVDA'],
  },
  {
    name: 'Dividend Kings',
    tickers: ['JNJ','KO','PG','MMM','T'],
  },
  {
    name: 'Growth Leaders',
    tickers: ['TSLA','AMZN','NFLX','CRM','SHOP'],
  },
];

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
  const [inputTicker, setInputTicker]   = useState('');
  const [portfolio, setPortfolio]       = useState([]);
  const [loading, setLoading]           = useState(false);
  const [loadingTicker, setLoadingTicker] = useState('');
  const [error, setError]               = useState('');
  const navigate                        = useNavigate();

  const addStock = useCallback(async (ticker) => {
    const symbol = (ticker || inputTicker).toUpperCase().trim();
    if (!symbol) return;
    if (!/^[A-Z]{1,5}$/.test(symbol)) {
      setError('Invalid ticker format.');
      return;
    }
    if (portfolio.find((p) => p.ticker === symbol)) {
      setError(`${symbol} is already in your portfolio.`);
      return;
    }
    if (portfolio.length >= 8) {
      setError('Maximum 8 stocks in portfolio.');
      return;
    }

    setError('');
    setLoading(true);
    setLoadingTicker(symbol);

    try {
      const [quote, ratiosData, metricsData] = await Promise.allSettled([
        getQuote(symbol),
        getFinancialRatios(symbol),
        getKeyMetrics(symbol),
      ]);

      const q  = quote.status     === 'fulfilled' ? quote.value     : null;
      const r  = ratiosData.status === 'fulfilled' ? ratiosData.value : null;
      const km = metricsData.status === 'fulfilled' ? metricsData.value : null;

      if (!q) throw new Error(`Could not fetch data for ${symbol}.`);

      const score = calculateInvestmentScore(r, km, null, null);

      setPortfolio((prev) => [...prev, {
        ticker:   symbol,
        name:     q.name || symbol,
        price:    q.price,
        change:   q.changesPercentage,
        marketCap:q.marketCap,
        pe:       q.pe,
        score:    score.total,
        verdict:  score.verdict,
        sector:   q.sector || 'N/A',
      }]);
      setInputTicker('');
    } catch (e) {
      setError(e.message || `Failed to add ${symbol}.`);
    } finally {
      setLoading(false);
      setLoadingTicker('');
    }
  }, [inputTicker, portfolio]);

  const removeStock = (ticker) =>
    setPortfolio((prev) => prev.filter((p) => p.ticker !== ticker));

  const loadPreset = async (tickers) => {
    setPortfolio([]);
    setError('');
    for (const t of tickers) {
      await addStock(t);
    }
  };

  /* ── Portfolio Calculations ── */
  const avgScore   = portfolio.length
    ? Math.round(portfolio.reduce((a, s) => a + s.score, 0) / portfolio.length)
    : null;

  const avgChange  = portfolio.length
    ? portfolio.reduce((a, s) => a + (s.change || 0), 0) / portfolio.length
    : null;

  const totalMarketCap = portfolio.reduce((a, s) => a + (s.marketCap || 0), 0);

  const pieData = portfolio.map((s) => ({
    name:  s.ticker,
    value: s.marketCap || 1,
  }));

  const barData = portfolio.map((s) => ({
    name:  s.ticker,
    score: s.score,
  }));

  const getScoreColor = (score) => {
    if (score >= 75) return '#22c55e';
    if (score >= 60) return '#84cc16';
    if (score >= 45) return '#eab308';
    if (score >= 30) return '#f97316';
    return '#ef4444';
  };

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
            Build a portfolio of up to 8 stocks and get a combined AI score,
            sector breakdown and risk overview.
          </p>
        </div>

        {/* Preset Portfolios */}
        <div className="mb-6">
          <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mb-3">
            Quick Load Preset Portfolio
          </p>
          <div className="flex flex-wrap gap-3">
            {PRESET_PORTFOLIOS.map((p) => (
              <button
                key={p.name}
                onClick={() => loadPreset(p.tickers)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800
                  border border-slate-700 hover:border-sky-500/50 hover:bg-slate-700
                  text-slate-300 hover:text-white rounded-xl text-sm font-medium
                  transition-all disabled:opacity-50"
              >
                <RefreshCw size={13} />
                {p.name}
                <span className="text-slate-500 text-xs">({p.tickers.join(', ')})</span>
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
              placeholder="Enter ticker — AAPL, TSLA..."
              maxLength={5}
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
              {loading && loadingTicker === inputTicker.toUpperCase() ? (
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
            {portfolio.length}/8 stocks added
          </p>
        </div>

        {/* Loading indicator for preset */}
        {loading && loadingTicker && (
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <span className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500
              rounded-full animate-spin" />
            Loading {loadingTicker}...
          </div>
        )}

        {/* Portfolio Table */}
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
                <p className="font-black text-2xl" style={{ color: getScoreColor(avgScore) }}>
                  {avgScore}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Avg Change Today</p>
                <p className={`font-black text-2xl ${colorForChange(avgChange)}`}>
                  {avgChange !== null ? fmt.change(avgChange) : 'N/A'}
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 text-center">
                <p className="text-slate-400 text-xs mb-1">Combined Mkt Cap</p>
                <p className="text-white font-black text-xl">
                  {fmt.currency(totalMarketCap)}
                </p>
              </div>
            </div>

            {/* Stock Table */}
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
                        <th key={h} className="text-left text-slate-500 text-xs font-medium
                          uppercase tracking-wide px-4 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((stock) => (
                      <tr key={stock.ticker}
                        className="border-b border-slate-700/50 hover:bg-slate-700/30
                          transition-colors group">
                        <td className="px-4 py-3">
                          <span className="text-white font-bold">{stock.ticker}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-300 text-xs line-clamp-1
                            max-w-[140px] block">
                            {stock.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">
                          {fmt.price(stock.price)}
                        </td>
                        <td className={`px-4 py-3 font-semibold ${colorForChange(stock.change)}`}>
                          {fmt.change(stock.change)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {stock.pe ? stock.pe.toFixed(1) : '—'}
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
                              title="View Analysis"
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
                <h3 className="text-white font-bold text-sm mb-4">
                  AI Score Comparison
                </h3>
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
                <div className="flex items-center gap-6">
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
                          background: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                    </RechartsPie>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {portfolio.map((s, i) => (
                      <div key={s.ticker} className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="text-slate-300 text-xs font-medium">{s.ticker}</span>
                        <span className="text-slate-500 text-xs">
                          {fmt.currency(s.marketCap)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Risk Note */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-amber-400 font-semibold text-sm mb-1">
                    Portfolio Risk Reminder
                  </p>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Diversification across sectors reduces risk. A score above 60
                    for the average suggests a fundamentally strong portfolio.
                    This tool is for educational purposes only — not financial advice.
                    Always do your own research before investing.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {portfolio.length === 0 && !loading && (
          <div className="text-center py-20">
            <PieChart size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Your portfolio is empty</p>
            <p className="text-slate-600 text-sm mt-1">
              Add stocks above or load a preset portfolio to get started
            </p>
          </div>
        )}

      </div>
    </div>
  );
}