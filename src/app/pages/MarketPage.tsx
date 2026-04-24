import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const STOCKS = [
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.', ticker: 'AAPL' },
  { symbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.', ticker: 'GOOGL' },
  { symbol: 'NASDAQ:MSFT', name: 'Microsoft Corp.', ticker: 'MSFT' },
  { symbol: 'NASDAQ:TSLA', name: 'Tesla Inc.', ticker: 'TSLA' },
  { symbol: 'NASDAQ:AMZN', name: 'Amazon.com Inc.', ticker: 'AMZN' },
  { symbol: 'NASDAQ:NVDA', name: 'NVIDIA Corp.', ticker: 'NVDA' },
  { symbol: 'NASDAQ:META', name: 'Meta Platforms', ticker: 'META' },
  { symbol: 'AMEX:SPY', name: 'S&P 500 ETF', ticker: 'SPY' },
];

interface StockPrice {
  price: number;
  change: number;
  changePercent: number;
}

export function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('NASDAQ:AAPL');
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        await Promise.all(
          STOCKS.map(async (stock) => {
            const res = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${stock.ticker}&token=d72r2uhr01qlfd9o8r8gd72r2uhr01qlfd9o8r90`
            );
            const data = await res.json();
            if (data.c) {
              const price = data.c;
              const prev = data.pc;
              const change = price - prev;
              const changePercent = (change / prev) * 100;
              setPrices(prev => ({
                ...prev,
                [stock.ticker]: { price, change, changePercent }
              }));
            }
          })
        );
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Price fetch error:', err);
      }
    };
    fetchPrices();
  }, []);

  const selectedStock = STOCKS.find(s => s.symbol === selectedSymbol);
  const selectedPrice = selectedStock ? prices[selectedStock.ticker] : null;

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        .stock-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          width: 100%;
          position: relative;
          overflow: hidden;
        }
        .stock-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .stock-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
        .stock-card.active {
          background: rgba(59,130,246,0.1);
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 0 20px rgba(59,130,246,0.1);
        }
        .stock-card.active::before {
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
        }
        .stock-card.up { --accent: #10B981; }
        .stock-card.down { --accent: #EF4444; }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes shimmer {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .loading-text {
          animation: shimmer 1.5s ease infinite;
          color: #334155;
          font-size: 12px;
          font-family: 'DM Mono', monospace;
        }
        .chart-container {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        .chart-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255,255,255,0.02);
        }
      `}</style>

      <Header />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 16px rgba(59,130,246,0.3)'
              }}>
                <Activity size={18} color="white" />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.5px' }}>
                Market Overview
              </h1>
            </div>
            <p style={{ color: '#475569', fontSize: 13, margin: 0 }}>
              Live prices for educational reference only — not financial advice
            </p>
          </div>

          {lastUpdated && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#334155', fontSize: 11 }}>
              <div className="pulse-dot" />
              <span style={{ fontFamily: "'DM Mono', monospace" }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>

        {/* Stock Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {STOCKS.map((stock) => {
            const priceData = prices[stock.ticker];
            const isUp = priceData ? priceData.change >= 0 : null;
            const isActive = selectedSymbol === stock.symbol;

            return (
              <button
                key={stock.symbol}
                onClick={() => setSelectedSymbol(stock.symbol)}
                className={`stock-card ${isActive ? 'active' : ''} ${isUp === true ? 'up' : isUp === false ? 'down' : ''}`}
              >
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: '#F1F5F9',
                    fontFamily: "'DM Mono', monospace", letterSpacing: 0.5
                  }}>
                    {stock.ticker}
                  </span>
                  {isUp !== null && (
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isUp
                        ? <TrendingUp size={13} color="#10B981" />
                        : <TrendingDown size={13} color="#EF4444" />
                      }
                    </div>
                  )}
                </div>

                {/* Company name */}
                <div style={{
                  color: '#475569', fontSize: 11,
                  marginBottom: 10, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {stock.name}
                </div>

                {/* Price */}
                {priceData ? (
                  <>
                    <div style={{
                      fontSize: 20, fontWeight: 700, color: '#F1F5F9',
                      fontFamily: "'DM Mono', monospace",
                      letterSpacing: '-0.5px', lineHeight: 1, marginBottom: 6
                    }}>
                      ${priceData.price.toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      color: priceData.change >= 0 ? '#10B981' : '#EF4444'
                    }}>
                      {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)}
                      <span style={{ opacity: 0.7, marginLeft: 4 }}>
                        ({priceData.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="loading-text">Fetching...</div>
                )}

                {/* Active indicator bar */}
                {isActive && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                    background: 'linear-gradient(90deg, transparent, #3B82F6, transparent)'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div>
                <div style={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16 }}>
                  {selectedStock?.name}
                  <span style={{
                    marginLeft: 8, color: '#475569', fontSize: 13,
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    {selectedStock?.ticker}
                  </span>
                </div>
                {selectedPrice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span style={{
                      fontSize: 22, fontWeight: 700, color: '#F1F5F9',
                      fontFamily: "'DM Mono', monospace", letterSpacing: '-0.5px'
                    }}>
                      ${selectedPrice.price.toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600,
                      fontFamily: "'DM Mono', monospace",
                      color: selectedPrice.change >= 0 ? '#10B981' : '#EF4444',
                      background: selectedPrice.change >= 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      padding: '2px 8px', borderRadius: 6
                    }}>
                      {selectedPrice.change >= 0 ? '+' : ''}{selectedPrice.change.toFixed(2)} ({selectedPrice.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div style={{
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
              borderRadius: 8, padding: '6px 12px',
              display: 'flex', alignItems: 'center', gap: 6
            }}>
              <div className="pulse-dot" />
              <span style={{ color: '#10B981', fontSize: 11, fontWeight: 600 }}>LIVE</span>
            </div>
          </div>

          <iframe
            key={selectedSymbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=141418&studies=[]&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1`}
            style={{ width: '100%', height: 520, display: 'block', border: 'none' }}
            scrolling="no"
          />

          <div style={{
            padding: '12px 24px', borderTop: '1px solid rgba(255,255,255,0.04)',
            color: '#334155', fontSize: 11, textAlign: 'center',
            fontFamily: "'DM Mono', monospace"
          }}>
            Charts by TradingView · Educational purposes only · Not financial advice
          </div>
        </div>
      </main>
    </div>
  );
}