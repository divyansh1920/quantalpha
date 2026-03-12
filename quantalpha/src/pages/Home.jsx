import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, BarChart2, Shield, Zap,
  ArrowRight, Star, BookOpen, ChevronRight
} from 'lucide-react';
import { useStock } from '../context/useStock';

const POPULAR_TICKERS = [
  { symbol: 'AAPL',  name: 'Apple Inc.',        sector: 'Technology'   },
  { symbol: 'MSFT',  name: 'Microsoft Corp.',    sector: 'Technology'   },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',      sector: 'Technology'   },
  { symbol: 'AMZN',  name: 'Amazon.com Inc.',    sector: 'Consumer'     },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',       sector: 'Technology'   },
  { symbol: 'TSLA',  name: 'Tesla Inc.',         sector: 'Automotive'   },
  { symbol: 'META',  name: 'Meta Platforms',     sector: 'Technology'   },
  { symbol: 'JPM',   name: 'JPMorgan Chase',     sector: 'Finance'      },
  { symbol: 'JNJ',   name: 'Johnson & Johnson',  sector: 'Healthcare'   },
  { symbol: 'V',     name: 'Visa Inc.',           sector: 'Finance'      },
  { symbol: 'WMT',   name: 'Walmart Inc.',       sector: 'Retail'       },
  { symbol: 'NFLX',  name: 'Netflix Inc.',       sector: 'Entertainment'},
];

const FEATURES = [
  {
    icon: BarChart2,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    title: 'Live Financial Analysis',
    desc: 'Real-time P/E, P/B, ROE, revenue growth, debt ratios and 20+ financial metrics pulled directly from live market data.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'AI Investment Score',
    desc: 'Proprietary 0–100 scoring engine evaluating profitability, valuation, growth, financial health and cash flow strength.',
  },
  {
    icon: TrendingUp,
    color: 'text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    title: 'DCF Intrinsic Value',
    desc: 'Two-stage discounted cash flow model estimates fair value and computes margin of safety vs current market price.',
  },
  {
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Strategy Screener',
    desc: 'Filter stocks by value, growth or dividend investing strategies with real financial thresholds — not static lists.',
  },
  {
    icon: Star,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Portfolio Analytics',
    desc: 'Build and evaluate multi-stock portfolios. Track weighted scores, sector exposure and combined risk metrics.',
  },
  {
    icon: BookOpen,
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    title: 'Investor Education Hub',
    desc: 'Learn what every metric means, how to read financial statements, and how to think like a professional analyst.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Enter Any Ticker',
    desc: 'Type any NYSE or NASDAQ stock symbol — AAPL, TSLA, NVDA — and hit Analyze.',
    color: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  {
    step: '02',
    title: 'Live Data Fetched',
    desc: 'We pull real-time income statements, balance sheets, cash flows, ratios and market prices simultaneously.',
    color: 'text-green-400',
    border: 'border-green-500/30',
  },
  {
    step: '03',
    title: 'Models Run Instantly',
    desc: 'Our scoring engine and DCF model calculate 25+ metrics across 5 financial dimensions in real time.',
    color: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  {
    step: '04',
    title: 'Get Actionable Insights',
    desc: 'Receive an investment score, intrinsic value estimate, and a full breakdown with educational explanations.',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
  },
];

const SECTOR_COLORS = {
  Technology:    'bg-sky-500/20 text-sky-300',
  Consumer:      'bg-orange-500/20 text-orange-300',
  Automotive:    'bg-red-500/20 text-red-300',
  Finance:       'bg-green-500/20 text-green-300',
  Healthcare:    'bg-pink-500/20 text-pink-300',
  Retail:        'bg-yellow-500/20 text-yellow-300',
  Entertainment: 'bg-purple-500/20 text-purple-300',
};

export default function Home() {
  const [query, setQuery]       = useState('');
  const [inputError, setInputError] = useState('');
  const navigate                = useNavigate();
  const { analyzeStock, loading } = useStock();

  const handleSearch = useCallback(async (symbol) => {
    const ticker = (symbol || query).toUpperCase().trim();
    if (!ticker) {
      setInputError('Please enter a stock ticker symbol.');
      return;
    }
    const valid = /^[A-Z]{1,5}$/.test(ticker);
    if (!valid) {
      setInputError('Enter a valid ticker (1–5 letters, e.g. AAPL, TSLA).');
      return;
    }
    setInputError('');
    await analyzeStock(ticker);
    navigate(`/analysis/${ticker}`);
  }, [query, analyzeStock, navigate]);

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="min-h-screen bg-slate-900">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
            bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            Live market data · Real-time analysis · Free to use
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
            Institutional-Grade
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
              Stock Intelligence
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Enter any stock ticker and get a complete financial analysis - live data,
            AI investment score, intrinsic value estimate, and expert-level insights
            explained in plain English.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto">
            <div className={`flex items-center gap-3 bg-slate-800 border rounded-2xl
              px-4 py-3 shadow-lg transition-all duration-200
              ${inputError ? 'border-red-500/60' : 'border-slate-600 focus-within:border-sky-500'}`}>
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value.toUpperCase()); setInputError(''); }}
                onKeyDown={handleKey}
                placeholder="Enter ticker symbol — AAPL, MSFT, NVDA..."
                className="flex-1 bg-transparent text-white placeholder-slate-500
                  text-base outline-none font-medium tracking-wide"
                maxLength={5}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 bg-sky-500 hover:bg-sky-400
                  disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold
                  rounded-xl transition-all duration-200 shrink-0 text-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white
                      rounded-full animate-spin" />
                    Loading
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

            {inputError && (
              <p className="mt-2 text-red-400 text-sm text-left px-1">{inputError}</p>
            )}

            <p className="text-slate-500 text-xs mt-3">
              Supports all NYSE & NASDAQ listed companies · Data via Financial Modeling Prep
            </p>
          </div>
        </div>
      </section>

      {/* ── POPULAR TICKERS ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp size={18} className="text-sky-400" />
          <h2 className="text-white font-semibold text-lg">Popular Stocks</h2>
          <span className="text-slate-500 text-sm">— click any to analyze instantly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {POPULAR_TICKERS.map(({ symbol, name, sector }) => (
            <button
              key={symbol}
              onClick={() => handleSearch(symbol)}
              disabled={loading}
              className="group flex flex-col items-start gap-1.5 p-3 bg-slate-800
                border border-slate-700 hover:border-sky-500/50 hover:bg-slate-750
                rounded-xl transition-all duration-200 disabled:opacity-50
                disabled:cursor-not-allowed text-left"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-bold text-sm group-hover:text-sky-400
                  transition-colors">{symbol}</span>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-sky-400
                  transition-colors" />
              </div>
              <span className="text-slate-400 text-xs leading-tight line-clamp-1">{name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium
                ${SECTOR_COLORS[sector] || 'bg-slate-700 text-slate-300'}`}>
                {sector}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Everything You Need to Invest{' '}
            <span className="text-sky-400">Intelligently</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Professional-grade tools built for both seasoned investors and those
            just starting their investment journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => ( // eslint-disable-line no-unused-vars
            <div
              key={title}
              className={`p-5 rounded-2xl border bg-slate-800/50 ${bg}
                hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                mb-4 ${bg} border`}>
                <Icon size={20} className={color} />
              </div>
              <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            From ticker to full analysis in under 10 seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS.map(({ step, title, desc, color, border }, i) => (
            <div key={step} className="relative">
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="hidden lg:block absolute top-0 left-full w-full h-px
                  bg-gradient-to-r from-slate-600 to-transparent z-10" />
              )}
              <div className={`p-5 bg-slate-800 border ${border} rounded-2xl h-full`}>
                <div className={`text-3xl font-black ${color} mb-3 opacity-60`}>{step}</div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── METRICS STRIP ────────────────────────────────────── */}
      <section className="border-t border-slate-800 bg-slate-800/30">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '25+',    label: 'Financial Metrics Analyzed' },
              { value: '5',      label: 'Scoring Dimensions'         },
              { value: '100%',   label: 'Live Real-Time Data'        },
              { value: 'Free',   label: 'No Sign-Up Required'        },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-3xl font-black text-sky-400 mb-1">{value}</div>
                <div className="text-slate-400 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br
          from-sky-600/30 to-blue-700/20 border border-sky-500/30 p-10 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10
              rounded-full blur-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 relative">
            Start Analyzing Any Stock Now
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto relative">
            No account needed. No credit card. Just enter a ticker and get
            institutional-quality analysis instantly.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => document.querySelector('input')?.focus(), 500);
            }}
            className="inline-flex items-center gap-2 px-8 py-3 bg-sky-500
              hover:bg-sky-400 text-white font-bold rounded-xl transition-all
              duration-200 text-base relative"
          >
            Analyze a Stock
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row
          items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-500 rounded-md flex items-center justify-center">
              <BarChart2 size={13} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">
              Quant<span className="text-sky-400">Alpha</span>
            </span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            For educational and informational purposes only. Not financial advice.
            Data provided by Financial Modeling Prep.
          </p>
          <p className="text-slate-600 text-xs">© 2025 QuantAlpha</p>
        </div>
      </footer>

    </div>
  );
}