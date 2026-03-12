export default function Loader({ message = 'Fetching live market data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-sky-500/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin" />
        <div
          className="absolute inset-2 border-4 border-transparent border-t-sky-300 rounded-full animate-spin"
          style={{ animationDuration: '0.75s', animationDirection: 'reverse' }}
        />
      </div>
      <div className="text-center">
        <p className="text-white font-semibold text-lg">{message}</p>
        <p className="text-slate-400 text-sm mt-1">
          Analyzing financials, ratios & valuation models
        </p>
      </div>
      <div className="flex items-center gap-2">
        {['Financials', 'Ratios', 'Scoring', 'DCF'].map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className="text-xs text-slate-500 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            >
              {step}
            </span>
            {i < 3 && <span className="text-slate-700">›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}