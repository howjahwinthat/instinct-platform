import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, X, Save, BarChart2 } from 'lucide-react';

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
    const { data } = await supabase.from('trades').select('*')
      .eq('user_id', user.id).order('entry_date', { ascending: false });
    setTrades(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchTrades(); }, []);

  const calculatePnL = (trade: Trade) => {
    if (!trade.exit_price) return null;
    const pnl = (trade.exit_price - trade.entry_price) * trade.quantity;
    return trade.trade_type === 'short' ? -pnl : pnl;
  };

  const totalPnL = trades.reduce((acc, trade) => acc + (calculatePnL(trade) || 0), 0);

  const winRate = () => {
    const closed = trades.filter(t => t.status === 'closed');
    if (closed.length === 0) return 0;
    const wins = closed.filter(t => { const pnl = calculatePnL(t); return pnl !== null && pnl > 0; });
    return Math.round((wins.length / closed.length) * 100);
  };

  const handleSave = async () => {
    if (!symbol || !entryPrice || !quantity) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('trades').insert({
      user_id: user.id, symbol: symbol.toUpperCase(),
      trade_type: tradeType, entry_price: parseFloat(entryPrice),
      exit_price: exitPrice ? parseFloat(exitPrice) : null,
      quantity: parseFloat(quantity), entry_date: entryDate,
      exit_date: exitDate || null, notes: notes || null, status,
    });
    setSymbol(''); setTradeType('buy'); setEntryPrice(''); setExitPrice('');
    setQuantity(''); setEntryDate(new Date().toISOString().split('T')[0]);
    setExitDate(''); setNotes(''); setStatus('open');
    setShowForm(false); setSaving(false); fetchTrades();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this trade?')) return;
    await supabase.from('trades').delete().eq('id', id);
    fetchTrades();
  };

  const typeColor: Record<string, string> = {
    buy: '#10B981', sell: '#F59E0B', short: '#EF4444', cover: '#A855F7'
  };
  const typeBg: Record<string, string> = {
    buy: 'rgba(16,185,129,0.12)', sell: 'rgba(245,158,11,0.12)',
    short: 'rgba(239,68,68,0.12)', cover: 'rgba(168,85,247,0.12)'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        .stat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px; padding: 20px 24px;
          transition: all 0.15s;
        }
        .stat-card:hover { background: rgba(255,255,255,0.04); }
        .form-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 16px; padding: 28px; margin-bottom: 20px;
          position: relative; overflow: hidden;
        }
        .form-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
        }
        .trade-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 9px 12px;
          color: #E2E8F0; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .trade-input:focus {
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.04);
        }
        .trade-input::placeholder { color: #334155; }
        .trade-select {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 9px 12px;
          color: #E2E8F0; font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          outline: none; cursor: pointer;
          box-sizing: border-box;
        }
        .trade-select option { background: #0D1117; }
        .field-label {
          display: block; font-size: 11px; font-weight: 600;
          color: #475569; margin-bottom: 6px; letter-spacing: 0.5px;
        }
        .save-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 10px;
          background: #3B82F6; color: white; border: none;
          cursor: pointer; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .save-btn:hover { background: #2563EB; }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cancel-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: 10px;
          background: transparent; border: 1px solid rgba(255,255,255,0.08);
          color: #64748B; cursor: pointer; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .cancel-btn:hover { border-color: rgba(255,255,255,0.15); color: #94A3B8; }
        .log-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #3B82F6; cursor: pointer; font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .log-btn:hover { background: rgba(59,130,246,0.22); }
        .trade-table {
          width: 100%;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px; overflow: hidden;
          border-collapse: collapse;
        }
        .trade-table thead tr {
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.02);
        }
        .trade-table th {
          padding: 12px 16px; text-align: left;
          font-size: 10px; font-weight: 700; letter-spacing: 1px;
          color: #334155;
        }
        .trade-table tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        .trade-table tbody tr:last-child { border-bottom: none; }
        .trade-table tbody tr:hover { background: rgba(255,255,255,0.03); }
        .trade-table td {
          padding: 14px 16px; font-size: 13px; color: #94A3B8;
        }
        .skeleton {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 14px; height: 56px;
          animation: shimmer 1.5s ease infinite;
        }
        @keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>

        {/* Page header */}
        <div className="fade-up" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 32
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <BarChart2 size={20} color="#3B82F6" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.5px' }}>
                Trade Log
              </h1>
              <p style={{ color: '#475569', fontSize: 13, margin: 0, marginTop: 2 }}>
                Track and analyze your trading performance
              </p>
            </div>
          </div>
          {!showForm && (
            <button className="log-btn" onClick={() => setShowForm(true)}>
              <PlusCircle size={15} />
              Log Trade
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="fade-up" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10, marginBottom: 20, animationDelay: '60ms'
        }}>
          {[
            {
              label: 'Total P&L',
              value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`,
              color: totalPnL >= 0 ? '#34D399' : '#F87171'
            },
            { label: 'Total Trades', value: trades.length.toString(), color: '#F1F5F9' },
            {
              label: 'Win Rate',
              value: `${winRate()}%`,
              color: winRate() >= 50 ? '#34D399' : '#F87171'
            },
            {
              label: 'Open Trades',
              value: trades.filter(t => t.status === 'open').length.toString(),
              color: '#3B82F6'
            },
          ].map((stat, i) => (
            <div key={i} className="stat-card">
              <div style={{ color: '#475569', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, marginBottom: 10 }}>
                {stat.label.toUpperCase()}
              </div>
              <div style={{
                fontSize: 26, fontWeight: 700, color: stat.color,
                fontFamily: "'DM Mono', monospace", letterSpacing: '-0.5px'
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {showForm && (
          <div className="form-card fade-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', margin: 0 }}>Log New Trade</h2>
              <button
                onClick={() => setShowForm(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
              <div>
                <label className="field-label">SYMBOL</label>
                <input className="trade-input" type="text" placeholder="AAPL"
                  value={symbol} onChange={e => setSymbol(e.target.value)} />
              </div>
              <div>
                <label className="field-label">TYPE</label>
                <select className="trade-select" value={tradeType} onChange={e => setTradeType(e.target.value)}>
                  <option value="buy">Buy (Long)</option>
                  <option value="sell">Sell</option>
                  <option value="short">Short</option>
                  <option value="cover">Cover</option>
                </select>
              </div>
              <div>
                <label className="field-label">STATUS</label>
                <select className="trade-select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="field-label">QUANTITY</label>
                <input className="trade-input" type="number" placeholder="0"
                  value={quantity} onChange={e => setQuantity(e.target.value)} />
              </div>
              <div>
                <label className="field-label">ENTRY PRICE</label>
                <input className="trade-input" type="number" placeholder="0.00"
                  value={entryPrice} onChange={e => setEntryPrice(e.target.value)} />
              </div>
              <div>
                <label className="field-label">EXIT PRICE</label>
                <input className="trade-input" type="number" placeholder="0.00"
                  value={exitPrice} onChange={e => setExitPrice(e.target.value)} />
              </div>
              <div>
                <label className="field-label">ENTRY DATE</label>
                <input className="trade-input" type="date"
                  value={entryDate} onChange={e => setEntryDate(e.target.value)} />
              </div>
              <div>
                <label className="field-label">EXIT DATE</label>
                <input className="trade-input" type="date"
                  value={exitDate} onChange={e => setExitDate(e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label className="field-label">NOTES</label>
              <textarea
                className="trade-input"
                placeholder="Trade reasoning, lessons learned..."
                value={notes} onChange={e => setNotes(e.target.value)}
                rows={3}
                style={{ resize: 'none', lineHeight: 1.6 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="save-btn" onClick={handleSave}
                disabled={saving || !symbol || !entryPrice || !quantity}>
                <Save size={14} />
                {saving ? 'Saving...' : 'Save Trade'}
              </button>
              <button className="cancel-btn" onClick={() => setShowForm(false)}>
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : trades.length === 0 ? (
          <div className="fade-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <DollarSign size={28} color="#1E293B" />
            </div>
            <h3 style={{ color: '#475569', fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 8 }}>
              No trades logged yet
            </h3>
            <p style={{ color: '#334155', fontSize: 14, margin: 0 }}>
              Start tracking your trades to analyze your performance!
            </p>
          </div>
        ) : (
          <div className="fade-up" style={{ animationDelay: '120ms' }}>
            <table className="trade-table">
              <thead>
                <tr>
                  {['Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'P&L', 'Status', 'Date', ''].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const pnl = calculatePnL(trade);
                  return (
                    <tr key={trade.id}>
                      <td>
                        <span style={{
                          color: '#F1F5F9', fontWeight: 700, fontSize: 14,
                          fontFamily: "'DM Mono', monospace"
                        }}>
                          {trade.symbol}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          background: typeBg[trade.trade_type] || 'rgba(255,255,255,0.06)',
                          color: typeColor[trade.trade_type] || '#94A3B8',
                          fontSize: 10, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 6, fontFamily: "'DM Mono', monospace"
                        }}>
                          {trade.trade_type.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", color: '#CBD5E1' }}>
                        ${trade.entry_price.toFixed(2)}
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", color: '#CBD5E1' }}>
                        {trade.exit_price ? `$${trade.exit_price.toFixed(2)}` : '—'}
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", color: '#64748B' }}>
                        {trade.quantity}
                      </td>
                      <td>
                        {pnl !== null ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: pnl >= 0 ? '#34D399' : '#F87171',
                            fontFamily: "'DM Mono', monospace", fontWeight: 700
                          }}>
                            {pnl >= 0
                              ? <TrendingUp size={13} color="#34D399" />
                              : <TrendingDown size={13} color="#F87171" />}
                            {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                          </div>
                        ) : <span style={{ color: '#334155' }}>—</span>}
                      </td>
                      <td>
                        <span style={{
                          background: trade.status === 'open' ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.05)',
                          color: trade.status === 'open' ? '#3B82F6' : '#475569',
                          fontSize: 10, fontWeight: 700, padding: '3px 8px',
                          borderRadius: 6, fontFamily: "'DM Mono', monospace"
                        }}>
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontFamily: "'DM Mono', monospace", color: '#334155', fontSize: 12 }}>
                        {trade.entry_date}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(trade.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#334155', padding: 4, borderRadius: 6,
                            transition: 'color 0.15s', display: 'flex'
                          }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#334155')}
                        >
                          <X size={14} />
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