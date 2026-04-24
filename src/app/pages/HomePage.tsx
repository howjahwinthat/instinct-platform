import { Link } from 'react-router';
import { Header } from '../components/Header';
import { courses } from '../data/courses';
import { ArrowRight, BookOpen, Target, Shield, Brain, TrendingUp, Zap } from 'lucide-react';
import { getCourseProgress } from '../data/progress';
import { useEffect, useState } from 'react';

export function HomePage() {
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchProgress = async () => {
      const progressMap: Record<string, number> = {};
      await Promise.all(
        courses.map(async (course) => {
          const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
          const progress = await getCourseProgress(course.id, totalLessons);
          progressMap[course.id] = progress;
        })
      );
      setCourseProgressMap(progressMap);
    };
    fetchProgress();
  }, []);

  const features = [
    {
      icon: BookOpen,
      color: '#3B82F6',
      bg: 'rgba(59,130,246,0.1)',
      title: 'Structured Learning Path',
      desc: 'Follow a clear progression from beginner to advanced with organized modules and lessons.',
    },
    {
      icon: Target,
      color: '#10B981',
      bg: 'rgba(16,185,129,0.1)',
      title: 'Interactive Quizzes',
      desc: 'Test your knowledge after each section to reinforce learning and compete on the leaderboard.',
    },
    {
      icon: Shield,
      color: '#A855F7',
      bg: 'rgba(168,85,247,0.1)',
      title: 'Risk-First Approach',
      desc: 'Learn responsible trading with emphasis on risk management, discipline, and long-term thinking.',
    },
    {
      icon: Zap,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.1)',
      title: 'AI Trading Assistant',
      desc: 'Get instant answers to your trading questions from our built-in AI assistant.',
    },
    {
      icon: TrendingUp,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.1)',
      title: 'Live Market Data',
      desc: 'Apply what you learn to real markets with live stock prices and interactive charts.',
    },
    {
      icon: Brain,
      color: '#06B6D4',
      bg: 'rgba(6,182,212,0.1)',
      title: 'Progress Tracking',
      desc: 'Track streaks, quiz scores, and lesson completion across all your devices.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        .feature-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 24px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
        }
        .feature-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.1);
          transform: translateY(-2px);
        }
        .course-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 24px;
          text-decoration: none;
          display: block;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .course-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(59,130,246,0.2), transparent);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .course-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(59,130,246,0.25);
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .course-card:hover::before { opacity: 1; }
        .progress-track {
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          height: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        .progress-fill.complete {
          background: linear-gradient(90deg, #10B981, #34D399);
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 10px;
          background: rgba(255,255,255,0.35);
          filter: blur(3px);
        }
        .start-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: #3B82F6; color: white;
          text-decoration: none; font-weight: 600; font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          box-shadow: 0 0 24px rgba(59,130,246,0.3);
        }
        .start-btn:hover {
          background: #2563EB;
          transform: translateY(-1px);
          box-shadow: 0 0 32px rgba(59,130,246,0.4);
        }
        .outline-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 12px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #94A3B8; text-decoration: none;
          font-weight: 600; font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
        }
        .outline-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: #F1F5F9;
          background: rgba(255,255,255,0.04);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease forwards; opacity: 0; }
        .section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 2px;
          color: #334155; margin-bottom: 12px;
        }
      `}</style>

      <Header />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }} className="fade-up">
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 99, padding: '6px 16px',
            marginBottom: 24
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
            <span style={{ color: '#3B82F6', fontSize: 12, fontWeight: 600 }}>
              The smarter way to learn trading
            </span>
          </div>

          <h1 style={{
            fontSize: 52, fontWeight: 700, color: '#F1F5F9',
            letterSpacing: '-1.5px', lineHeight: 1.1,
            margin: '0 auto 20px', maxWidth: 700
          }}>
            Learn to Trade{' '}
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              with Confidence
            </span>
          </h1>

          <p style={{
            color: '#64748B', fontSize: 17, lineHeight: 1.7,
            maxWidth: 560, margin: '0 auto 36px'
          }}>
            A structured, progressive trading education platform. Master financial markets
            through clear lessons, interactive quizzes, and real-time market data.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/course/trading-fundamentals" className="start-btn">
              Start Learning
              <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="outline-btn">
              View Dashboard
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 48,
            marginTop: 56, paddingTop: 40,
            borderTop: '1px solid rgba(255,255,255,0.04)'
          }}>
            {[
              { value: '4', label: 'Courses' },
              { value: '36+', label: 'Lessons' },
              { value: '100%', label: 'Free' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: '#F1F5F9',
                  fontFamily: "'DM Mono', monospace", letterSpacing: '-1px'
                }}>
                  {stat.value}
                </div>
                <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Courses */}
        <div style={{ marginBottom: 72 }}>
          <div className="fade-up" style={{ marginBottom: 24, animationDelay: '100ms' }}>
            <div className="section-label">LEARNING PATHS</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.5px' }}>
              Choose your course
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {courses.map((course, i) => {
              const progress = courseProgressMap[course.id] || 0;
              const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
              const completedLessons = Math.round((progress / 100) * totalLessons);
              const isComplete = progress === 100;

              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="course-card fade-up"
                  style={{ animationDelay: `${160 + i * 60}ms` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                      background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, boxShadow: '0 0 20px rgba(59,130,246,0.2)'
                    }}>
                      {course.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <h3 style={{
                          fontSize: 15, fontWeight: 700, color: '#F1F5F9',
                          margin: 0, letterSpacing: '-0.2px'
                        }}>
                          {course.title}
                        </h3>
                        {isComplete && (
                          <span style={{
                            background: 'rgba(16,185,129,0.15)', color: '#34D399',
                            fontSize: 10, fontWeight: 700, padding: '2px 8px',
                            borderRadius: 99, border: '1px solid rgba(16,185,129,0.25)',
                            flexShrink: 0
                          }}>DONE</span>
                        )}
                      </div>

                      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.5, margin: 0, marginBottom: 14 }}>
                        {course.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <span style={{ color: '#334155', fontSize: 12 }}>
                          {course.units.length} units
                        </span>
                        <span style={{ color: '#1E293B' }}>·</span>
                        <span style={{ color: '#334155', fontSize: 12 }}>
                          {course.skillsCount} skills
                        </span>
                        {progress > 0 && (
                          <>
                            <span style={{ color: '#1E293B' }}>·</span>
                            <span style={{
                              color: isComplete ? '#34D399' : '#3B82F6',
                              fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 600
                            }}>
                              {progress}%
                            </span>
                          </>
                        )}
                      </div>

                      <div className="progress-track">
                        <div
                          className={`progress-fill ${isComplete ? 'complete' : ''}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {progress > 0 && (
                        <div style={{ color: '#334155', fontSize: 11, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
                          {completedLessons}/{totalLessons} lessons complete
                        </div>
                      )}
                    </div>

                    <ArrowRight size={15} color="#1E293B" style={{ flexShrink: 0, marginTop: 4 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 72 }}>
          <div className="fade-up" style={{ marginBottom: 24, animationDelay: '200ms' }}>
            <div className="section-label">PLATFORM FEATURES</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.5px' }}>
              Everything you need to learn trading
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {features.map((feature, i) => (
              <div
                key={i}
                className="feature-card fade-up"
                style={{ animationDelay: `${260 + i * 50}ms` }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: feature.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16
                }}>
                  <feature.icon size={18} color={feature.color} />
                </div>
                <h3 style={{
                  fontSize: 14, fontWeight: 700, color: '#F1F5F9',
                  margin: 0, marginBottom: 8, letterSpacing: '-0.2px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Why section */}
        <div className="fade-up" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 20, padding: '40px 48px',
          animationDelay: '400ms'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 32 }}>
            <div>
              <div className="section-label">THE PROBLEM</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', margin: 0, marginBottom: 12 }}>
                Trading education is broken
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                Learning to trade is hard due to fragmented information, misleading content,
                and no structured resources. Most traders rely on unverified sources and trial-and-error.
              </p>
            </div>
            <div>
              <div className="section-label">THE SOLUTION</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', margin: 0, marginBottom: 12 }}>
                Instinct gives you a clear path
              </h3>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                A clear, progressive curriculum modeled after proven educational platforms.
                Learn systematically, from fundamentals to advanced strategies, with emphasis
                on discipline and responsible trading.
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 20
          }}>
            <p style={{ color: '#334155', fontSize: 12, margin: 0, lineHeight: 1.6 }}>
              ⚠️ <strong style={{ color: '#475569' }}>Disclaimer:</strong> This platform is for educational purposes only.
              It does not execute trades or provide financial advice. Always conduct your own research
              and consult a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}