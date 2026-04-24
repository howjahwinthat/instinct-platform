import { Link, useParams, Navigate } from 'react-router';
import { getCourseById } from '../data/courses';
import { getUnitProgress } from '../data/progress';
import { ArrowRight, Clock, BookOpen, CheckCircle, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const course = getCourseById(courseId || '');
  const [unitProgressMap, setUnitProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!course) return;
    const fetchProgress = async () => {
      const progressMap: Record<string, number> = {};
      await Promise.all(
        course.units.map(async (unit) => {
          const progress = await getUnitProgress(unit.lessons.map(l => l.id));
          progressMap[unit.id] = progress;
        })
      );
      setUnitProgressMap(progressMap);
    };
    fetchProgress();
  }, [course]);

  if (!course) return <Navigate to="/" replace />;

  const totalProgress = course.units.length > 0
    ? Math.round(Object.values(unitProgressMap).reduce((a, b) => a + b, 0) / course.units.length)
    : 0;

  const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const totalDuration = course.units.reduce((acc, unit) =>
    acc + unit.lessons.reduce((a, l) => a + (l.duration || 0), 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        .unit-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 24px;
          text-decoration: none;
          display: block;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .unit-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
        }
        .unit-card:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(59,130,246,0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .unit-card.complete {
          border-color: rgba(16,185,129,0.2);
        }
        .unit-card.complete:hover {
          border-color: rgba(16,185,129,0.4);
        }
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
          position: relative;
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
        }
        .progress-fill.complete {
          background: linear-gradient(90deg, #10B981, #34D399);
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 12px;
          background: rgba(255,255,255,0.3);
          filter: blur(3px);
        }
        .breadcrumb-link {
          color: #3B82F6;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s;
        }
        .breadcrumb-link:hover { color: #60A5FA; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.4s ease forwards; opacity: 0; }
      `}</style>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
          className="fade-up">
          <a href="/home" className="breadcrumb-link">Home</a>
          <span style={{ color: '#334155', fontSize: 13 }}>›</span>
          <span style={{ color: '#475569', fontSize: 13 }}>{course.title}</span>
        </nav>

        {/* Course Hero */}
        <div className="fade-up" style={{ marginBottom: 40, animationDelay: '60ms' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, boxShadow: '0 0 32px rgba(59,130,246,0.25)'
            }}>
              {course.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: 32, fontWeight: 700, color: '#F1F5F9',
                margin: 0, letterSpacing: '-0.8px', lineHeight: 1.2, marginBottom: 8
              }}>
                {course.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 13 }}>
                  <BookOpen size={13} color="#475569" />
                  <span>{totalLessons} lessons</span>
                </div>
                {totalDuration > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 13 }}>
                    <Clock size={13} color="#475569" />
                    <span>{totalDuration} min</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569', fontSize: 13 }}>
                  <span>{course.units.length} units</span>
                </div>
                {totalProgress === 100 && (
                  <span style={{
                    background: 'rgba(16,185,129,0.15)', color: '#34D399',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 99, border: '1px solid rgba(16,185,129,0.25)',
                    letterSpacing: 0.5
                  }}>COMPLETE</span>
                )}
              </div>
            </div>
          </div>

          <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
            {course.description}
          </p>

          {/* Overall progress bar */}
          {totalProgress > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ color: '#64748B', fontSize: 12, fontWeight: 500 }}>COURSE PROGRESS</span>
                <span style={{
                  color: totalProgress === 100 ? '#34D399' : '#3B82F6',
                  fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace"
                }}>
                  {totalProgress}%
                </span>
              </div>
              <div className="progress-track">
                <div
                  className={`progress-fill ${totalProgress === 100 ? 'complete' : ''}`}
                  style={{ width: `${totalProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Units */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16
          }} className="fade-up" >
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F1F5F9', margin: 0, letterSpacing: '-0.2px' }}>
              Course Content
            </h2>
            <span style={{ color: '#334155', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
              {course.units.length} units
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {course.units.map((unit, index) => {
              const unitProgress = unitProgressMap[unit.id] || 0;
              const isComplete = unitProgress === 100;
              const inProgress = unitProgress > 0 && !isComplete;
              const totalDuration = unit.lessons.reduce((sum, l) => sum + (l.duration || 0), 0);

              return (
                <Link
                  key={unit.id}
                  to={`/course/${course.id}/unit/${unit.id}`}
                  className={`unit-card fade-up ${isComplete ? 'complete' : ''}`}
                  style={{ animationDelay: `${120 + index * 60}ms` }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

                    {/* Unit number / status */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                      background: isComplete
                        ? 'rgba(16,185,129,0.15)'
                        : inProgress
                        ? 'rgba(59,130,246,0.15)'
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : inProgress ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {isComplete ? (
                        <CheckCircle size={18} color="#34D399" />
                      ) : inProgress ? (
                        <span style={{
                          fontSize: 14, fontWeight: 700, color: '#3B82F6',
                          fontFamily: "'DM Mono', monospace"
                        }}>{index + 1}</span>
                      ) : (
                        <span style={{
                          fontSize: 14, fontWeight: 700, color: '#475569',
                          fontFamily: "'DM Mono', monospace"
                        }}>{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
                        UNIT {index + 1}
                      </div>
                      <h3 style={{
                        fontSize: 16, fontWeight: 600, color: '#F1F5F9',
                        margin: 0, marginBottom: 6, letterSpacing: '-0.2px'
                      }}>
                        {unit.title}
                      </h3>
                      <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.5, margin: 0, marginBottom: 12 }}>
                        {unit.description}
                      </p>

                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ color: '#334155', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <BookOpen size={11} color="#334155" />
                          {unit.lessons.length} lessons
                        </span>
                        {totalDuration > 0 && (
                          <span style={{ color: '#334155', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={11} color="#334155" />
                            {totalDuration} min
                          </span>
                        )}
                        {isComplete && (
                          <span style={{ color: '#34D399', fontSize: 12, fontWeight: 600 }}>✓ Complete</span>
                        )}
                        {inProgress && (
                          <span style={{ color: '#3B82F6', fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                            {unitProgress}%
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      {unitProgress > 0 && (
                        <div className="progress-track" style={{ marginTop: 12 }}>
                          <div
                            className={`progress-fill ${isComplete ? 'complete' : ''}`}
                            style={{ width: `${unitProgress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <ArrowRight size={16} color="#1E293B" style={{ flexShrink: 0, marginTop: 12 }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="fade-up" style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.12)',
          borderRadius: 12, padding: '16px 20px',
          animationDelay: '500ms'
        }}>
          <div style={{ color: '#3B82F6', fontSize: 12, fontWeight: 700, marginBottom: 4, letterSpacing: 0.5 }}>
            EDUCATIONAL PLATFORM
          </div>
          <p style={{ color: '#475569', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            This course is for educational purposes only. Always practice risk management and never risk more than you can afford to lose.
          </p>
        </div>
      </main>
    </div>
  );
}