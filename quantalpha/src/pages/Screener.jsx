import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, TrendingUp, DollarSign, BarChart2, Star, ChevronRight, RefreshCw, AlertTriangle } from 'lucide-react';
import { getScreenerResults } from '../api/fmp';
import { fmt } from '../utils/formatters';

const STRATEGIES = [
  {
    id: 'value',
    label: 'Value Investing',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    activeBg: 'bg-green-500/20',
    description: 'Low P/E, low P/B, strong FCF — stocks trading below intrinsic value',
    criteria: ['P/E Ratio < 20', 'P/B Ratio < 3', 'Market Cap > $1B', 'NYSE / NASDAQ'],
    philosophy: 'Made famous by Warren Buffett and Benjamin Graham. Buy $1 of value for $0.60.',
  },
  {
    id: 'growth',
    label: 'Growth Investing',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeBg: 'bg-sky-500/20',
    description: 'High revenue growth, expanding margins — companies growing faster than market',
    criteria: ['Revenue > $500M', 'Market Cap > $2B', 'NYSE / NASDAQ', 'Active Trading'],
    philosophy: 'Focus on companies reinvesting aggressively to compound earnings at high rates.',
  },
  {
    id: 'dividend',
    label: 'Dividend Investing',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    activeBg: 'bg-yellow-500/20',
    description: 'Consistent dividend payers — income-generating stocks with stable fundamentals',
    criteria: ['Dividend Yield > 1%', 'Market Cap > $1B', 'NYSE / NASDAQ', 'Established Company'],
    philosophy: 'Build passive income. Dividend aristocrats have increased payouts for 25+ years.',
  },
  {
    id: 'quality',
    label: 'Quality Investing',
    icon: BarChart2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    activeBg: 'bg-purple-500/20',
    description: 'High ROA, strong balance sheets — best-in-class companies with durable advantages',
    criteria: ['ROA > 10%', 'Market Cap > $5B', 'NYSE / NASDAQ', 'Large Cap'],
    philosophy: 'Charlie Munger: buy wonderful companies at fair prices, not fair companies at wonderful prices.',
  },
];

const WHAT_METRICS_MEAN = [
  { term: 'P/E Ratio',     def: 'Price divided by earnings per share. Lower = cheaper relative to profits.' },
  { term: 'P/B Ratio',     def: 'Price divided by book value. Measures how much premium investors pay over assets.' },
  { term: 'Market Cap',    def: 'Total market value of all shares. Micro <$300M, Small <$2B, Mid <$10B, Large >$10B.' },
  { term: 'Dividend Yield',def: 'Annual dividend as % of stock price. A 3% yield means $3 per $100 invested per year.' },
  { term: 'ROA',           def: 'Return on Assets. How efficiently a company uses its assets to generate profit.' },
  { term: 'Revenue',       def: 'Total income from business operations before any expenses are deducted.' },
];

export default function Screener() {
  const [selected, setSelected]   = useState(null);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);
  const navigate                  = useNavigate();

  const runScreener = useCallback(async (strategyId) => {
    setSelected(strategyId);
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);
    try {
      const data = await getScreenerResults(strategyId);
      if (!data || data.length === 0) {
        setError('No results returned. The screener API may require a paid FMP plan. Try a different strategy or check your API tier.');
      } else {
        setResults(data);
      }
    } catch (e) {
      setError(e.message || 'Screener failed. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  const activeStrategy = STRATEGIES.find((s) => s.id === selected);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-sky-500/20 border border-sky-500/30 rounded-xl
              flex items-center justify-center">
              <Filter size={18} className="text-sky-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Strategy-Based Stock Screener</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            Select an investment strategy to filter stocks by real financial criteria.
            Click any result to view the full analysis.
          </p>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STRATEGIES.map((s) => {
            const Icon    = s.icon;
            const active  = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => runScreener(s.id)}
                disabled={loading}
                className={`text-left p-5 rounded-2xl border transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${active
                    ? `${s.activeBg} ${s.border} scale-[1.02] shadow-lg`
                    : `bg-slate-800 border-slate-700 hover:${s.border} hover:${s.bg}`
                  }`}
              >
                <div className={`w-10 h-10 ${s.bg} border ${s.border} rounded-xl
                  flex items-center justify-center mb-3`}>
                  <Icon size={18} className={s.color} />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${active ? s.color : 'text-white'}`}>
                  {s.label}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{s.description}</p>

                {/* Criteria pills */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {s.criteria.map((c) => (
                    <span key={c} className={`text-xs px-2 py-0.5 rounded-full
                      ${active ? `${s.bg} ${s.color}` : 'bg-slate-700 text-slate-400'}`}>
                      {c}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Philosophy banner */}
        {activeStrategy && (
          <div className={`${activeStrategy.bg} border ${activeStrategy.border}
            rounded-2xl p-4 mb-6 flex items-start gap-3`}>
            <activeStrategy.icon size={18} className={`${activeStrategy.color} mt-0.5 shrink-0`} />
            <div>
              <p className={`text-sm font-semibold ${activeStrategy.color} mb-0.5`}>
                {activeStrategy.label} Philosophy
              </p>
              <p className="text-slate-300 text-sm">{activeStrategy.philosophy}</p>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent border-t-sky-500
                rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 text-sm">Screening stocks with live data...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-semibold mb-1">Screener Unavailable</p>
            <p className="text-slate-400 text-sm max-w-md mx-auto">{error}</p>
            <button
              onClick={() => selected && runScreener(selected)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700
                hover:bg-slate-600 text-white rounded-lg text-sm mx-auto"
            >
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Results Table */}
        {!loading && results.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center
              justify-between">
              <div>
                <h2 className="text-white font-bold">
                  {activeStrategy?.label} Results
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {results.length} companies matched · Click any row to analyze
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold
                ${activeStrategy?.bg} ${activeStrategy?.color} border ${activeStrategy?.border}`}>
                {results.length} matches
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    {['#', 'Company', 'Sector', 'Price', 'Market Cap', 'P/E', 'P/B', 'Beta', ''].map((h) => (
                      <th key={h} className="text-left text-slate-500 text-xs font-medium
                        uppercase tracking-wide px-4 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock, i) => (
                    <tr
                      key={stock.symbol}
                      onClick={() => navigate(`/analysis/${stock.symbol}`)}
                      className="border-b border-slate-700/50 hover:bg-slate-700/40
                        cursor-pointer transition-colors group"
                    >
                      <td className="px-4 py-3 text-slate-500 text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-white group-hover:text-sky-400
                          transition-colors">
                          {stock.symbol}
                        </div>
                        <div className="text-slate-400 text-xs line-clamp-1 max-w-[160px]">
                          {stock.companyName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-slate-700 text-slate-300
                          rounded-full whitespace-nowrap">
                          {stock.sector || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white font-semibold">
                        {fmt.price(stock.price)}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {fmt.currency(stock.marketCap)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={stock.pe && stock.pe < 20
                          ? 'text-green-400' : 'text-slate-300'}>
                          {stock.pe ? stock.pe.toFixed(1) : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {stock.priceToBook ? stock.priceToBook.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {stock.beta ? stock.beta.toFixed(2) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={15} className="text-slate-600
                          group-hover:text-sky-400 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && !searched && (
          <div className="text-center py-20">
            <Filter size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">Select a strategy above to screen stocks</p>
            <p className="text-slate-600 text-sm mt-1">
              Real financial filters applied to live market data
            </p>
          </div>
        )}

        {/* Education: What do these metrics mean */}
        <div className="mt-10 bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-bold text-base mb-4">
            📚 What Do These Screening Metrics Mean?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHAT_METRICS_MEAN.map(({ term, def }) => (
              <div key={term} className="bg-slate-700/50 rounded-xl p-4">
                <p className="text-sky-400 font-semibold text-sm mb-1">{term}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}