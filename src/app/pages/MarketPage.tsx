import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { TrendingUp, TrendingDown } from 'lucide-react';

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

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        await Promise.all(
          STOCKS.filter(s => s.ticker!== 'GOLD').map(async (stock) => {
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
      } catch (err) {
        console.error('Price fetch error:', err);
      }
    };
    fetchPrices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Market Overview</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Live stock charts for educational reference only. Click a stock to view its chart.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STOCKS.map((stock) => {
            const priceData = prices[stock.ticker];
            const isUp = priceData ? priceData.change >= 0 : null;
            return (
              <button
                key={stock.symbol}
                onClick={() => setSelectedSymbol(stock.symbol)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedSymbol === stock.symbol
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-gray-900 dark:text-white">{stock.ticker}</div>
                  {isUp !== null && (
                    isUp
                      ? <TrendingUp className="w-4 h-4 text-green-500" />
                      : <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stock.name}</div>
                {priceData ? (
                  <>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      ${priceData.price.toFixed(2)}
                    </div>
                    <div className={`text-xs font-medium ${priceData.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {priceData.change >= 0 ? '+' : ''}{priceData.change.toFixed(2)} ({priceData.changePercent.toFixed(2)}%)
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-500 animate-pulse">Loading...</div>
                )}
              </button>
            );
          })}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {STOCKS.find(s => s.symbol === selectedSymbol)?.name} Chart
          </h2>
          <iframe
            key={selectedSymbol}
            src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview&symbol=${selectedSymbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=light&style=1&timezone=Etc%2FUTC&withdateranges=1&showpopupbutton=1`}
            style={{ width: '100%', height: '500px' }}
            frameBorder="0"
            allowTransparency={true}
            scrolling="no"
          />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
            Charts provided by TradingView. For educational purposes only — not financial advice.
          </p>
        </div>
      </main>
    </div>
  );
}