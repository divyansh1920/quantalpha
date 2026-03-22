import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, TrendingUp, BarChart2, Shield, Zap,
  ArrowRight, Star, BookOpen, ChevronRight,
  Globe, Flame, Clock, Award
} from 'lucide-react';
import { useStock } from '../context/StockContext';

const US_TICKERS = [
  { symbol: 'AAPL',  name: 'Apple',        sector: 'Tech',        flag: '🇺🇸' },
  { symbol: 'MSFT',  name: 'Microsoft',    sector: 'Tech',        flag: '🇺🇸' },
  { symbol: 'NVDA',  name: 'NVIDIA',       sector: 'Chips',       flag: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet',     sector: 'Tech',        flag: '🇺🇸' },
  { symbol: 'AMZN',  name: 'Amazon',       sector: 'E-Commerce',  flag: '🇺🇸' },
  { symbol: 'TSLA',  name: 'Tesla',        sector: 'EV',          flag: '🇺🇸' },
  { symbol: 'META',  name: 'Meta',         sector: 'Social',      flag: '🇺🇸' },
  { symbol: 'JPM',   name: 'JPMorgan',     sector: 'Finance',     flag: '🇺🇸' },
  { symbol: 'V',     name: 'Visa',         sector: 'Payments',    flag: '🇺🇸' },
  { symbol: 'JNJ',   name: 'J&J',          sector: 'Healthcare',  flag: '🇺🇸' },
  { symbol: 'WMT',   name: 'Walmart',      sector: 'Retail',      flag: '🇺🇸' },
  { symbol: 'NFLX',  name: 'Netflix',      sector: 'Streaming',   flag: '🇺🇸' },
];

const INDIA_TICKERS = [
  { symbol: 'RELIANCE.NS',    name: 'Reliance',       sector: 'Conglomerate', flag: '🇮🇳' },
  { symbol: 'TCS.NS',         name: 'TCS',            sector: 'IT',           flag: '🇮🇳' },
  { symbol: 'HDFCBANK.NS',    name: 'HDFC Bank',      sector: 'Banking',      flag: '🇮🇳' },
  { symbol: 'INFY.NS',        name: 'Infosys',        sector: 'IT',           flag: '🇮🇳' },
  { symbol: 'ICICIBANK.NS',   name: 'ICICI Bank',     sector: 'Banking',      flag: '🇮🇳' },
  { symbol: 'BAJFINANCE.NS',  name: 'Bajaj Finance',  sector: 'NBFC',         flag: '🇮🇳' },
  { symbol: 'HINDUNILVR.NS',  name: 'HUL',            sector: 'FMCG',         flag: '🇮🇳' },
  { symbol: 'WIPRO.NS',       name: 'Wipro',          sector: 'IT',           flag: '🇮🇳' },
  { symbol: 'ASIANPAINT.NS',  name: 'Asian Paints',   sector: 'Paints',       flag: '🇮🇳' },
  { symbol: 'TITAN.NS',       name: 'Titan',          sector: 'Retail',       flag: '🇮🇳' },
  { symbol: 'ZOMATO.NS',      name: 'Zomato',         sector: 'FoodTech',     flag: '🇮🇳' },
  { symbol: 'ADANIENT.NS',    name: 'Adani Ent.',     sector: 'Infra',        flag: '🇮🇳' },
];

const SECTOR_COLORS = {
  Tech: 'bg-sky-500/20 text-sky-300', Chips: 'bg-purple-500/20 text-purple-300',
  'E-Commerce': 'bg-orange-500/20 text-orange-300', EV: 'bg-red-500/20 text-red-300',
  Social: 'bg-blue-500/20 text-blue-300', Finance: 'bg-green-500/20 text-green-300',
  Payments: 'bg-emerald-500/20 text-emerald-300', Healthcare: 'bg-pink-500/20 text-pink-300',
  Retail: 'bg-yellow-500/20 text-yellow-300', Streaming: 'bg-red-500/20 text-red-300',
  Conglomerate: 'bg-orange-500/20 text-orange-300', IT: 'bg-sky-500/20 text-sky-300',
  Banking: 'bg-green-500/20 text-green-300', NBFC: 'bg-teal-500/20 text-teal-300',
  FMCG: 'bg-yellow-500/20 text-yellow-300', Paints: 'bg-pink-500/20 text-pink-300',
  FoodTech: 'bg-orange-500/20 text-orange-300', Infra: 'bg-stone-500/20 text-stone-300',
};

const FEATURES = [
  { icon: BarChart2, color: 'text-sky-400',    bg: 'bg-sky-500/10 border-sky-500/20',    title: 'Live Financial Analysis',  desc: 'P/E, P/B, ROE, revenue growth, debt ratios and 20+ live metrics on any stock.' },
  { icon: Zap,       color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', title: 'AI Investment Score',    desc: '0–100 normalized score across 5 dimensions. Works even with partial data.' },
  { icon: TrendingUp,color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  title: 'DCF Intrinsic Value',  desc: 'Two-stage discounted cash flow model estimates fair value and margin of safety.' },
  { icon: Shield,    color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20',title: 'Strategy Screener',    desc: 'Value, growth, dividend and quality strategies for both US and Indian markets.' },
  { icon: Star,      color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20',title: 'Portfolio Analytics',  desc: 'Compare up to 8 stocks side by side with combined score and sector breakdown.' },
  { icon: BookOpen,  color: 'text-pink-400',   bg: 'bg-pink-500/10 border-pink-500/20',    title: 'Education Hub',       desc: 'Real case studies — Enron, Buffett, Lehman Brothers — with video lectures.' },
];

const STEPS = [
  { step: '01', title: 'Enter Any Ticker',    desc: 'Type AAPL, RELIANCE.NS, TCS.NS — any global stock symbol.',  color: 'text-sky-400',    border: 'border-sky-500/30'    },
  { step: '02', title: 'Live Data Fetched',   desc: 'Income statements, balance sheets, ratios pulled instantly.', color: 'text-green-400',  border: 'border-green-500/30'  },
  { step: '03', title: 'Models Run',          desc: 'Normalized AI score and DCF model calculate in real time.',   color: 'text-yellow-400', border: 'border-yellow-500/30' },
  { step: '04', title: 'Insights Delivered',  desc: 'Score, valuation, charts, and plain-English explanations.',  color: 'text-purple-400', border: 'border-purple-500/30' },
];

// Animated counter hook
function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function AnimatedStat({ value, label, color, suffix = '' }) {
  const count = useCounter(typeof value === 'number' ? value : 0);
  return (
    <div className="text-center">
      <div className={`text-3xl font-black ${color} mb-1`}>
        {typeof value === 'number' ? count + suffix : value}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
}

// Scrolling ticker marquee
function MarqueeTicker({ tickers }) {
  const doubled = [...tickers, ...tickers];
  return (
    <div className="overflow-hidden border-y border-slate-700/50 bg-slate-800/30 py-2.5">
      <div className="flex gap-6 animate-marquee whitespace-nowrap"
        style={{ animation: 'marquee 40s linear infinite' }}>
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-400 font-mono">{t.symbol.replace('.NS', '')}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">{t.name}</span>
            {t.flag && <span>{t.flag}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [query, setQuery]         = useState('');
  const [inputError, setInputError] = useState('');
  const [market, setMarket]       = useState('us');
  const navigate                  = useNavigate();
  const { analyzeStock, loading } = useStock();

  const handleSearch = useCallback(async (symbol) => {
    const raw    = symbol || query;
    const ticker = raw.toUpperCase().trim();
    if (!ticker) { setInputError('Please enter a stock ticker symbol.'); return; }

    // Allow .NS suffix for Indian stocks
    const valid = /^[A-Z]{1,20}(\.[A-Z]{1,3})?$/.test(ticker);
    if (!valid) { setInputError('Enter a valid ticker — e.g. AAPL, RELIANCE.NS, TCS.NS'); return; }

    setInputError('');
    await analyzeStock(ticker);
    navigate(`/analysis/${ticker}`);
  }, [query, analyzeStock, navigate]);

  const tickers = market === 'india' ? INDIA_TICKERS : US_TICKERS;

  return (
    <div className="min-h-screen bg-slate-900">

      {/* ── CSS for marquee animation ── */}
      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes pulse-glow { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px]
            bg-sky-600/10 rounded-full blur-3xl"
            style={{ animation: 'pulse-glow 4s ease-in-out infinite' }} />
          <div className="absolute top-[-50px] right-[5%] w-[400px] h-[400px]
            bg-purple-600/8 rounded-full blur-3xl"
            style={{ animation: 'pulse-glow 5s ease-in-out infinite 1s' }} />
          <div className="absolute bottom-0 left-[40%] w-[300px] h-[300px]
            bg-sky-500/5 rounded-full blur-2xl"
            style={{ animation: 'pulse-glow 6s ease-in-out infinite 2s' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            bg-sky-500/10 border border-sky-500/30 text-sky-400 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            🇺🇸 US + 🇮🇳 Indian Markets · Live Data · Free
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white
            leading-tight mb-4 tracking-tight">
            Analyze Any Stock
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text
                bg-gradient-to-r from-sky-400 via-blue-400 to-purple-500">
                Like a Pro Analyst
              </span>
            </span>
          </h1>

          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10
            leading-relaxed">
            Enter any US or Indian stock ticker — get AI scoring, DCF valuation,
            financial ratios, charts and plain-English interpretation. <br />
            <span className="text-sky-400 font-semibold">No sign-up. No fees. Just intelligence.</span>
          </p>

          {/* Market switcher */}
          <div className="flex justify-center mb-4">
            <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1">
              {[
                { id: 'us',    label: '🇺🇸 US Market',    placeholder: 'AAPL, MSFT, NVDA...' },
                { id: 'india', label: '🇮🇳 Indian Market', placeholder: 'RELIANCE.NS, TCS.NS...' },
              ].map(({ id, label }) => (
                <button key={id} onClick={() => { setMarket(id); setQuery(''); setInputError(''); }}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                    market === id
                      ? 'bg-sky-500 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className={`flex items-center gap-3 bg-slate-800 border rounded-2xl
              px-4 py-3 shadow-2xl transition-all duration-200
              ${inputError
                ? 'border-red-500/60'
                : 'border-slate-600 focus-within:border-sky-500 focus-within:shadow-sky-500/10'}`}>
              <Search size={20} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value.toUpperCase()); setInputError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={market === 'india'
                  ? 'Enter NSE ticker — RELIANCE.NS, TCS.NS, INFY.NS...'
                  : 'Enter ticker — AAPL, MSFT, NVDA, TSLA...'}
                className="flex-1 bg-transparent text-white placeholder-slate-500
                  text-base outline-none font-medium"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 bg-sky-500
                  hover:bg-sky-400 disabled:bg-slate-600 disabled:cursor-not-allowed
                  text-white font-bold rounded-xl transition-all duration-200
                  shrink-0 text-sm shadow-lg shadow-sky-500/25"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white
                    rounded-full animate-spin" />
                ) : (
                  <><Zap size={15} /> Analyze</>
                )}
              </button>
            </div>

            {inputError && (
              <p className="mt-2 text-red-400 text-sm text-left px-1">{inputError}</p>
            )}

            {market === 'india' && (
              <p className="text-slate-500 text-xs mt-3">
                🇮🇳 Indian stocks use <code className="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">.NS</code> suffix —
                e.g. <code className="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">RELIANCE.NS</code>,
                <code className="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs ml-1">TCS.NS</code>,
                <code className="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs ml-1">HDFCBANK.NS</code>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── MARQUEE TICKER ───────────────────────────────── */}
      <MarqueeTicker tickers={[...US_TICKERS, ...INDIA_TICKERS]} />

      {/* ── POPULAR STOCKS ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Flame size={18} className="text-orange-400" />
            <h2 className="text-white font-bold text-lg">
              {market === 'india' ? '🇮🇳 Popular Indian Stocks' : '🇺🇸 Popular US Stocks'}
            </h2>
            <span className="text-slate-500 text-sm">— click to analyze instantly</span>
          </div>
          <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
            {[{ id: 'us', label: '🇺🇸 US' }, { id: 'india', label: '🇮🇳 India' }].map(({ id, label }) => (
              <button key={id} onClick={() => setMarket(id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all
                  ${market === id ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tickers.map(({ symbol, name, sector, flag }) => (
            <button
              key={symbol}
              onClick={() => handleSearch(symbol)}
              disabled={loading}
              className="group flex flex-col items-start gap-1.5 p-3.5 bg-slate-800
                border border-slate-700 hover:border-sky-500/60 hover:bg-slate-750
                rounded-xl transition-all duration-200 disabled:opacity-50
                disabled:cursor-not-allowed text-left hover:shadow-lg
                hover:shadow-sky-500/5 hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-white font-bold text-sm group-hover:text-sky-400
                  transition-colors font-mono">
                  {symbol.replace('.NS', '')}
                </span>
                <ChevronRight size={13} className="text-slate-600 group-hover:text-sky-400
                  transition-all group-hover:translate-x-0.5" />
              </div>
              <span className="text-slate-400 text-xs leading-tight line-clamp-1">{name}</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">{flag}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium
                  ${SECTOR_COLORS[sector] || 'bg-slate-700 text-slate-300'}`}>
                  {sector}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────── */}
      <section className="border-y border-slate-700/50 bg-slate-800/40 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedStat value={25}  suffix="+"  label="Financial Metrics"    color="text-sky-400"    />
            <AnimatedStat value={5}   suffix=""   label="Scoring Dimensions"   color="text-green-400"  />
            <AnimatedStat value={100} suffix="%"  label="Live Real-Time Data"  color="text-purple-400" />
            <AnimatedStat value="Free" label="No Sign-Up Required"  color="text-yellow-400" />
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-green-500/10 border border-green-500/30 text-green-400 text-xs
            font-semibold mb-4">
            <Award size={12} /> What QuantAlpha Does
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Everything to Invest{' '}
            <span className="text-sky-400">Intelligently</span>
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Professional tools built for both seasoned investors and those
            just beginning their investment journey.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature) => {
            const FeatureIcon = feature.icon;
            return (
               <div key={feature.title}
               className={`group p-5 rounded-2xl border bg-slate-800/60 ${feature.bg}
               hover:scale-[1.02] hover:shadow-xl transition-all duration-200 cursor-default`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.bg} border`}
                style={{ animation: 'float 4s ease-in-out infinite' }}>
                   <FeatureIcon size={20} className={feature.color} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
            
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-semibold mb-4">
            <Clock size={12} /> Under 10 Seconds
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
          <p className="text-slate-400">From ticker to full analysis in seconds.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(({ step, title, desc, color, border }, i) => (
            <div key={step} className="relative">
              {i < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px
                  bg-gradient-to-r from-slate-600 to-transparent z-10" />
              )}
              <div className={`p-5 bg-slate-800 border ${border} rounded-2xl h-full
                hover:scale-[1.02] transition-transform duration-200`}>
                <div className={`text-4xl font-black ${color} mb-3 opacity-50`}>{step}</div>
                <h3 className="text-white font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── INDIAN MARKET HIGHLIGHT ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br
          from-orange-600/15 via-slate-800 to-green-700/10
          border border-orange-500/20 p-8 md:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5
            rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start
            md:items-center gap-6">
            <div className="text-5xl">🇮🇳</div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-2xl mb-2">
                Full Indian Market Support
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl mb-4">
                Analyze any NSE-listed stock — Reliance, TCS, HDFC Bank, Infosys,
                Zomato and 2,000+ more. Use the <code className="text-orange-400
                bg-slate-900/60 px-1.5 py-0.5 rounded text-xs">.NS</code> suffix
                (e.g. <code className="text-orange-400 bg-slate-900/60 px-1.5 py-0.5
                rounded text-xs">RELIANCE.NS</code>) to access live NSE data.
              </p>
              <div className="flex flex-wrap gap-2">
                {['RELIANCE.NS','TCS.NS','HDFCBANK.NS','INFY.NS','ZOMATO.NS'].map((t) => (
                  <button key={t} onClick={() => handleSearch(t)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10
                      border border-orange-500/30 hover:bg-orange-500/20
                      text-orange-300 rounded-lg text-xs font-mono font-semibold
                      transition-all hover:scale-105">
                    {t.replace('.NS', '')}
                    <ArrowRight size={11} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br
          from-sky-600/25 to-blue-700/15 border border-sky-500/30 p-10 text-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10
              rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10
              rounded-full blur-3xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4 relative">
            Start Analyzing Any Stock Now
          </h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto relative text-sm leading-relaxed">
            US or Indian market. No account. No fee. Type a ticker and get
            institutional-quality analysis in under 10 seconds.
          </p>
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTimeout(() => document.querySelector('input')?.focus(), 500); }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-sky-500
              hover:bg-sky-400 text-white font-bold rounded-xl transition-all
              duration-200 text-base relative shadow-lg shadow-sky-500/25
              hover:-translate-y-0.5"
          >
            <Zap size={18} /> Analyze a Stock
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row
          items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-sky-500 rounded-md flex items-center justify-center">
              <BarChart2 size={13} className="text-white" />
            </div>
            <span className="text-white font-bold text-sm">
              Quant<span className="text-sky-400">Alpha</span>
            </span>
            <span className="text-slate-600 text-xs ml-2">🇺🇸 + 🇮🇳</span>
          </div>
          <p className="text-slate-500 text-xs text-center">
            Build By - Divyansh Jain (FORE School of Management, New Delhi)
          </p>
          <p className="text-slate-500 text-xs text-center">
            Build By - Divyansh Jain (FORE School of Management, New Delhi)
          </p>
          <p className="text-slate-600 text-xs">© 2025 QuantAlpha</p>
        </div>
      </footer>
    </div>
  );
}
