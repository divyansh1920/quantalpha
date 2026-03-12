import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, TrendingUp, PieChart, BookOpen, Menu, X } from 'lucide-react';

const LINKS = [
  { to: '/',           label: 'Home',      icon: BarChart2  },
  { to: '/screener',   label: 'Screener',  icon: TrendingUp },
  { to: '/portfolio',  label: 'Portfolio', icon: PieChart   },
  { to: '/education',  label: 'Learn',     icon: BookOpen   },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Quant<span className="text-sky-400">Alpha</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {LINKS.map(({ to, label, icon: Icon }) => { // eslint-disable-line no-unused-vars
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-sky-500/20 text-sky-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Live badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-medium">Live Data</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-700 bg-slate-800 px-4 py-2">
          {LINKS.map(({ to, label, icon: Icon }) => ( // eslint-disable-line no-unused-vars
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                pathname === to ? 'text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}