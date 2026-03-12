import { Info } from 'lucide-react';
import { useState } from 'react';

export default function MetricCard({ label, value, subtext, color = 'text-white', tooltip }) {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex flex-col gap-1 relative">
      <div className="flex items-center gap-1.5">
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</span>
        {tooltip && (
          <div className="relative">
            <Info
              size={12}
              className="text-slate-600 hover:text-slate-400 cursor-pointer"
              onMouseEnter={() => setShow(true)}
              onMouseLeave={() => setShow(false)}
            />
            {show && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52
                bg-slate-700 border border-slate-600 text-slate-300 text-xs rounded-lg
                p-2.5 z-50 leading-relaxed shadow-xl">
                {tooltip}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {subtext && <div className="text-slate-500 text-xs">{subtext}</div>}
    </div>
  );
}