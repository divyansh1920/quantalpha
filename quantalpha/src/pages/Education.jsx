import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, ChevronDown, ChevronUp, ArrowRight,
  Play, Lock, CheckCircle, Zap, TrendingUp,
  DollarSign, Shield, BarChart2, Star, Youtube
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   VIDEO PLAYLIST — Replace src with your YouTube embed URLs
   Format: https://www.youtube.com/embed/VIDEO_ID
   ───────────────────────────────────────────────────────────── */
const VIDEO_PLAYLIST = [
  {
    id: 'v1',
    title: 'What Is a Stock? — The Ownership Mindset',
    duration: '8 min',
    module: 'basics',
    src: '',   // ← paste your YouTube embed URL here
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'Understand what you actually own when you buy a stock, and why thinking like an owner changes everything.',
  },
  {
    id: 'v2',
    title: 'Reading a P&L — Income Statement Explained',
    duration: '12 min',
    module: 'profitability',
    src: '',
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'Walk through a real Apple income statement line by line. Revenue, gross profit, operating income, net income.',
  },
  {
    id: 'v3',
    title: 'P/E Ratio Deep Dive — When Is a Stock Cheap?',
    duration: '10 min',
    module: 'valuation',
    src: '',
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'Why Netflix at P/E 40 can be cheaper than Walmart at P/E 20. Context is everything.',
  },
  {
    id: 'v4',
    title: 'DCF Valuation — The Buffett Method',
    duration: '15 min',
    module: 'valuation',
    src: '',
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'Build a discounted cash flow model from scratch using Coca-Cola as the example.',
  },
  {
    id: 'v5',
    title: 'Debt & Risk — What Kills Good Companies',
    duration: '9 min',
    module: 'risk',
    src: '',
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'How Toys R Us, Sears and Lehman Brothers collapsed despite strong revenues — all because of debt.',
  },
  {
    id: 'v6',
    title: 'Portfolio Construction — Diversification Done Right',
    duration: '11 min',
    module: 'strategies',
    src: '',
    thumbnail: 'https://img.youtube.com/vi/default/hqdefault.jpg',
    description: 'Why owning 50 stocks is not safer than owning 12 great ones. The math of diversification.',
  },
];

const MODULES = [
  {
    id: 'basics',
    icon: BookOpen,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    activeBorder: 'border-l-sky-400',
    title: 'Stock Market Basics',
    subtitle: 'What is a stock? How does investing work?',
    tag: 'Start Here',
    tagColor: 'bg-sky-500/20 text-sky-400',
    lessons: [
      {
        q: 'What is a stock? — The restaurant analogy',
        a: `Imagine your friend opens a pizza restaurant. It costs ₹10,00,000 to set up. She splits ownership into 1,000 equal pieces called "shares" and sells 500 of them to raise capital. You buy 100 shares for ₹1,000 each — spending ₹1,00,000.

You now own 10% of the restaurant.

Every year, if the restaurant earns ₹2,00,000 in profit, your 10% cut = ₹20,000. As the restaurant gets famous and expands to 5 locations, the value of your original ₹1,00,000 investment might grow to ₹10,00,000 — a 10x return.

That's exactly what a stock is. When you buy one share of Apple (AAPL), you own a tiny but real piece of Apple Inc. — its iPhones, its brand, its cash pile, and its future profits.

The stock price moves because of one thing: people's expectations about future profits. If Apple announces iPhone sales are booming, expectations rise → price rises. If iPhone sales disappoint → price falls.

📌 Key insight: You are not buying a ticker symbol. You are buying a business.`,
        example: {
          title: 'Real Example: Early Amazon Investors',
          body: `Amazon IPO'd in May 1997 at $18/share. The company was burning cash and had never made a profit. "How can you value a company with no earnings?" analysts asked.

Investors who understood the business — not the ticker — saw a flywheel: more customers → more sellers → lower prices → more customers. They bought and held.

$10,000 invested in Amazon at IPO in 1997 would be worth approximately $24,000,000 by 2024.

The lesson: understanding the business model matters infinitely more than reading the chart.`,
        },
      },
      {
        q: 'How do stock prices actually move? — Mr. Market',
        a: `Benjamin Graham (Warren Buffett's mentor) described the stock market as a manic-depressive business partner he called "Mr. Market."

Every day, Mr. Market shows up at your door and offers to buy your shares or sell you his shares at a specific price. Some days he's euphoric — the economy is booming, he quotes outrageously high prices. Other days he's terrified — he quotes absurdly low prices and wants to sell everything.

The crucial insight: you don't have to trade with Mr. Market. You can ignore him. His daily mood swings don't change the underlying value of the business you own.

This is why stock prices are volatile even when businesses are stable:
- A company earning $5B in profit this year and next year shouldn't logically be worth 30% less in December than it was in January — but it often is.
- That gap between price and value is where opportunities live.

Short term: Stock prices are driven by sentiment, news, fear, greed, and momentum.
Long term: Stock prices follow earnings and cash flow.

Peter Lynch said it best: "In the short run, the market is a voting machine. In the long run, it's a weighing machine."`,
        example: {
          title: 'Real Example: COVID Crash, March 2020',
          body: `Between Feb 19 and March 23, 2020, the S&P 500 fell 34% in 33 days — the fastest crash in history.

Was Microsoft's business worth 34% less? No. Did people stop using Excel? No. Did Azure cloud growth stop? No.

Mr. Market was in a panic. Investors who understood the businesses they owned bought more shares. By August 2020 — just 5 months later — the market had fully recovered. By December 2020 it was at all-time highs.

The businesses hadn't changed. Only the mood had.`,
        },
      },
      {
        q: 'What is market capitalization — and why size matters',
        a: `Market Cap = Stock Price × Total Shares Outstanding

It's the price tag the market puts on the entire company right now.

Think of it this way: if you wanted to buy 100% of Apple, you'd need to pay the market cap. As of 2024, that's approximately $3 trillion — making it one of the most valuable companies ever to exist.

Size categories:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mega Cap  > $200B   Apple, Microsoft, NVIDIA — global juggernauts
Large Cap  $10B–200B  Stable blue chips, institutional favorites
Mid Cap    $2B–10B   Growing companies with proven models
Small Cap  $300M–2B  Higher risk, higher potential
Micro Cap  < $300M   Often illiquid, very speculative
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Why does this matter for returns?

A $3 trillion company (Apple) cannot 10x to $30 trillion — there isn't enough money in the world to support that valuation. But a $500M company has room to grow 20x.

Historically, small caps have outperformed large caps over long periods — but with significantly more volatility. A small cap can fall 60–70% in a downturn.

📌 Rule of thumb: Allocate based on your risk tolerance. The younger you are, the more growth/small cap exposure you can handle.`,
        example: {
          title: 'Real Example: NVIDIA\'s incredible run',
          body: `In January 2023, NVIDIA had a market cap of ~$300B. Many considered it "too expensive."

Then ChatGPT exploded. Every AI company needed NVIDIA's H100 GPUs. Earnings grew 600% year-over-year.

By June 2024, NVIDIA crossed $3 trillion — a 10x increase in 18 months from a $300B base.

This is rare. It happened because earnings literally 10x'd, which justified the market cap expansion. Not every stock can do this — NVIDIA had a near-monopoly on AI hardware at exactly the right moment.`,
        },
      },
    ],
  },

  {
    id: 'valuation',
    icon: DollarSign,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    activeBorder: 'border-l-green-400',
    title: 'Valuation Ratios',
    subtitle: 'Is this stock cheap or expensive right now?',
    tag: 'Core Skill',
    tagColor: 'bg-green-500/20 text-green-400',
    lessons: [
      {
        q: 'The P/E Ratio — The most used (and misused) metric in investing',
        a: `P/E Ratio = Stock Price ÷ Earnings Per Share

Interpretation: "How much am I paying for every ₹1 (or $1) of annual profit?"

A P/E of 20 means you're paying 20 years' worth of current earnings upfront. That sounds expensive — until you realize that if earnings grow 20% per year, you're actually paying for future earnings, not current ones.

This is the most common mistake beginners make: comparing P/E ratios without accounting for growth.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P/E INTERPRETATION GUIDE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
< 10    Very cheap — or earnings are about to collapse. Investigate why.
10–15   Bargain territory for quality businesses
15–20   Fair value for stable, slow-growth companies
20–30   Growth premium — justified if EPS growing 15%+/year
30–50   Aggressive growth pricing — needs execution
> 50    Speculative — earnings must grow exponentially
Negative  Company is losing money — P/E is meaningless
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The PEG Ratio fixes the growth problem:
PEG = P/E ÷ Annual Earnings Growth Rate
PEG < 1.0 = potentially undervalued even with a high P/E
PEG > 2.0 = overvalued relative to growth

Peter Lynch: "The P/E ratio of any company that's fairly priced will equal its growth rate."`,
        example: {
          title: 'Case Study: Netflix vs. Walmart P/E Comparison',
          body: `In 2020:
- Netflix P/E: 85 — "massively overvalued!" screamed analysts
- Walmart P/E: 24 — "fairly valued"

But look at growth rates:
- Netflix subscriber growth: 22%/year, revenue growth 24%/year
- Walmart revenue growth: 2%/year

Netflix PEG = 85 ÷ 22 = 3.9 (expensive on growth basis)
Walmart PEG = 24 ÷ 2 = 12 (even MORE expensive on growth basis!)

Paying 85x for 22% growth is arguably better than paying 24x for 2% growth.

This is why context destroys simple P/E comparisons. Always ask: what growth rate justifies this P/E?`,
        },
      },
      {
        q: 'The P/B Ratio — What are you paying for the skeleton of the business?',
        a: `P/B Ratio = Market Price Per Share ÷ Book Value Per Share

Book Value = Total Assets − Total Liabilities = what shareholders would theoretically receive if the company liquidated today.

Think of it as the "skeleton price" — the bare minimum worth of the company if it stopped operating and sold everything.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P/B INTERPRETATION GUIDE  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
< 1.0   Trading below asset value — deep value or value trap
1.0–2.0  Benjamin Graham's sweet spot for margin of safety
2.0–5.0  Market pricing in brand/IP value above physical assets
> 10    Almost entirely intangible value (brand, software, IP)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Important: P/B is nearly useless for technology and software companies.

Why? Microsoft's most valuable assets — Windows, Azure, GitHub, Office 365 — don't appear on the balance sheet because they were built internally, not purchased. Microsoft's "book value" wildly understates its real worth.

P/B works best for: Banks, insurance companies, real estate, and industrial companies where assets on the balance sheet actually represent the real value.`,
        example: {
          title: 'Case Study: Booking.com vs. Marriott Hotels',
          body: `Marriott Hotels owns thousands of physical properties — land, buildings, furniture.
P/B ≈ 10 (the market prices in brand and loyalty program above physical assets)

Booking.com (online travel platform) owns essentially NO physical assets.
P/B ≈ 15

Which is "more expensive" on P/B? Booking.com.
Which generates more free cash flow per dollar of assets? Booking.com, by a massive margin.

The lesson: P/B is a context-dependent ratio. An "asset-light" business model (software, platforms, marketplaces) will always look expensive on P/B — but that's a feature, not a bug. These businesses generate extraordinary returns on minimal capital.`,
        },
      },
      {
        q: 'DCF Valuation — Thinking like a business appraiser, not a trader',
        a: `DCF (Discounted Cash Flow) is how professional investors, private equity firms, and M&A bankers actually value companies. It's the most rigorous — and humbling — valuation method.

The core idea: A business is worth the sum of all the cash it will ever generate, discounted back to today's dollars.

Why discount? Because $100 today is worth more than $100 in 5 years. You could invest that $100 and earn 10%/year. So $100 in 5 years is worth only $62 in today's money (at 10% discount rate).

THE TWO-STAGE DCF MODEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Stage 1: Project Free Cash Flow for 5 years
  Year 1 FCF = Current FCF × (1 + growth rate)
  Year 2 FCF = Year 1 FCF × (1 + growth rate) ... and so on

Stage 2: Terminal Value (everything after year 5)
  Terminal Value = Year 5 FCF × (1 + 2.5%) ÷ (10% - 2.5%)
  (assumes 2.5% growth forever, 10% discount rate)

Intrinsic Value = PV of Stage 1 + PV of Terminal Value
Intrinsic Value Per Share = Total ÷ Shares Outstanding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If Intrinsic Value > Current Price → potentially undervalued ✅
If Intrinsic Value < Current Price → potentially overvalued ❌

The biggest risk of DCF: garbage in, garbage out. Change the growth rate assumption from 10% to 15% and the intrinsic value can double. This is why DCF should be used as a range of values, not a single "correct" answer.

Warren Buffett: "I'd rather be approximately right than precisely wrong."`,
        example: {
          title: 'Worked Example: Simple Coca-Cola DCF',
          body: `Coca-Cola 2023 Free Cash Flow: ~$9.5 Billion
Shares Outstanding: ~4.3 Billion
Conservative Growth Assumption: 5%/year (Coke is slow and steady)
Discount Rate: 10%

Year 1: $9.5B × 1.05 = $9.975B → PV = $9.07B
Year 2: $9.975B × 1.05 = $10.47B → PV = $8.65B
Year 3: $10.47B × 1.05 = $10.99B → PV = $8.25B
Year 4: $10.99B × 1.05 = $11.54B → PV = $7.88B
Year 5: $11.54B × 1.05 = $12.12B → PV = $7.53B

Sum of Stage 1 PV = $41.38B

Terminal Value = $12.12B × 1.025 ÷ (0.10 - 0.025) = $165.6B
PV of Terminal Value = $165.6B ÷ 1.61 = $102.9B

Total Intrinsic Value = $41.38B + $102.9B = $144.3B
Per Share = $144.3B ÷ 4.3B = ~$33.56/share

Coke's actual price when this was calculated: ~$59

Result: Overvalued on conservative DCF assumptions.
But if you assume 8% growth (more optimistic): intrinsic value ~$65 — fairly valued.

This range ($33–$65) is how a professional uses DCF. Not one number. A range.`,
        },
      },
    ],
  },

  {
    id: 'profitability',
    icon: TrendingUp,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    activeBorder: 'border-l-purple-400',
    title: 'Profitability Metrics',
    subtitle: 'How efficiently does the company make money?',
    tag: 'Must Know',
    tagColor: 'bg-purple-500/20 text-purple-400',
    lessons: [
      {
        q: 'Return on Equity (ROE) — The single best measure of management quality',
        a: `ROE = Net Income ÷ Shareholders' Equity × 100

It answers: "For every ₹100 of shareholders' money, how much profit did management generate?"

ROE is Warren Buffett's favorite metric. He specifically looks for companies with sustained ROE above 15% without using excessive debt.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ROE INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 30%   World-class. Companies like Apple, Visa, Mastercard
> 20%   Excellent. Strong competitive advantage
> 15%   Good. Above-average management
> 10%   Average
< 10%   Poor capital allocation
Negative  Company is destroying shareholder value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The DuPont Formula breaks ROE into three parts:
ROE = Net Margin × Asset Turnover × Leverage

- High ROE from high margins = great business (Apple)
- High ROE from high asset turnover = efficient operations (Walmart)
- High ROE from high leverage = risky (can collapse if business stumbles)

Always check: Is the ROE driven by profits or by debt?

A company with $100 equity and $500 in debt that earns $30 profit has ROE of 30% — but it's leveraged 5x. If earnings drop 20%, it may not be able to service its debt.`,
        example: {
          title: 'Case Study: Apple vs. a Steel Company',
          body: `Apple 2023 ROE: ~147%

How is ROE above 100% possible? Apple buys back so much stock that equity has shrunk. They earn enormous profits relative to the tiny amount of equity left on the books. This is actually a sign of extraordinary capital returns to shareholders.

A typical steel company ROE: 8–12%

Steel companies own massive physical factories, equipment, mines. They need billions in equity just to operate. They earn modest profits relative to that equity base.

This is why you can't compare ROE across industries. A software company with 40% ROE is doing well. A bank with 12% ROE is doing well. A retailer with 8% ROE is doing well. Each industry has a "normal range."`,
        },
      },
      {
        q: 'Free Cash Flow — The one number that cannot be faked',
        a: `FCF = Operating Cash Flow − Capital Expenditures

Net income is an accounting construct. It includes non-cash items like depreciation, amortization, stock-based compensation, and is subject to management's accounting choices.

Free Cash Flow is real money. It's the cash left in the bank account after the company paid for everything it needs to maintain and grow the business.

Charlie Munger's famous line: "Show me the cash flow."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FCF INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Strong + growing FCF    Best sign of financial health
Positive but flat FCF   Stable but not compounding
Negative FCF            Burning cash — is it investing or struggling?
FCF > Net Income        High quality earnings (good sign)
FCF << Net Income       Earnings may be overstated (investigate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What do companies do with FCF?
1. Pay dividends (returns cash to shareholders)
2. Buy back shares (reduces share count, increases EPS)
3. Pay down debt (reduces financial risk)
4. Make acquisitions (grows business inorganically)
5. Invest in R&D / expansion (grows organically)

The best companies generate more FCF than they need, creating a virtuous cycle: excess cash → buybacks → fewer shares → higher EPS → higher stock price.`,
        example: {
          title: 'Case Study: Enron — When Net Income Lies',
          body: `Enron reported beautiful net income every quarter. Analysts were impressed. The stock soared to $90.

But Enron's Free Cash Flow was consistently negative. They were booking "profits" from complex accounting tricks while burning real cash.

Red flag checklist that would have caught Enron:
✗ Net income growing, FCF negative or declining
✗ Accounts receivable growing faster than revenue
✗ Increasing use of off-balance-sheet entities

In December 2001, Enron filed for bankruptcy. Stock went to $0.

If you had checked FCF vs. Net Income, you'd have seen this coming years earlier.

Rule: When Net Income and FCF diverge for 2+ years, something is wrong.`,
        },
      },
    ],
  },

  {
    id: 'risk',
    icon: Shield,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    activeBorder: 'border-l-orange-400',
    title: 'Risk & Financial Health',
    subtitle: 'Would this company survive a recession?',
    tag: 'Critical',
    tagColor: 'bg-orange-500/20 text-orange-400',
    lessons: [
      {
        q: 'Debt-to-Equity — The double-edged sword of leverage',
        a: `D/E Ratio = Total Debt ÷ Total Shareholders' Equity

Debt is a tool. Used wisely, it amplifies returns. Used recklessly, it destroys companies.

The leverage effect:
Company A: $100M equity, $0 debt, earns $10M profit → ROE = 10%
Company B: $100M equity, $200M debt, invests $300M total, earns $30M → ROE = 30%

Company B looks better on ROE! But if earnings fall to $5M, it can't service the interest on $200M of debt. It may go bankrupt while Company A survives comfortably.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
D/E INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
< 0.3    Very conservative — fortress balance sheet
0.3–1.0  Healthy range for most businesses
1.0–2.0  Elevated but manageable with stable earnings
> 2.0    High leverage — needs strong, predictable cash flow
> 3.0    Danger zone — one bad quarter could be catastrophic
Negative D/E  More cash than debt — pristine balance sheet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Industry matters enormously:
- Airlines always carry high debt (planes are expensive)
- Banks operate at 10:1 leverage (that's their business model)
- Software companies often have zero debt
- Utilities carry high debt but have guaranteed revenue streams

Always compare D/E within the same industry.`,
        example: {
          title: 'Case Study: Toys R Us Bankruptcy',
          body: `In 2005, private equity firms acquired Toys R Us and loaded it with $5.3 billion in debt.

Annual interest payments: ~$400 million/year.

Revenue was stable. The stores were profitable. But $400M/year in interest left no cash for:
- Upgrading stores (they became outdated)
- Building an e-commerce platform (Amazon ate their lunch)
- Marketing to compete with Walmart and Target

In 2017, Toys R Us filed for bankruptcy. 33,000 employees lost their jobs.

The business was fine. The debt killed it.

Lesson: A good business with bad capital structure is a bad investment.`,
        },
      },
      {
        q: 'Current Ratio — Will the company run out of cash?',
        a: `Current Ratio = Current Assets ÷ Current Liabilities

Current Assets: Cash, receivables, inventory — anything convertible to cash within 12 months.
Current Liabilities: Bills, short-term debt, accounts payable — anything due within 12 months.

A ratio of 2.0 means the company has $2 of liquid assets for every $1 of near-term obligations. It could pay all its short-term bills twice over.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT RATIO INTERPRETATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
> 2.5    Very comfortable — possibly inefficient (too much idle cash)
1.5–2.5  Sweet spot for most businesses
1.0–1.5  Tight but manageable
< 1.0    Potential liquidity crisis — can't cover near-term bills
< 0.5    Serious warning — imminent cash crunch risk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The Quick Ratio (more conservative):
Quick Ratio = (Cash + Receivables) ÷ Current Liabilities
(removes inventory — which may be hard to sell quickly)

Some companies intentionally run low current ratios because they have:
- Predictable, recurring cash flows (subscriptions, utilities)
- Access to credit lines (can borrow instantly if needed)
- Negative working capital models (like Amazon — they get paid by customers before paying suppliers)

Amazon's current ratio is often below 1.0 — but it generates billions in cash monthly, so it's never a problem.`,
        example: {
          title: 'Case Study: Lehman Brothers 2008',
          body: `Lehman Brothers, the 158-year-old investment bank, had:
- Massive assets on paper
- Terrible liquidity (those assets couldn't be sold quickly)
- Current ratio effectively near zero for liquid, callable obligations

When confidence cracked in September 2008, counterparties demanded collateral. Lehman couldn't produce liquid cash fast enough.

On September 15, 2008, Lehman filed the largest bankruptcy in US history — $613 billion in debt.

The company wasn't insolvent in theory. It ran out of liquid cash in practice.

Liquidity ≠ Solvency. A company can be theoretically worth billions and still go bankrupt if it can't pay its bills tomorrow.`,
        },
      },
    ],
  },

  {
    id: 'strategies',
    icon: BarChart2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    activeBorder: 'border-l-yellow-400',
    title: 'Investment Strategies',
    subtitle: 'Value, growth, dividend — what suits you?',
    tag: 'Advanced',
    tagColor: 'bg-yellow-500/20 text-yellow-400',
    lessons: [
      {
        q: 'Value Investing — Buying dollar bills for 60 cents',
        a: `Benjamin Graham defined value investing as: buying a security for significantly less than its intrinsic value, with a sufficient "margin of safety" to protect against errors in analysis.

The Margin of Safety concept:
If you calculate a company's intrinsic value is $100/share, and it's trading at $65/share — you have a 35% margin of safety. Even if you're wrong about the business by 20%, you still make money.

This is risk management built into the purchase price.

CLASSIC VALUE INVESTING CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ P/E below industry average
✓ P/B below 2.0 (ideally below 1.5)
✓ Debt-to-Equity below 0.5
✓ Current Ratio above 2.0
✓ Earnings positive for 10+ years
✓ Dividend record (ideally 20+ years)
✓ EPS growing at least 3%/year historically
✓ Trading at 35%+ discount to intrinsic value
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The value trap danger: A stock trading at P/E 5 might be cheap — or it might be collapsing for a reason. Kodak, Blockbuster, and Nokia all looked like "value" stocks before going to zero.

The antidote: Understand WHY the stock is cheap. Temporary misunderstanding by Mr. Market = opportunity. Permanent business deterioration = value trap.`,
        example: {
          title: 'Case Study: Warren Buffett\'s 2008 Investment in Goldman Sachs',
          body: `During the 2008 financial crisis, Goldman Sachs stock crashed from $200 to $80. Fear was everywhere. Banks were failing.

Buffett stepped in with $5 billion. But he didn't just buy common stock — he negotiated preferred shares with:
- 10% annual dividend (guaranteed $500M/year)
- Warrants to buy common stock at $115

By 2011, Goldman had recovered to $160+. Buffett's $5B investment returned over $3B in profit in 3 years.

Key lessons:
1. Crisis = opportunity for those with cash and courage
2. Buffett understood Goldman's business model deeply
3. He structured the deal to have margin of safety (dividends) even if wrong
4. He was greedy when others were fearful`,
        },
      },
      {
        q: 'Growth Investing — Paying a fair price for an extraordinary business',
        a: `Philip Fisher (the father of growth investing) said: "The stock market is filled with individuals who know the price of everything but the value of nothing."

Growth investing isn't about buying expensive stocks. It's about finding businesses that will be dramatically larger and more profitable in 5–10 years, and paying a fair price for that future.

The key question: What is the Total Addressable Market (TAM)?

A company growing 30%/year in a $10B market is less exciting than one growing 20%/year in a $1 trillion market.

GROWTH INVESTING CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Revenue growing 15%+ annually for 3+ years
✓ Expanding gross margins (getting more efficient at scale)
✓ Large addressable market not yet penetrated
✓ Clear competitive moat (network effects, switching costs, IP)
✓ Management reinvesting in growth, not just paying dividends
✓ PEG ratio below 1.5 (growth-adjusted P/E)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The biggest risk in growth investing: paying too much.

If you buy a company at P/E 100 expecting 50% earnings growth, and earnings grow "only" 30% — the stock might fall 50% as the P/E contracts, even though the business is doing well. This is called multiple compression.`,
        example: {
          title: 'Case Study: Peter Lynch and Dunkin\' Donuts',
          body: `Peter Lynch (who averaged 29%/year for 13 years at Fidelity Magellan) famously looked for "ten-baggers" — stocks that could grow 10x.

His method: observe everyday life. What products do your family, friends, and coworkers love?

Lynch noticed Dunkin' Donuts expanding rapidly from New England to the rest of the US in the 1980s. The concept was proven, the economics were excellent (franchise model = asset-light), and national expansion was just beginning.

He invested early. The stock 10x'd.

His lesson: "Invest in what you know." The best stock research often starts in your daily life — the app you use daily, the restaurant you love, the drug that changed your health.`,
        },
      },
    ],
  },
];

/* ─── Components ─────────────────────────────────────────── */

function VideoCard({ video, onPlay }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden
      hover:border-sky-500/50 transition-all group cursor-pointer"
      onClick={() => onPlay(video)}>
      <div className="relative bg-slate-900 aspect-video flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 to-slate-900" />
        {video.src ? (
          <img src={video.thumbnail} alt={video.title}
            className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="flex flex-col items-center gap-2 relative z-10">
            <Youtube size={32} className="text-slate-600" />
            <span className="text-slate-500 text-xs">Video coming soon</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
            transition-transform group-hover:scale-110
            ${video.src
              ? 'bg-sky-500 shadow-lg shadow-sky-500/40'
              : 'bg-slate-700'}`}>
            {video.src
              ? <Play size={18} className="text-white ml-1" />
              : <Lock size={16} className="text-slate-500" />}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white
          text-xs px-2 py-0.5 rounded-md z-10">
          {video.duration}
        </div>
      </div>
      <div className="p-4">
        <p className="text-white font-semibold text-sm leading-tight mb-1
          group-hover:text-sky-400 transition-colors">
          {video.title}
        </p>
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}

function VideoModal({ video, onClose }) {
  if (!video) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center
      justify-center p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl
        overflow-hidden w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <p className="text-white font-semibold text-sm">{video.title}</p>
          <button onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold">×</button>
        </div>
        <div className="aspect-video bg-slate-900 flex items-center justify-center">
          {video.src ? (
            <iframe
              src={video.src}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <div className="text-center">
              <Youtube size={48} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">Video not yet uploaded</p>
              <p className="text-slate-600 text-sm mt-1">
                Add your YouTube embed URL in VIDEO_PLAYLIST in Education.jsx
              </p>
            </div>
          )}
        </div>
        <div className="px-5 py-4">
          <p className="text-slate-400 text-sm">{video.description}</p>
        </div>
      </div>
    </div>
  );
}

function AccordionLesson({ lesson, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200
      ${open ? 'border-sky-500/40 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between px-6 py-5 text-left gap-4">
        <div className="flex items-start gap-4">
          <span className="text-sky-500 font-black text-lg shrink-0 mt-0.5 opacity-60">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-white font-semibold text-sm leading-relaxed">
            {lesson.q}
          </span>
        </div>
        <div className="shrink-0 mt-0.5">
          {open
            ? <ChevronUp size={18} className="text-sky-400" />
            : <ChevronDown size={18} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-700">
          {/* Main explanation */}
          <div className="px-6 py-5">
            <p className="text-slate-300 text-sm leading-8 whitespace-pre-line">
              {lesson.a}
            </p>
          </div>

          {/* Real world example */}
          {lesson.example && (
            <div className="mx-6 mb-5 bg-sky-500/5 border border-sky-500/20
              rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 bg-sky-500/10
                border-b border-sky-500/20">
                <Star size={13} className="text-sky-400" />
                <span className="text-sky-400 text-xs font-bold uppercase tracking-wide">
                  {lesson.example.title}
                </span>
              </div>
              <div className="px-4 py-4">
                <p className="text-slate-300 text-sm leading-7 whitespace-pre-line">
                  {lesson.example.body}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function Education() {
  const [activeModule, setActiveModule] = useState('basics');
  const [activeTab, setActiveTab]       = useState('lessons');
  const [playingVideo, setPlayingVideo] = useState(null);
  const navigate = useNavigate();
  const module = MODULES.find((m) => m.id === activeModule);
  const moduleVideos = VIDEO_PLAYLIST.filter((v) => v.module === activeModule);

  return (
    <div className="min-h-screen bg-slate-900">
      {playingVideo && (
        <VideoModal video={playingVideo} onClose={() => setPlayingVideo(null)} />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-pink-500/20 border border-pink-500/30
              rounded-xl flex items-center justify-center">
              <BookOpen size={18} className="text-pink-400" />
            </div>
            <h1 className="text-white font-bold text-2xl">Investor Education Hub</h1>
            <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-400 text-xs
              rounded-full font-semibold border border-sky-500/30">
              {VIDEO_PLAYLIST.length} Videos · {MODULES.reduce((a, m) => a + m.lessons.length, 0)} Lessons
            </span>
          </div>
          <p className="text-slate-400 text-sm ml-12 max-w-2xl">
            Learn investing from first principles — not textbook definitions.
            Real companies, real numbers, real failures. Everything explained the way
            a professional investor would explain it to a friend.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { value: MODULES.length,      label: 'Learning Modules',    color: 'text-sky-400'    },
            { value: MODULES.reduce((a, m) => a + m.lessons.length, 0), label: 'In-Depth Lessons', color: 'text-green-400' },
            { value: VIDEO_PLAYLIST.length, label: 'Video Lectures',   color: 'text-purple-400' },
            { value: '5+',                label: 'Case Studies',        color: 'text-yellow-400' },
          ].map(({ value, label, color }) => (
            <div key={label} className="bg-slate-800 border border-slate-700
              rounded-xl p-4 text-center">
              <p className={`text-2xl font-black ${color}`}>{value}</p>
              <p className="text-slate-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl
              overflow-hidden sticky top-20">
              <div className="px-4 py-3 border-b border-slate-700 bg-slate-900/50">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                  Course Modules
                </p>
              </div>
              {MODULES.map((m) => {
                const Icon   = m.icon;
                const active = activeModule === m.id;
                return (
                  <button key={m.id} onClick={() => {
                    setActiveModule(m.id);
                    setActiveTab('lessons');
                  }}
                    className={`w-full flex items-start gap-3 px-4 py-4 text-left
                      transition-all border-b border-slate-700/50
                      ${active ? `bg-slate-700/50 border-l-2 ${m.activeBorder}` : 'hover:bg-slate-700/30'}`}
                  >
                    <Icon size={15} className={`mt-0.5 shrink-0 ${active ? m.color : 'text-slate-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-semibold truncate
                          ${active ? m.color : 'text-white'}`}>
                          {m.title}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full shrink-0
                          font-medium ${m.tagColor}`}>
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs leading-tight">{m.subtitle}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-slate-600 text-xs">
                          {m.lessons.length} lessons
                        </span>
                        <span className="text-slate-700">·</span>
                        <span className="text-slate-600 text-xs">
                          {VIDEO_PLAYLIST.filter((v) => v.module === m.id).length} videos
                        </span>
                      </div>
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
                <div className={`${module.bg} border ${module.border}
                  rounded-2xl p-6 mb-5`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <module.icon size={22} className={module.color} />
                      <h2 className={`font-bold text-xl ${module.color}`}>
                        {module.title}
                      </h2>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold
                      shrink-0 ${module.tagColor}`}>
                      {module.tag}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-3">{module.subtitle}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen size={11} /> {module.lessons.length} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Play size={11} /> {moduleVideos.length} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={11} /> {module.lessons.filter(l => l.example).length} case studies
                    </span>
                  </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-5 bg-slate-800 border border-slate-700
                  rounded-xl p-1">
                  {[
                    { id: 'lessons', label: 'Lessons & Case Studies', icon: BookOpen },
                    { id: 'videos',  label: `Video Lectures (${moduleVideos.length})`, icon: Play },
                  ].map(({ id, label, icon }) => {
                    const TabIcon = icon;
                    return (
                    <button key={id} onClick={() => setActiveTab(id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5
                        rounded-lg text-sm font-medium transition-all
                        ${activeTab === id
                          ? `${module.bg} ${module.color} border ${module.border}`
                          : 'text-slate-400 hover:text-white'}`}>
                      <TabIcon size={14} />
                      {label}
                    </button>
                    );
                  })}
                </div>

                {/* Lessons Tab */}
                {activeTab === 'lessons' && (
                  <div className="space-y-3">
                    {module.lessons.map((lesson, i) => (
                      <AccordionLesson key={lesson.q} lesson={lesson} index={i} />
                    ))}
                  </div>
                )}

                {/* Videos Tab */}
                {activeTab === 'videos' && (
                  <div>
                    {moduleVideos.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {moduleVideos.map((v) => (
                          <VideoCard key={v.id} video={v}
                            onPlay={setPlayingVideo} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16 bg-slate-800 border
                        border-slate-700 rounded-2xl">
                        <Youtube size={40} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">Videos coming soon</p>
                        <p className="text-slate-600 text-sm mt-1 max-w-sm mx-auto">
                          Add YouTube embed URLs in the VIDEO_PLAYLIST array
                          at the top of Education.jsx
                        </p>
                      </div>
                    )}

                    {/* Upload instruction */}
                    <div className="mt-4 bg-slate-800/50 border border-dashed
                      border-slate-600 rounded-xl p-4 text-center">
                      <p className="text-slate-500 text-xs">
                        📹 To add videos: Upload to YouTube → Get embed URL →
                        Paste in <code className="text-sky-400 bg-slate-900 px-1.5
                        py-0.5 rounded text-xs">VIDEO_PLAYLIST[].src</code> in Education.jsx
                      </p>
                    </div>
                  </div>
                )}

                {/* Apply Learning CTA */}
                <div className="mt-8 bg-gradient-to-br from-slate-800 to-slate-900
                  border border-sky-500/30 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-sky-500/20 border border-sky-500/30
                      rounded-xl flex items-center justify-center shrink-0">
                      <Zap size={18} className="text-sky-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-1">
                        Apply It: Analyze a Real Company
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">
                        The fastest way to internalize{' '}
                        <span className={module.color}>{module.title.toLowerCase()}</span>{' '}
                        is to look at real numbers. Pick any company below.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {['AAPL','MSFT','NVDA','KO','JNJ','TSLA','AMZN','V'].map((t) => (
                          <button key={t}
                            onClick={() => navigate(`/analysis/${t}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5
                              bg-slate-700 hover:bg-sky-500/20 border border-slate-600
                              hover:border-sky-500/40 text-slate-300 hover:text-sky-400
                              rounded-lg text-xs font-semibold transition-all">
                            {t} <ArrowRight size={11} />
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
        <div className="mt-12 relative overflow-hidden bg-gradient-to-br
          from-slate-800 via-slate-900 to-slate-800
          border border-slate-700 rounded-3xl p-10 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32
            bg-sky-500/10 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
              bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs
              font-medium mb-4">
              <CheckCircle size={12} /> The best investors never stop learning
            </div>
            <h2 className="text-white font-bold text-2xl mb-3">
              Theory Is Only{' '}
              <span className="text-sky-400">Half the Battle</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
              You've read the theory. Now open a real company's analysis,
              read every metric, and ask yourself: "Based on what I just learned,
              is this a business I'd want to own?" That's how real investors think.
            </p>
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-7 py-3 bg-sky-500
                hover:bg-sky-400 text-white font-bold rounded-xl transition-all
                text-sm shadow-lg shadow-sky-500/25">
              Start Analyzing Real Stocks
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}