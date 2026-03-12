import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ChevronDown, ChevronUp, TrendingUp,
  DollarSign, Shield, BarChart2, ArrowRight, Zap
} from 'lucide-react';

const MODULES = [
  {
    id: 'basics',
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    title: 'Stock Market Basics',
    subtitle: 'What is a stock? How does investing work?',
    lessons: [
      {
        q: 'What is a stock?',
        a: `A stock (also called a share or equity) represents ownership in a company. When you buy one share of Apple, you literally own a tiny piece of Apple Inc.

Companies sell stock to raise money. In exchange, shareholders get a proportional claim on the company's assets and earnings. If the company grows and becomes more profitable, your share becomes worth more.

Example: If Apple has 10 billion shares outstanding and you own 100 shares, you own 0.000001% of Apple — including its $350B in assets, its brand, its future profits.`,
      },
      {
        q: 'How do investors make money?',
        a: `There are two ways to profit from stocks:

1. Capital Gains: Buy a stock at $100, sell it later at $150. You made $50 per share (50% return).

2. Dividends: Some companies pay cash to shareholders regularly. If you own 100 shares of a company paying $2/share annually, you receive $200/year just for holding the stock.

The key insight: stocks represent businesses. When the business grows earnings and cash flow over time, the stock price generally follows.`,
      },
      {
        q: 'What is a stock exchange?',
        a: `A stock exchange is a marketplace where buyers and sellers trade stocks. The two largest in the world are:

- NYSE (New York Stock Exchange) — home to traditional blue-chip companies like JPMorgan, Coca-Cola, and ExxonMobil.

- NASDAQ — home to technology giants like Apple, Microsoft, Amazon, Google, and Tesla.

When you place a buy order through your broker, it gets matched with a sell order on the exchange in milliseconds. The price you see is the last agreed price between a buyer and seller.`,
      },
      {
        q: 'What is market capitalization?',
        a: `Market capitalization (market cap) = Stock Price × Total Shares Outstanding.

It represents the total market value of a company.

- Mega Cap: > $200B (Apple, Microsoft, NVIDIA)
- Large Cap: $10B – $200B (established blue chips)
- Mid Cap: $2B – $10B (growing companies)
- Small Cap: $300M – $2B (smaller, riskier)
- Micro Cap: < $300M (very risky)

Market cap helps you understand size and risk. Larger companies are generally more stable; smaller companies may grow faster but are more volatile.`,
      },
    ],
  },
  {
    id: 'valuation',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    title: 'Valuation Ratios',
    subtitle: 'Is a stock cheap or expensive?',
    lessons: [
      {
        q: 'What is the P/E Ratio and why does it matter?',
        a: `P/E Ratio = Stock Price ÷ Earnings Per Share (EPS)

It answers: "How many dollars am I paying for every $1 of earnings?"

A P/E of 20 means you're paying $20 for every $1 of annual profit.

- P/E < 15: Potentially undervalued (value investor territory)
- P/E 15–25: Fairly valued for most stable businesses
- P/E 25–40: Growth premium — justified only if earnings are growing fast
- P/E > 40: Very expensive — needs exceptional growth to justify

Important: P/E is meaningless for companies with negative earnings. Always compare P/E to industry peers — tech companies typically have higher P/E than utilities.`,
      },
      {
        q: 'What is the P/B Ratio?',
        a: `P/B Ratio = Stock Price ÷ Book Value Per Share

Book value = what the company would be worth if it sold all its assets and paid off all its debts.

A P/B of 1.0 means you're buying at exactly what the assets are worth.
A P/B of 0.8 means you're buying $1 of assets for only $0.80 — a potential bargain.
A P/B of 10 means you're paying 10x the asset value — the market is pricing in brand, intellectual property, and future earnings.

Benjamin Graham (Warren Buffett's mentor) famously looked for P/B below 1.5 as a margin of safety.`,
      },
      {
        q: 'What is EV/EBITDA?',
        a: `EV/EBITDA = Enterprise Value ÷ EBITDA

Enterprise Value = Market Cap + Debt - Cash (it's the "true" price to buy the whole company).
EBITDA = Earnings Before Interest, Taxes, Depreciation, Amortization (operating cash proxy).

This ratio is useful because it strips out differences in debt and accounting choices, making it better for comparing companies across industries.

- EV/EBITDA < 10: Potentially attractive
- EV/EBITDA 10–15: Fair value for most industries
- EV/EBITDA > 20: Growth premium required

Private equity firms commonly use EV/EBITDA when valuing acquisition targets.`,
      },
      {
        q: 'What is DCF Valuation?',
        a: `DCF (Discounted Cash Flow) is the most rigorous valuation method. It asks: what is this company's future cash flow worth in today's dollars?

The logic: $100 today is worth more than $100 in 5 years (inflation, opportunity cost). So we "discount" future cash flows back to present value.

The formula: Intrinsic Value = Sum of (Future FCF ÷ (1 + Discount Rate)^Year) + Terminal Value

QuantAlpha uses a two-stage DCF:
- Stage 1: Project free cash flow for 5 years using recent growth rates
- Stage 2: Calculate terminal value assuming 2.5% long-run growth

If intrinsic value > current price = potentially undervalued.
If intrinsic value < current price = potentially overvalued.

⚠️ DCF is highly sensitive to assumptions. Small changes in growth rate can dramatically change the output. Always treat DCF as a range, not a precise number.`,
      },
    ],
  },
  {
    id: 'profitability',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    title: 'Profitability Metrics',
    subtitle: 'How efficiently does the company make money?',
    lessons: [
      {
        q: 'What is Return on Equity (ROE)?',
        a: `ROE = Net Income ÷ Shareholders' Equity

It measures how efficiently a company generates profit from shareholders' money.

If a company has $1B in equity and earns $200M in net income, ROE = 20%.

- ROE > 20%: Exceptional — world-class businesses like Apple consistently maintain >100% ROE
- ROE 15–20%: Strong
- ROE 10–15%: Average
- ROE < 10%: Weak — management is not deploying capital effectively

Warren Buffett specifically targets companies with consistently high ROE as a sign of durable competitive advantage (moat).

Warning: Very high ROE can sometimes be caused by excessive debt rather than genuine profitability.`,
      },
      {
        q: 'What is Net Profit Margin?',
        a: `Net Profit Margin = Net Income ÷ Revenue × 100

It tells you what percentage of every dollar of sales becomes profit after all expenses (cost of goods, salaries, rent, taxes, interest).

Example: If Apple earns $97B on $383B revenue, net margin = 25.3%. For every $1 of iPhone you buy, Apple keeps $0.25 as profit.

- > 20%: Outstanding (software, pharma, luxury brands)
- 10–20%: Good (consumer goods, financial services)
- 5–10%: Average (manufacturing, retail)
- < 5%: Thin (grocery, distribution) — any disruption can wipe out profits

Compare margins within industries — grocery stores naturally have thin margins while software companies have fat ones.`,
      },
      {
        q: 'What is Free Cash Flow (FCF)?',
        a: `FCF = Operating Cash Flow - Capital Expenditures

This is arguably the most important financial metric. It represents real cash the company can do anything with: pay dividends, buy back stock, acquire companies, pay off debt, or reinvest.

Unlike net income (which can be manipulated by accounting), cash flow is much harder to fake.

Charlie Munger: "Show me the cash flow."

Positive and growing FCF = financial strength
Negative FCF = company is consuming cash (may be investing for growth, or may be struggling)

High FCF + Low Debt = the dream combination for conservative investors.`,
      },
    ],
  },
  {
    id: 'risk',
    icon: Shield,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    title: 'Risk & Financial Health',
    subtitle: 'Could this company survive a recession?',
    lessons: [
      {
        q: 'What is the Debt-to-Equity Ratio?',
        a: `D/E Ratio = Total Debt ÷ Total Shareholders' Equity

It measures how much debt a company uses relative to its own money.

A D/E of 0.5 means for every $1 of equity, the company borrowed $0.50.
A D/E of 3.0 means heavy reliance on debt — risky if interest rates rise or revenue drops.

- D/E < 0.5: Conservative, low financial risk
- D/E 0.5–1.5: Normal for most industries
- D/E > 2.0: High leverage — acceptable for utilities/banks, risky for others
- D/E > 3.0: Danger zone — vulnerable to interest rate shocks

Important: Some industries (real estate, banking, utilities) naturally carry more debt. Always compare D/E within the same industry.`,
      },
      {
        q: 'What is the Current Ratio?',
        a: `Current Ratio = Current Assets ÷ Current Liabilities

It measures if a company can pay its short-term bills using short-term assets.

Current assets: cash, receivables, inventory (things convertible to cash within 1 year).
Current liabilities: accounts payable, short-term debt (bills due within 1 year).

- Current Ratio > 2.0: Very comfortable — has double the assets needed to cover obligations
- Current Ratio 1.5–2.0: Healthy
- Current Ratio 1.0–1.5: Adequate but tight
- Current Ratio < 1.0: Potential liquidity crisis — can't cover short-term obligations without raising cash

A company can be highly profitable yet go bankrupt if it runs out of short-term cash. This ratio prevents that surprise.`,
      },
      {
        q: 'What is Interest Coverage Ratio?',
        a: `Interest Coverage = EBIT ÷ Interest Expense

EBIT = Earnings Before Interest and Taxes (operating profit).
This ratio asks: how many times over can the company pay its annual interest bill?

If a company earns $500M in operating profit and owes $50M in annual interest:
Interest Coverage = 500 ÷ 50 = 10x. Very safe.

- > 10x: Excellent — interest is negligible concern
- 5–10x: Comfortable
- 2–5x: Manageable but watch closely
- < 2x: Danger — a small drop in earnings could mean default

During recessions, earnings can drop 20–50%. Companies with coverage below 3x are at serious risk in downturns.`,
      },
    ],
  },
  {
    id: 'strategies',
    icon: BarChart2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    title: 'Investment Strategies',
    subtitle: 'Value, growth, dividend — which approach is right for you?',
    lessons: [
      {
        q: 'What is Value Investing?',
        a: `Value investing means buying stocks that trade below their intrinsic value — getting more than what you're paying for.

The philosophy: Mr. Market (Benjamin Graham's metaphor) is often irrational, alternating between excessive optimism and panic. When panic strikes, quality companies get unfairly beaten down. That's your opportunity.

Core criteria:
- Low P/E (< 15–20)
- Low P/B (< 1.5–3)
- Strong balance sheet (low debt)
- Positive free cash flow

Famous practitioners: Warren Buffett, Benjamin Graham, Seth Klarman, Howard Marks.

Key insight: Margin of safety. Buy at a big enough discount that even if you're wrong about the growth rate, you still make money.`,
      },
      {
        q: 'What is Growth Investing?',
        a: `Growth investing means buying companies growing revenues and earnings at above-average rates, even if the current valuation looks expensive by traditional metrics.

The logic: A company growing earnings at 25%/year will be dramatically larger in 5–10 years. Paying 40x earnings today might be cheap relative to what earnings will be in the future.

Core criteria:
- Revenue growth > 15–20% annually
- Expanding profit margins
- Large addressable market
- Strong competitive position

Famous practitioners: Peter Lynch, Philip Fisher, Cathie Wood.

Risk: Growth investing is sensitive to interest rates. When rates rise, future earnings become less valuable in today's dollars, causing high-P/E growth stocks to fall sharply.`,
      },
      {
        q: 'What is Dividend Investing?',
        a: `Dividend investing focuses on companies that pay regular cash dividends and have a history of growing those dividends over time.

The power of compounding: Reinvested dividends account for roughly 40% of the stock market's total return over history.

"Dividend Aristocrats" are S&P 500 companies that have increased dividends for 25+ consecutive years — think Coca-Cola (62 years), Johnson & Johnson (61 years).

Core criteria:
- Dividend yield > 2–3%
- Payout ratio < 60% (sustainable)
- Long track record of dividend growth
- Stable, defensive business model

Best for: Retirees and income investors who need regular cash flow, or long-term investors who want to reinvest dividends for compounding.`,
      },
      {
        q: 'How do I use QuantAlpha\'s AI Score?',
        a: `QuantAlpha's AI Investment Score (0–100) combines five financial dimensions:

1. Profitability (25 pts): ROE, net margin, ROA, gross margin
2. Valuation (20 pts): P/E, P/B, EV/EBITDA — lower is better
3. Growth (20 pts): Revenue YoY growth, EPS YoY growth
4. Financial Health (20 pts): Debt/Equity, Current Ratio, Interest Coverage
5. Cash Flow (15 pts): FCF positive? FCF growing?

Score interpretation:
- 75–100: Strong Buy ★★★★★ — fundamentally excellent
- 60–74: Buy ★★★★ — solid company, attractive
- 45–59: Hold ★★★ — average, no clear edge
- 30–44: Weak ★★ — concerning fundamentals
- 0–29: Avoid ★ — multiple red flags

⚠️ The score is one input among many. Always read the actual financial statements, understand the business, and consider qualitative factors like management quality, competitive moat, and industry dynamics.`,
      },
    ],
  },
];

function AccordionLesson({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4
          bg-slate-700/30 hover:bg-slate-700/50 transition-colors text-left gap-4"
      >
        <span className="text-white font-medium text-sm">{q}</span>
        {open
          ? <ChevronUp size={16} className="text-slate-400 shrink-0" />
          : <ChevronDown size={16} className="text-slate-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 py-4 bg-slate-800/50 border-t border-slate-700">
          <p className="text-slate-300 text-sm leading-7 whitespace-pre-line">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Education() {
  const [activeModule, setActiveModule] = useState('basics');
  const navigate = useNavigate();
  const module = MODULES.find((m) => m.id === activeModule);

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-pink-500/20 border border-pink-500/30
              rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-pink-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Investor Education Hub</h1>
          </div>
          <p className="text-slate-400 text-sm ml-12">
            Learn everything from stock market basics to advanced valuation techniques.
            Each lesson is written for real investors, not textbooks.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar — Module Navigation */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl
              overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-slate-700">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Learning Modules
                </p>
              </div>
              {MODULES.map((m) => {
                const Icon   = m.icon;
                const active = activeModule === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveModule(m.id)}
                    className={`w-full flex items-start gap-3 px-4 py-4 text-left
                      transition-all border-b border-slate-700/50
                      ${active
                        ? `${m.bg} border-l-2 border-l-current ${m.color}`
                        : 'hover:bg-slate-700/40 text-slate-400'
                      }`}
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${active ? m.color : ''}`} />
                    <div>
                      <p className={`text-sm font-semibold ${active ? m.color : 'text-white'}`}>
                        {m.title}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5 leading-tight">
                        {m.subtitle}
                      </p>
                      <p className="text-slate-600 text-xs mt-1">
                        {m.lessons.length} lessons
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {module && (
              <>
                {/* Module Header */}
                <div className={`${module.bg} border ${module.border} rounded-2xl p-6 mb-5`}>
                  <div className="flex items-center gap-3 mb-2">
                    <module.icon size={22} className={module.color} />
                    <h2 className={`font-bold text-xl ${module.color}`}>
                      {module.title}
                    </h2>
                  </div>
                  <p className="text-slate-300 text-sm">{module.subtitle}</p>
                  <p className="text-slate-500 text-xs mt-2">
                    {module.lessons.length} lessons · Estimated 5–10 min read
                  </p>
                </div>

                {/* Lessons */}
                <div className="space-y-3">
                  {module.lessons.map((lesson) => (
                    <AccordionLesson
                      key={lesson.q}
                      q={lesson.q}
                      a={lesson.a}
                    />
                  ))}
                </div>

                {/* CTA — Try it live */}
                <div className="mt-8 bg-slate-800 border border-sky-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-sky-500/20 border border-sky-500/30
                      rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">
                        Apply What You Learned
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Now that you understand{' '}
                        <span className="text-sky-400">{module.title.toLowerCase()}</span>,
                        analyze a real company and see these metrics live.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {['AAPL', 'MSFT', 'NVDA', 'KO', 'JNJ'].map((ticker) => (
                          <button
                            key={ticker}
                            onClick={() => navigate(`/analysis/${ticker}`)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500/10
                              border border-sky-500/30 hover:bg-sky-500/20
                              text-sky-400 rounded-xl text-sm font-semibold
                              transition-all hover:scale-105"
                          >
                            {ticker}
                            <ArrowRight size={13} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-10 bg-gradient-to-br from-slate-800 to-slate-900
          border border-slate-700 rounded-3xl p-8 text-center">
          <h2 className="text-white font-bold text-2xl mb-3">
            The Best Way to Learn is to{' '}
            <span className="text-sky-400">Analyze Real Companies</span>
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6">
            Theory only takes you so far. Open any stock, read the metrics,
            and ask yourself: does this make sense? That's how real investors learn.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500
              hover:bg-sky-400 text-white font-bold rounded-xl transition-all text-sm"
          >
            Analyze a Stock Now
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}