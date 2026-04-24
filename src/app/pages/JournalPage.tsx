import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { PlusCircle, Trash2, Edit2, Save, X, BookOpen } from 'lucide-react';
import { Toast } from '../components/Toast';
import { fireSmallConfetti } from '../lib/confetti';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('journal_entries').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      await supabase.from('journal_entries')
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq('id', editingId);
      fireSmallConfetti();
      setToast({ message: 'Entry updated!', emoji: '✏️' });
    } else {
      await supabase.from('journal_entries').insert({ user_id: user.id, title, content });
      fireSmallConfetti();
      setToast({ message: 'Journal entry saved!', emoji: '📝' });
    }

    setTitle(''); setContent(''); setShowForm(false); setEditingId(null); setSaving(false);
    fetchEntries();
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title); setContent(entry.content);
    setEditingId(entry.id); setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this journal entry?')) return;
    await supabase.from('journal_entries').delete().eq('id', id);
    setToast({ message: 'Entry deleted', emoji: '🗑️' });
    fetchEntries();
  };

  const handleCancel = () => {
    setTitle(''); setContent(''); setShowForm(false); setEditingId(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        .entry-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .entry-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
        .entry-card:hover {
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.09);
        }
        .form-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(59,130,246,0.2);
          border-radius: 16px;
          padding: 28px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }
        .form-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
        }
        .journal-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px 16px;
          color: #E2E8F0;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .journal-input:focus {
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.04);
        }
        .journal-input::placeholder { color: #334155; }
        .journal-textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 16px;
          color: #CBD5E1;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.7;
          outline: none;
          resize: none;
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .journal-textarea:focus {
          border-color: rgba(59,130,246,0.4);
          background: rgba(59,130,246,0.04);
        }
        .journal-textarea::placeholder { color: #334155; }
        .save-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 10px;
          background: #3B82F6; color: white;
          border: none; cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .save-btn:hover { background: #2563EB; }
        .save-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .cancel-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 20px; border-radius: 10px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.08);
          color: #64748B; cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .cancel-btn:hover { border-color: rgba(255,255,255,0.15); color: #94A3B8; }
        .new-entry-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px;
          background: rgba(59,130,246,0.15);
          border: 1px solid rgba(59,130,246,0.3);
          color: #3B82F6; cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.15s;
        }
        .new-entry-btn:hover {
          background: rgba(59,130,246,0.22);
          border-color: rgba(59,130,246,0.5);
        }
        .icon-btn {
          width: 32px; height: 32px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: none; border: 1px solid transparent;
          cursor: pointer; transition: all 0.15s;
        }
        .icon-btn.edit:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.1);
        }
        .icon-btn.delete:hover {
          background: rgba(239,68,68,0.1);
          border-color: rgba(239,68,68,0.2);
        }
        .skeleton-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px; height: 120px;
          animation: shimmer 1.5s ease infinite;
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px' }}>

        {/* Page header */}
        <div className="fade-up" style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 36
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <BookOpen size={20} color="#3B82F6" />
            </div>
            <div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, color: '#F1F5F9',
                margin: 0, letterSpacing: '-0.5px'
              }}>
                Trading Journal
              </h1>
              <p style={{ color: '#475569', fontSize: 13, margin: 0, marginTop: 2 }}>
                {entries.length > 0 ? `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}` : 'Track your thoughts and insights'}
              </p>
            </div>
          </div>

          {!showForm && (
            <button className="new-entry-btn" onClick={() => setShowForm(true)}>
              <PlusCircle size={15} />
              New Entry
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="form-card fade-up">
            <h2 style={{
              fontSize: 15, fontWeight: 700, color: '#F1F5F9',
              margin: 0, marginBottom: 18
            }}>
              {editingId ? 'Edit Entry' : 'New Journal Entry'}
            </h2>

            <input
              type="text"
              placeholder="Entry title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="journal-input"
              style={{ marginBottom: 12 }}
            />

            <textarea
              placeholder="Write your trading notes, market observations, lessons learned, or reflections..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={7}
              className="journal-textarea"
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="save-btn"
                onClick={handleSave}
                disabled={saving || !title.trim() || !content.trim()}
              >
                <Save size={14} />
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                <X size={14} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Entries */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton-card" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="fade-up" style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <BookOpen size={28} color="#1E293B" />
            </div>
            <h3 style={{ color: '#475569', fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 8 }}>
              No entries yet
            </h3>
            <p style={{ color: '#334155', fontSize: 14, margin: 0 }}>
              Start writing your trading insights and reflections!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map((entry, i) => (
              <div
                key={entry.id}
                className="entry-card fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', marginBottom: 12
                }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                    <h3 style={{
                      fontSize: 16, fontWeight: 700, color: '#F1F5F9',
                      margin: 0, marginBottom: 4, letterSpacing: '-0.2px'
                    }}>
                      {entry.title}
                    </h3>
                    <div style={{
                      color: '#334155', fontSize: 11,
                      fontFamily: "'DM Mono', monospace"
                    }}>
                      {new Date(entry.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                      {entry.updated_at !== entry.created_at && (
                        <span style={{ marginLeft: 8, color: '#1E293B' }}>· edited</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="icon-btn edit" onClick={() => handleEdit(entry)}>
                      <Edit2 size={13} color="#475569" />
                    </button>
                    <button className="icon-btn delete" onClick={() => handleDelete(entry.id)}>
                      <Trash2 size={13} color="#EF4444" />
                    </button>
                  </div>
                </div>

                <p style={{
                  color: '#64748B', fontSize: 14, lineHeight: 1.7,
                  margin: 0, whiteSpace: 'pre-wrap'
                }}>
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>

      {toast && (
        <Toast message={toast.message} emoji={toast.emoji} onClose={() => setToast(null)} />
      )}
    </div>
  );
}