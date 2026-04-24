import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { Trophy, Brain, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_score: number;
  quizzes_taken: number;
  avg_score: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: scores } = await supabase.from('quiz_scores').select('user_id, score');
      const { data: profiles } = await supabase.from('profiles').select('id, name');
      if (!scores || !profiles) return;

      const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.name]));
      const userMap: Record<string, { total: number; count: number }> = {};
      scores.forEach(s => {
        if (!userMap[s.user_id]) userMap[s.user_id] = { total: 0, count: 0 };
        userMap[s.user_id].total += s.score;
        userMap[s.user_id].count += 1;
      });

      const entries: LeaderboardEntry[] = Object.entries(userMap)
        .map(([user_id, data]) => ({
          user_id,
          name: profileMap[user_id] || 'Anonymous',
          total_score: data.total,
          quizzes_taken: data.count,
          avg_score: Math.round(data.total / data.count),
        }))
        .sort((a, b) => b.avg_score - a.avg_score);

      setLeaderboard(entries);
      setLoading(false);
    };
    fetchLeaderboard();
  }, []);

  const medals = ['🥇', '🥈', '🥉'];
  const medalColors = ['#F59E0B', '#94A3B8', '#B45309'];
  const medalBgs = ['rgba(245,158,11,0.1)', 'rgba(148,163,184,0.1)', 'rgba(180,83,9,0.1)'];
  const medalBorders = ['rgba(245,158,11,0.25)', 'rgba(148,163,184,0.2)', 'rgba(180,83,9,0.2)'];

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        .entry-row {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.15s ease;
          position: relative;
          overflow: hidden;
        }
        .entry-row::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        }
        .entry-row:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          transform: translateX(2px);
        }
        .entry-row.is-you {
          border-color: rgba(59,130,246,0.35);
          background: rgba(59,130,246,0.06);
        }
        .entry-row.is-you::before {
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent);
        }
        .skeleton {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 14px;
          height: 72px;
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

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }} className="fade-up">
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))',
            border: '1px solid rgba(245,158,11,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 32px rgba(245,158,11,0.15)'
          }}>
            <Trophy size={28} color="#F59E0B" />
          </div>
          <h1 style={{
            fontSize: 32, fontWeight: 700, color: '#F1F5F9',
            margin: 0, letterSpacing: '-0.8px', marginBottom: 8
          }}>
            Quiz Leaderboard
          </h1>
          <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>
            Top performers ranked by average quiz score
          </p>
        </div>

        {/* Top 3 podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="fade-up" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10, marginBottom: 24, animationDelay: '80ms'
          }}>
            {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
              const realIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
              const isYou = entry.user_id === user?.id;
              return (
                <div key={entry.user_id} style={{
                  background: medalBgs[realIndex],
                  border: `1px solid ${medalBorders[realIndex]}`,
                  borderRadius: 14, padding: '20px 16px',
                  textAlign: 'center',
                  marginTop: realIndex === 0 ? 0 : 16,
                  position: 'relative',
                  ...(isYou ? { outline: '2px solid rgba(59,130,246,0.5)' } : {})
                }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{medals[realIndex]}</div>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `rgba(${realIndex === 0 ? '245,158,11' : realIndex === 1 ? '148,163,184' : '180,83,9'},0.2)`,
                    border: `1px solid ${medalBorders[realIndex]}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontSize: 14, fontWeight: 700, color: medalColors[realIndex],
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    {entry.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{
                    color: '#E2E8F0', fontSize: 12, fontWeight: 600,
                    marginBottom: 4, whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis'
                  }}>
                    {entry.name}
                    {isYou && <span style={{ color: '#3B82F6', marginLeft: 4 }}>·you</span>}
                  </div>
                  <div style={{
                    fontSize: 20, fontWeight: 700,
                    fontFamily: "'DM Mono', monospace",
                    color: medalColors[realIndex]
                  }}>
                    {entry.avg_score}%
                  </div>
                  <div style={{ color: '#475569', fontSize: 10, marginTop: 2 }}>
                    {entry.quizzes_taken} quizzes
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Full list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Brain size={48} color="#1E293B" style={{ margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ color: '#475569', fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 8 }}>
              No scores yet
            </h3>
            <p style={{ color: '#334155', fontSize: 14, margin: 0 }}>
              Complete some quizzes to appear on the leaderboard!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {leaderboard.map((entry, index) => {
              const isYou = entry.user_id === user?.id;
              const isTop3 = index < 3;
              const scoreColor = entry.avg_score >= 80 ? '#34D399' : entry.avg_score >= 60 ? '#FBBF24' : '#F87171';

              return (
                <div
                  key={entry.user_id}
                  className={`entry-row fade-up ${isYou ? 'is-you' : ''}`}
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 36, flexShrink: 0, textAlign: 'center'
                  }}>
                    {isTop3 ? (
                      <span style={{ fontSize: 20 }}>{medals[index]}</span>
                    ) : (
                      <span style={{
                        color: '#334155', fontSize: 13, fontWeight: 700,
                        fontFamily: "'DM Mono', monospace"
                      }}>
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: isYou ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                    border: isYou ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: isYou ? '#3B82F6' : '#64748B',
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    {entry.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>

                  {/* Name + quizzes */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2
                    }}>
                      <span style={{
                        color: '#E2E8F0', fontSize: 14, fontWeight: 600,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {entry.name}
                      </span>
                      {isYou && (
                        <span style={{
                          background: 'rgba(59,130,246,0.15)',
                          border: '1px solid rgba(59,130,246,0.3)',
                          color: '#3B82F6', fontSize: 10, fontWeight: 700,
                          padding: '1px 7px', borderRadius: 99, flexShrink: 0
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#334155', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
                      {entry.quizzes_taken} quiz{entry.quizzes_taken !== 1 ? 'zes' : ''} taken
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontSize: 22, fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                      color: scoreColor, letterSpacing: '-0.5px'
                    }}>
                      {entry.avg_score}%
                    </div>
                    <div style={{ color: '#334155', fontSize: 10 }}>avg score</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {leaderboard.length > 0 && !loading && (
          <div className="fade-up" style={{
            marginTop: 24, padding: '14px 18px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
            animationDelay: `${leaderboard.length * 40}ms`
          }}>
            <TrendingUp size={13} color="#334155" />
            <span style={{ color: '#334155', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {leaderboard.length} trader{leaderboard.length !== 1 ? 's' : ''} on the board
            </span>
          </div>
        )}
      </main>
    </div>
  );
}