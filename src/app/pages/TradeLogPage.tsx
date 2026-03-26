import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, X, Save } from 'lucide-react';
import { Button } from '../components/ui/button';

interface Trade {
  id: string;
  symbol: string;
  trade_type: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  entry_date: string;
  exit_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

export function TradeLogPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [symbol, setSymbol] = useState('');
  const [tradeType, setTradeType] = useState('buy');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [exitDate, setExitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('open');

  const fetchTrades = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    setTrades(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const calculatePnL = (trade: Trade) => {
    if (!trade.exit_price) return null;
    const pnl = (trade.exit_price - trade.entry_price) * trade.quantity;
    return trade.trade_type === 'short' ? -pnl : pnl;
  };

  const totalPnL = trades.reduce((acc, trade) => {
    const pnl = calculatePnL(trade);
    return acc + (pnl || 0);
  }, 0);

  const winRate = () => {
    const closed = trades.filter(t => t.status === 'closed');
    if (closed.length === 0) return 0;
    const wins = closed.filter(t => {
      const pnl = calculatePnL(t);
      return pnl !== null && pnl > 0;
    });
    return Math.round((wins.length / closed.length) * 100);
  };

  const handleSave = async () => {
    if (!symbol || !entryPrice || !quantity) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('trades').insert({
      user_id: user.id,
      symbol: symbol.toUpperCase(),
      trade_type: tradeType,
      entry_price: parseFloat(entryPrice),
      exit_price: exitPrice ? parseFloat(exitPrice) : null,
      quantity: parseFloat(quantity),
      entry_date: entryDate,
      exit_date: exitDate || null,
      notes: notes || null,
      status,
    });

    // Reset form
    setSymbol('');
    setTradeType('buy');
    setEntryPrice('');
    setExitPrice('');
    setQuantity('');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExitDate('');
    setNotes('');
    setStatus('open');
    setShowForm(false);
    setSaving(false);
    fetchTrades();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trade?')) return;
    await supabase.from('trades').delete().eq('id', id);
    fetchTrades();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Trade Log</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Track and analyze your trading performance.</p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5" />
              Log Trade
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{trades.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Win Rate</div>
            <div className={`text-2xl font-bold ${winRate() >= 50 ? 'text-green-600' : 'text-red-500'}`}>
              {winRate()}%
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open Trades</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {trades.filter(t => t.status === 'open').length}
            </div>
          </div>
        </div>

        {/* Add Trade Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Log New Trade</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
                <input
                  type="text"
                  placeholder="AAPL"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={tradeType}
                  onChange={e => setTradeType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="buy">Buy (Long)</option>
                  <option value="sell">Sell</option>
                  <option value="short">Short</option>
                  <option value="cover">Cover</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={entryPrice}
                  onChange={e => setEntryPrice(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exit Price</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={exitPrice}
                  onChange={e => setExitPrice(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={e => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Date</label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={e => setEntryDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Exit Date</label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={e => setExitDate(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
              <textarea
                placeholder="Trade reasoning, lessons learned..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <Button onClick={handleSave} disabled={saving || !symbol || !entryPrice || !quantity}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Trade'}
            </Button>
          </div>
        )}

        {/* Trades Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse h-20" />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-20">
            <DollarSign className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No trades logged yet</h3>
            <p className="text-gray-500 dark:text-gray-500">Start tracking your trades to analyze your performance!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Symbol</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entry</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Exit</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">P&L</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {trades.map((trade) => {
                  const pnl = calculatePnL(trade);
                  return (
                    <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900 dark:text-white">{trade.symbol}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.trade_type === 'buy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                          trade.trade_type === 'short' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {trade.trade_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">${trade.entry_price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">
                        {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{trade.quantity}</td>
                      <td className="px-6 py-4">
                        {pnl !== null ? (
                          <div className={`flex items-center gap-1 font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            {pnl >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.status === 'open'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">{trade.entry_date}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(trade.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}