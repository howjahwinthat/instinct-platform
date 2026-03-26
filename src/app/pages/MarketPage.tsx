import { useState } from 'react';
import { Header } from '../components/Header';

const STOCKS = [
  { symbol: 'NASDAQ:AAPL', name: 'Apple Inc.' },
  { symbol: 'NASDAQ:GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'NASDAQ:MSFT', name: 'Microsoft Corp.' },
  { symbol: 'NASDAQ:TSLA', name: 'Tesla Inc.' },
  { symbol: 'NASDAQ:AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NASDAQ:NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'NASDAQ:META', name: 'Meta Platforms' },
  { symbol: 'TVC:GOLD', name: 'Gold Spot Price' },
];

export function MarketPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('NASDAQ:AAPL');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Market Overview</h1>
          <p className="text-gray-500 mt-2">
            Live stock charts for educational reference only. Click a stock to view its chart.
          </p>
        </div>

        {/* Stock Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STOCKS.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedSymbol === stock.symbol
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="font-bold text-gray-900">{stock.symbol.split(':')[1]}</div>
              <div className="text-xs text-gray-500 mt-1">{stock.name}</div>
            </button>
          ))}
        </div>

        {/* TradingView Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
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
          <p className="text-xs text-gray-400 mt-3 text-center">
            Charts provided by TradingView. For educational purposes only — not financial advice.
          </p>
        </div>
      </main>
    </div>
  );
}