import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter, TrendingUp, DollarSign, BarChart2, Star,
  ChevronRight, RefreshCw, AlertTriangle, Globe
} from 'lucide-react';
import { getQuote } from '../api/fmp';
import { fmt } from '../utils/formatters';

// ── Curated stock lists — no paid API needed ──────────────
// These are real, carefully selected stocks per strategy
// Live quotes are fetched for each at runtime (free tier)
const CURATED = {
  value: {
    us:     ['BRK-B','JPM','BAC','C','WFC','MU','INTC','F','GM','CVX','XOM','VZ','T','PFE','MRK','ABBV','BMY','KHC','WBA','IBM'],
    india:  ['COALINDIA.NS','ONGC.NS','NTPC.NS','POWERGRID.NS','BPCL.NS','IOC.NS','SBIN.NS','PNB.NS','UNIONBANK.NS','BANKBARODA.NS','SAIL.NS','NMDC.NS','VEDL.NS','HINDALCO.NS','TATASTEEL.NS','IDEA.NS','YESBANK.NS','ZEEL.NS','SUZLON.NS','IRCTC.NS'],
  },
  growth: {
    us:     ['NVDA','MSFT','GOOGL','META','AMZN','TSLA','ADBE','CRM','SNOW','PLTR','SHOP','SQ','CRWD','ZS','NET','DDOG','MDB','BILL','AFRM','ABNB'],
    india:  ['TCS.NS','INFY.NS','WIPRO.NS','HCLTECH.NS','LTIM.NS','PERSISTENT.NS','COFORGE.NS','MPHASIS.NS','TATATECH.NS','ZOMATO.NS','NYKAA.NS','PAYTM.NS','POLICYBZR.NS','DELHIVERY.NS','INDIGO.NS','MOTHERSON.NS','SCHAEFFLER.NS','AFFLE.NS','ROUTE.NS','HAPPSTMNDS.NS'],
  },
  dividend: {
    us:     ['KO','PEP','JNJ','PG','MMM','MCD','WMT','CVX','XOM','T','VZ','IBM','ABT','MO','PM','O','MAIN','STAG','WPC','EPR'],
    india:  ['COALINDIA.NS','ONGC.NS','POWERGRID.NS','NTPC.NS','RECLTD.NS','PFC.NS','NMDC.NS','MOIL.NS','HINDUNILVR.NS','ITC.NS','BAJAJFINSV.NS','HDFCBANK.NS','INFY.NS','TCS.NS','WIPRO.NS','VEDL.NS','HINDALCO.NS','TATASTEEL.NS','SAIL.NS','GAIL.NS'],
  },
  quality: {
    us:     ['AAPL','MSFT','GOOGL','V','MA','AMZN','META','UNH','LLY','NVO','ASML','LVMUY','COST','HD','SPGI','MCO','ADP','ISRG','TMO','DHR'],
    india:  ['RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ICICIBANK.NS','BAJFINANCE.NS','HINDUNILVR.NS','ASIANPAINT.NS','PIDILITIND.NS','NESTLEIND.NS','TITAN.NS','ATUL.NS','DMART.NS','KOTAKBANK.NS','SBILIFE.NS','HDFCLIFE.NS','CHOLAFIN.NS','MARICO.NS','GODREJCP.NS','DABUR.NS'],
  },
};

const STRATEGIES = [
  {
    id: 'value',
    label: 'Value Investing',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    activeBg: 'bg-green-500/20',
    description: 'Stocks trading at attractive valuations — potentially below intrinsic value',
    criteria: ['Low P/E', 'Low P/B', 'Strong FCF', 'Large Cap'],
    philosophy: 'Warren Buffett: Buy $1 of value for $0.60. Look for fear in the market.',
  },
  {
    id: 'growth',
    label: 'Growth Investing',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeBg: 'bg-sky-500/20',
    description: 'Companies expanding revenues and earnings faster than the market',
    criteria: ['High Revenue Growth', 'Expanding Margins', 'Large TAM', 'Tech/Consumer'],
    philosophy: 'Peter Lynch: Find tomorrow\'s leaders in today\'s fast-growing industries.',
  },
  {
    id: 'dividend',
    label: 'Dividend Investing',
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    activeBg: 'bg-yellow-500/20',
    description: 'Consistent dividend payers generating steady income for shareholders',
    criteria: ['Dividend Yield > 1%', 'Payout Consistency', 'Stable Business', 'Cash Rich'],
    philosophy: 'Dividend Aristocrats have increased payouts for 25+ consecutive years.',
  },
  {
    id: 'quality',
    label: 'Quality Investing',
    icon: BarChart2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    activeBg: 'bg-purple-500/20',
    description: 'Best-in-class businesses with durable competitive advantages',
    criteria: ['High ROE', 'Strong Moat', 'Low Debt', 'Consistent Earnings'],
    philosophy: 'Charlie Munger: Wonderful company at a fair price beats fair company at wonderful price.',
  },
];

const METRICS_GUIDE = [
  { term: 'P/E Ratio',      def: 'Price ÷ Earnings. Lower = cheaper. < 15 is value territory. Compare within same industry.' },
  { term: 'P/B Ratio',      def: 'Price ÷ Book Value. < 1 means trading below asset value. High P/B is normal for tech.' },
  { term: 'Market Cap',     def: 'Total value of all shares. Large Cap > ₹20,000Cr / $10B. Bigger = more stable.' },
  { term: 'Div Yield',      def: 'Annual dividend as % of stock price. 3% yield = ₹3 income per ₹100 invested.' },
  { term: 'Change Today',   def: 'Price % change since market open. Reflects today\'s news and sentiment.' },
  { term: 'Volume',         def: 'Number of shares traded. High volume on price move confirms the trend.' },
];

export default function Screener() {
  const [selected, setSelected]   = useState(null);
  const [market, setMarket]       = useState('us');
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [searched, setSearched]   = useState(false);
  const navigate                  = useNavigate();

  const runScreener = useCallback(async (strategyId, marketId) => {
    const sid = strategyId || selected;
    const mid = marketId   || market;
    if (!sid) return;

    setSelected(sid);
    setLoading(true);
    setError('');
    setResults([]);
    setSearched(false);

    try {
      const tickers = CURATED[sid]?.[mid] || [];

      if (mid === 'india') {
        // Use Twelve Data for Indian stocks
        const { getBatchIndianQuotes } = await import('../api/twelvedata');
        const data = await getBatchIndianQuotes(tickers, 12);
        if (!data.length) {
          setError('No Indian stock data returned. Check your Twelve Data API key in .env');
        } else {
          data.sort((a, b) => (b.volume || 0) - (a.volume || 0));
          setResults(data);
        }
      } else {
        // Use FMP for US stocks
        const allResults = [];
        for (let i = 0; i < Math.min(tickers.length, 15); i += 5) {
          const batch = tickers.slice(i, i + 5);
          const settled = await Promise.allSettled(batch.map((t) => getQuote(t)));
          settled.forEach((r) => {
            if (r.status === 'fulfilled' && r.value) allResults.push(r.value);
          });
        }
        if (!allResults.length) {
          setError('No quotes returned. Check your FMP API key or try again.');
        } else {
          allResults.sort((a, b) => (b.marketCap || 0) - (a.marketCap || 0));
          setResults(allResults);
        }
      }
    } catch (e) {
      setError(e.message || 'Screener failed. Please try again.');
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, [selected, market]);

  const handleMarketChange = (m) => {
    setMarket(m);
    setResults([]);
    setSearched(false);
    if (selected) runScreener(selected, m);
  };

  const activeStrategy = STRATEGIES.find((s) => s.id === selected);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-sky-500/20 border border-sky-500/30
              rounded-xl flex items-center justify-center">
              <Filter size={18} className="text-sky-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Strategy-Based Stock Screener</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            Curated stock lists built on proven investment strategies. Live prices updated in real time.
            Click any stock to view the full analysis.
          </p>
        </div>

        {/* Market Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <Globe size={15} className="text-slate-400" />
          <span className="text-slate-400 text-sm">Market:</span>
          <div className="flex gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
            {[
              { id: 'us',    label: '🇺🇸  US Stocks',    sub: 'NYSE / NASDAQ' },
              { id: 'india', label: '🇮🇳  Indian Stocks', sub: 'NSE (₹)' },
            ].map(({ id, label, sub }) => (
              <button
                key={id}
                onClick={() => handleMarketChange(id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  market === id
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {label}
                <span className="ml-1 text-xs opacity-60">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STRATEGIES.map((s) => {
            const Icon   = s.icon;
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => runScreener(s.id, market)}
                disabled={loading}
                className={`text-left p-5 rounded-2xl border transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  ${active
                    ? `${s.activeBg} ${s.border} scale-[1.02] shadow-lg`
                    : `bg-slate-800 border-slate-700 hover:${s.border} hover:${s.bg}`
                  }`}
              >
                <div className={`w-10 h-10 ${s.bg} border ${s.border}
                  rounded-xl flex items-center justify-center mb-3`}>
                  <Icon size={18} className={s.color} />
                </div>
                <h3 className={`font-bold text-sm mb-1 ${active ? s.color : 'text-white'}`}>
                  {s.label}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">{s.description}</p>
                <div className="flex flex-wrap gap-1">
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
            <activeStrategy.icon size={17} className={`${activeStrategy.color} mt-0.5 shrink-0`} />
            <p className="text-slate-300 text-sm">
              <span className={`font-semibold ${activeStrategy.color}`}>
                {activeStrategy.label}:{' '}
              </span>
              {activeStrategy.philosophy}
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full" />
              <div className="absolute inset-0 border-4 border-transparent
                border-t-sky-500 rounded-full animate-spin" />
            </div>
            <p className="text-slate-400 text-sm">
              Fetching live prices for {market === 'india' ? 'Indian' : 'US'} stocks...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <AlertTriangle size={32} className="text-red-400 mx-auto mb-3" />
            <p className="text-red-400 font-semibold mb-1">Could Not Load Results</p>
            <p className="text-slate-400 text-sm max-w-md mx-auto">{error}</p>
            <button onClick={() => runScreener(selected, market)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-700
                hover:bg-slate-600 text-white rounded-lg text-sm mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Results Table */}
        {!loading && results.length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold">
                  {activeStrategy?.label} — {market === 'india' ? '🇮🇳 Indian' : '🇺🇸 US'} Stocks
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {results.length} stocks · Live prices · Click any row to analyze
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-xs font-medium">Live</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    {['#','Symbol','Company','Price','Change','Market Cap','P/E','Volume',''].map((h) => (
                      <th key={h} className="text-left text-slate-500 text-xs font-medium
                        uppercase tracking-wide px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock, i) => {
                    const chg = stock.changesPercentage || stock.change || 0;
                    const isUp = chg >= 0;
                    return (
                      <tr key={stock.symbol || stock.ticker}
                        onClick={() => navigate(`/analysis/${stock.symbol || stock.ticker}`)}
                        className="border-b border-slate-700/50 hover:bg-slate-700/40
                          cursor-pointer transition-colors group">
                        <td className="px-4 py-3 text-slate-600 text-xs">{i + 1}</td>
                        <td className="px-4 py-3">
                          <span className="text-white font-bold group-hover:text-sky-400
                            transition-colors">
                            {(stock.symbol || stock.ticker || '').replace('.NS', '')}
                            {(stock.symbol || stock.ticker || '').includes('.NS') && (
                              <span className="ml-1 text-xs text-orange-400 font-normal">NSE</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-300 text-xs line-clamp-1 max-w-[160px] block">
                            {stock.name || stock.companyName || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white font-semibold">
                          {market === 'india'
                            ? `₹${Number(stock.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : fmt.price(stock.price)}
                        </td>
                        <td className={`px-4 py-3 font-semibold text-sm ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                          {isUp ? '+' : ''}{Number(chg).toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-slate-300 text-xs">
                          {fmt.currency(stock.marketCap)}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {stock.pe ? Number(stock.pe).toFixed(1) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {stock.volume
                            ? Number(stock.volume) >= 1e6
                              ? `${(Number(stock.volume) / 1e6).toFixed(1)}M`
                              : `${(Number(stock.volume) / 1e3).toFixed(0)}K`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <ChevronRight size={15} className="text-slate-600
                            group-hover:text-sky-400 transition-colors" />
                        </td>
                      </tr>
                    );
                  })}
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
              Works for both 🇺🇸 US and 🇮🇳 Indian markets
            </p>
          </div>
        )}

        {/* Education strip */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-white font-bold text-sm mb-4">
            📚 What Do These Metrics Mean?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {METRICS_GUIDE.map(({ term, def }) => (
              <div key={term} className="bg-slate-700/50 rounded-xl p-3">
                <p className="text-sky-400 font-semibold text-xs mb-1">{term}</p>
                <p className="text-slate-400 text-xs leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}