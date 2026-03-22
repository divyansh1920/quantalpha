# QuantAlpha 📊
### *Because great investing starts with great information.*

![React](https://img.shields.io/badge/React-18.2-61dafb?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646cff?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![Deployed](https://img.shields.io/badge/Live-GitHub%20Pages-black?style=flat-square&logo=github)
![Markets](https://img.shields.io/badge/Markets-🇮🇳%20India%20+%20🇺🇸%20US-orange?style=flat-square)

> **Live Site →** [https://divyansh1920.github.io/quantalpha](https://divyansh1920.github.io/quantalpha)

---

## What Is QuantAlpha?

Most retail investors in India make decisions based on tips, social media, and gut feeling — not data.

QuantAlpha fixes that.

It is a **free, no-login, fully browser-based stock intelligence platform** that gives any investor — whether they're just starting out or have years of experience — the same analytical toolkit used by professional fund managers. Enter any stock ticker from the Indian (NSE) or US market and receive a complete financial analysis in under 10 seconds.

No Bloomberg terminal required. No expensive subscription. Just a ticker and a browser.

---

## Who Is This For?

- 🎓 **MBA & Finance students** learning to apply valuation frameworks on real data
- 📈 **Retail investors** in India tired of making decisions without proper analysis
- 💼 **Professionals** who want a quick sanity check before investing
- 🧠 **Beginners** who want to learn investing through real companies, not textbooks

---

## What Makes It Different?

| Feature | QuantAlpha | Most Free Tools |
|---|---|---|
| Indian NSE stocks | ✅ Full support | ❌ Rare |
| AI Investment Score | ✅ 5-dimension, 0–100 | ❌ |
| DCF Intrinsic Value | ✅ Two-stage model | ❌ |
| Plain-English interpretation | ✅ Per metric, per company | ❌ |
| Education with real case studies | ✅ Enron, Buffett, Lehman | ❌ |
| Sign-up required | ❌ Never | Often |
| Cost | ❌ Free forever | Often paid |

---

## Core Features

### 🔍 Live Stock Analysis
Enter any NSE or NYSE/NASDAQ ticker and get a full financial report powered by live market data. Works for `RELIANCE.NS`, `TCS.NS`, `AAPL`, `NVDA` and thousands more.

### 🤖 AI Investment Score (0–100)
A proprietary normalized scoring engine evaluates every company across **5 dimensions**:
- **Profitability** — ROE, Net Margin, ROA, Gross Margin
- **Valuation** — P/E, P/B, EV/EBITDA
- **Growth** — Revenue & EPS year-over-year growth
- **Financial Health** — Debt/Equity, Current Ratio, Interest Coverage
- **Cash Flow** — FCF positivity and FCF growth

Scores are **normalized** — meaning if data is unavailable for some metrics, the score is calculated fairly based only on available data. No more artificially low scores due to missing fields.

### 💰 DCF Intrinsic Value Model
A two-stage Discounted Cash Flow model estimates the intrinsic value per share using historically observed FCF growth rates, a 10% WACC, and 2.5% terminal growth. Displays full projection table, present values, and margin of safety label.

### 📖 Metric Interpreter (Learning Mode)
A collapsible panel on every analysis page explains **what each metric actually means for this specific company** — using the real numbers, in plain English. Designed to teach, not just display.

### 🔎 Strategy-Based Screener
Curated stock lists for 4 proven investment strategies across both US and Indian markets:
- **Value Investing** — Low P/E, low P/B, strong FCF
- **Growth Investing** — High revenue growth, expanding margins
- **Dividend Investing** — Consistent dividend payers
- **Quality Investing** — High ROE, strong moats, low debt

### 📂 Portfolio Builder
Add up to 8 stocks (US or Indian), compare AI scores side by side, view market cap weight distribution, and get a combined portfolio score. Includes 6 preset portfolios across both markets.

### 🎓 Investor Education Hub
5 learning modules with 15+ in-depth lessons, real-world case studies, and a YouTube video lecture section:
- **Stock Market Basics** — The ownership mindset, Mr. Market, market cap
- **Valuation Ratios** — P/E, P/B, EV/EBITDA, full DCF walkthrough with Coca-Cola
- **Profitability Metrics** — ROE, Free Cash Flow, DuPont analysis
- **Risk & Financial Health** — Debt, liquidity, interest coverage
- **Investment Strategies** — Value, growth, dividend with Buffett, Lynch, Graham

Every lesson uses **real case studies** — Enron's FCF fraud, Toys R Us debt collapse, Lehman Brothers liquidity crisis, Buffett's Goldman Sachs trade.

---

## Tech Stack

```
Frontend    React 18 + Vite 5
Styling     Tailwind CSS v3
Charts      Recharts
Routing     React Router DOM v6
HTTP        Axios
Icons       Lucide React
Deployment  GitHub Pages (gh-pages)
```

**Zero backend. Zero database. Zero server costs.**

---

## Data Sources

| Source | Used For | Plan |
|---|---|---|
| **Financial Modeling Prep** | US stock profiles, financials, ratios, DCF | Free (250 req/day) |
| **Twelve Data** | Indian NSE stock prices & history | Free (800 credits/day) |
| **Alpha Vantage** | Technical indicators (RSI, MACD) | Free (25 req/day) |

---

## Indian Market Support 🇮🇳

QuantAlpha was built with the Indian investor in mind. NSE-listed stocks are fully supported using the `.NS` suffix:

```
RELIANCE.NS    TCS.NS    HDFCBANK.NS    INFY.NS
ZOMATO.NS      TITAN.NS  BAJFINANCE.NS  ASIANPAINT.NS
```

- Live prices via **Twelve Data** (NSE feed)
- Financial statements via **FMP v3** (where available)
- Full analysis page — charts, DCF, scoring — same as US stocks

---

## Local Setup

```bash
# Clone
git clone https://github.com/divyansh1920/quantalpha.git
cd quantalpha

# Install
npm install

# Add API keys — create .env in root folder:
VITE_FMP_API_KEY=your_key_here
VITE_ALPHA_VANTAGE_KEY=your_key_here
VITE_TWELVE_DATA_KEY=your_key_here

# Run development server
npm run dev
```

Visit: `http://localhost:5173/quantalpha/`

Get free API keys from:
- FMP: https://financialmodelingprep.com/developer/docs
- Twelve Data: https://twelvedata.com
- Alpha Vantage: https://alphavantage.co

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

Builds the project and pushes to the `gh-pages` branch automatically.

---

## Project Structure

```
src/
├── api/
│   ├── fmp.js              US stock data (FMP Stable API)
│   ├── twelvedata.js       Indian stock prices + OHLCV
│   └── alphavantage.js     Technical indicators
├── components/
│   ├── Navbar.jsx
│   ├── Loader.jsx
│   ├── MetricCard.jsx
│   ├── MetricInterpreter.jsx
│   └── ScoreGauge.jsx
├── context/
│   └── StockContext.jsx    Global state + US vs India routing
├── pages/
│   ├── Home.jsx            Landing + search + market toggle
│   ├── Analysis.jsx        Full 9-section company report
│   ├── Screener.jsx        Strategy screener (US + India)
│   ├── Portfolio.jsx       Multi-stock portfolio builder
│   └── Education.jsx       Learning hub with video support
└── utils/
    ├── scoring.js          Normalized AI scoring engine
    ├── dcf.js              Two-stage DCF model
    └── formatters.js       Currency, percent, ratio formatters
```

---

## Roadmap

- [ ] NSE screener with live fundamental filters
- [ ] Technical analysis tab (RSI, MACD charts)
- [ ] Peer comparison — 2 companies side by side
- [ ] Watchlist saved to localStorage
- [ ] Earnings calendar
- [ ] Export analysis report to PDF
- [ ] Nifty 50 / Sensex index overview dashboard
- [ ] PWA support — install on mobile home screen

---

## Disclaimer

> QuantAlpha is built for **educational and informational purposes only**.
> Nothing on this platform constitutes financial advice or a recommendation
> to buy or sell any security. Always conduct your own research.
> Past performance does not guarantee future results.
> Investing involves risk of loss.

---

## Author

Built by **Divyansh Jain** — MBA Finance, FORE School of Management

*Combining financial domain knowledge with modern web development
to make institutional-grade investment research accessible to everyone.*

---

*© 2025 QuantAlpha · Free · Open Source · Built for Indian Investors 🇮🇳*
