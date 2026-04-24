import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, getCourseProgress } from '../data/progress';
import { courses } from '../data/courses';
import { CheckCircle, BookOpen, Brain, Trophy, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { getStreak } from '../lib/streak';

export function DashboardPage() {
  const { profile } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { completedLessons, quizScores } = await getUserProgress();
      setCompletedLessons(completedLessons);
      setQuizScores(quizScores);

      const progressMap: Record<string, number> = {};
      await Promise.all(
        courses.map(async (course) => {
          const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
          const progress = await getCourseProgress(course.id, totalLessons);
          progressMap[course.id] = progress;
        })
      );
      setCourseProgressMap(progressMap);
      const streakData = await getStreak();
      setStreak(streakData);
      setLoaded(true);
    };
    fetchData();
  }, []);

  const totalLessons = courses.reduce((acc, course) =>
    acc + course.units.reduce((a, unit) => a + unit.lessons.length, 0), 0);

  const avgQuizScore = Object.values(quizScores).length > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.values(quizScores).length)
    : 0;

  const completedCourses = courses.filter(c => courseProgressMap[c.id] === 100).length;
  const firstName = profile?.name?.split(' ')[0] || 'Trader';

  const stats = [
    {
      label: 'Lessons Done',
      value: completedLessons.length,
      total: totalLessons,
      icon: CheckCircle,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'Avg Quiz Score',
      value: avgQuizScore > 0 ? `${avgQuizScore}%` : '—',
      icon: Brain,
      color: '#A855F7',
      bg: 'rgba(168,85,247,0.1)',
    },
    {
      label: 'Courses Done',
      value: completedCourses,
      total: courses.length,
      icon: Trophy,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'Day Streak',
      value: streak?.current_streak || 0,
      sub: streak?.longest_streak ? `Best: ${streak.longest_streak}d` : undefined,
      icon: Zap,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.1)',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .dash-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          transition: border-color 0.2s, transform 0.2s;
        }
        .dash-card:hover {
          border-color: rgba(59,130,246,0.3);
          transform: translateY(-1px);
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 24px;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .stat-card:hover::before { opacity: 1; }
        .progress-track {
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          height: 6px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 20px;
          background: rgba(255,255,255,0.3);
          filter: blur(4px);
        }
        .course-row {
          padding: 16px 20px;
          border-radius: 12px;
          transition: background 0.15s;
          text-decoration: none;
          display: block;
        }
        .course-row:hover { background: rgba(255,255,255,0.04); }
        .score-chip {
          border-radius: 8px;
          padding: 14px 18px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.2s;
        }
        .score-chip:hover { background: rgba(255,255,255,0.06); }
        .grid-line {
          position: absolute;
          background: rgba(255,255,255,0.025);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
      `}</style>

      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px', position: 'relative' }}>

        {/* Decorative grid lines */}
        <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
          {[20, 40, 60, 80].map(p => (
            <div key={p} style={{ position: 'absolute', left: `${p}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.02)' }} />
          ))}
        </div>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 40, position: 'relative', zIndex: 1, animationDelay: '0ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 0 20px rgba(59,130,246,0.3)'
            }}>
              📊
            </div>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 700, color: '#F8FAFC', margin: 0, letterSpacing: '-0.5px' }}>
                Welcome back, {firstName}
              </h1>
              <p style={{ color: '#64748B', fontSize: 14, margin: 0, marginTop: 2 }}>
                Your trading education dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          {stats.map((stat, i) => (
            <div key={i} className="stat-card fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div style={{
                fontSize: 32, fontWeight: 700, color: '#F8FAFC',
                fontFamily: "'DM Mono', monospace",
                letterSpacing: '-1px', lineHeight: 1, marginBottom: 6
              }}>
                {loaded ? stat.value : '—'}
              </div>
              {stat.total !== undefined && (
                <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                  of {stat.total} total
                </div>
              )}
              <div style={{ fontSize: 13, color: '#64748B' }}>{stat.label}</div>
              {stat.sub && (
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{stat.sub}</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, position: 'relative', zIndex: 1 }}>

          {/* Course Progress */}
          <div className="dash-card fade-up" style={{ padding: '24px', animationDelay: '280ms' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp size={16} color="#3B82F6" />
                <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>Course Progress</span>
              </div>
              <span style={{ color: '#475569', fontSize: 12 }}>
                {completedLessons.length}/{totalLessons} lessons
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {courses.map((course, i) => {
                const progress = courseProgressMap[course.id] || 0;
                const total = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
                const done = Math.round((progress / 100) * total);
                const isComplete = progress === 100;

                return (
                  <Link to={`/course/${course.id}`} key={course.id} className="course-row" style={{ color: 'inherit' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{course.icon}</span>
                        <span style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 500 }}>{course.title}</span>
                        {isComplete && (
                          <span style={{
                            background: 'rgba(16,185,129,0.15)', color: '#34D399',
                            fontSize: 10, fontWeight: 600, padding: '2px 8px',
                            borderRadius: 99, border: '1px solid rgba(16,185,129,0.2)'
                          }}>DONE</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#475569', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                          {done}/{total}
                        </span>
                        <span style={{
                          color: progress > 0 ? '#3B82F6' : '#334155',
                          fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600,
                          minWidth: 36, textAlign: 'right'
                        }}>
                          {progress}%
                        </span>
                        <ArrowRight size={12} color="#334155" />
                      </div>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: loaded ? `${progress}%` : '0%' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Streak card */}
            <div className="dash-card fade-up" style={{
              padding: 24, animationDelay: '340ms',
              background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(251,146,60,0.05))',
              borderColor: 'rgba(239,68,68,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 6, fontWeight: 500 }}>CURRENT STREAK</div>
                  <div style={{
                    fontSize: 52, fontWeight: 700, color: '#F8FAFC',
                    fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: '-2px'
                  }}>
                    {streak?.current_streak || 0}
                    <span style={{ fontSize: 20, color: '#94A3B8', marginLeft: 4 }}>days</span>
                  </div>
                  {streak?.longest_streak ? (
                    <div style={{ color: '#64748B', fontSize: 12, marginTop: 6 }}>
                      Personal best: {streak.longest_streak} days
                    </div>
                  ) : null}
                </div>
                <div style={{ fontSize: 48 }}>🔥</div>
              </div>
            </div>

            {/* Quiz scores */}
            {Object.keys(quizScores).length > 0 && (
              <div className="dash-card fade-up" style={{ padding: 24, animationDelay: '400ms', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Brain size={16} color="#A855F7" />
                  <span style={{ color: '#F8FAFC', fontWeight: 600, fontSize: 15 }}>Quiz Scores</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(quizScores).slice(0, 6).map(([lessonId, score]) => (
                    <div key={lessonId} className="score-chip">
                      <div style={{
                        fontSize: 22, fontWeight: 700,
                        fontFamily: "'DM Mono', monospace",
                        color: score >= 80 ? '#34D399' : score >= 60 ? '#FBBF24' : '#F87171'
                      }}>
                        {score}%
                      </div>
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lessonId.replace(/-/g, ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick links */}
            <div className="dash-card fade-up" style={{ padding: 20, animationDelay: '460ms' }}>
              <div style={{ color: '#64748B', fontSize: 11, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>QUICK ACCESS</div>
              {[
                { label: 'Continue Learning', to: '/course/trading-fundamentals', icon: BookOpen, color: '#3B82F6' },
                { label: 'View Leaderboard', to: '/leaderboard', icon: Trophy, color: '#F59E0B' },
                { label: 'Open Journal', to: '/journal', icon: CheckCircle, color: '#10B981' },
              ].map((link, i) => (
                <Link key={i} to={link.to} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  textDecoration: 'none', color: 'inherit'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <link.icon size={14} color={link.color} />
                    <span style={{ color: '#CBD5E1', fontSize: 13 }}>{link.label}</span>
                  </div>
                  <ArrowRight size={12} color="#334155" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}