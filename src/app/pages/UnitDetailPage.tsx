import { Link, useParams, Navigate } from 'react-router';
import { getCourseById, getUnitById } from '../data/courses';
import { Play, CheckCircle, Circle, Clock, BookOpen, Brain, ChevronRight } from 'lucide-react';
import { isLessonComplete } from '../data/progress';
import { useEffect, useState } from 'react';

export function UnitDetailPage() {
  const { courseId, unitId } = useParams();
  const course = getCourseById(courseId || '');
  const unit = getUnitById(courseId || '', unitId || '');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    if (!unit) return;
    const checkCompleted = async () => {
      const results = await Promise.all(
        unit.lessons.map(async (lesson) => {
          const done = await isLessonComplete(lesson.id);
          return done ? lesson.id : null;
        })
      );
      setCompletedLessons(results.filter(Boolean) as string[]);
    };
    checkCompleted();
  }, [unit]);

  if (!course || !unit) return <Navigate to="/" replace />;

  const unitIndex = course.units.findIndex(u => u.id === unit.id);
  const learnLessons = unit.lessons.filter(l => l.type === 'article' || l.type === 'video');
  const quizLessons = unit.lessons.filter(l => l.type === 'quiz');
  const completedCount = completedLessons.length;
  const totalCount = unit.lessons.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
        .lesson-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          text-decoration: none;
          transition: all 0.15s ease;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          position: relative;
        }
        .lesson-row:last-child { border-bottom: none; }
        .lesson-row:hover {
          background: rgba(255,255,255,0.03);
        }
        .lesson-row.completed:hover {
          background: rgba(16,185,129,0.04);
        }
        .lesson-row::after {
          content: '';
          position: absolute;
          right: 18px;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-right: 1.5px solid rgba(255,255,255,0.15);
          border-top: 1.5px solid rgba(255,255,255,0.15);
          transform: translateY(-50%) rotate(45deg);
          transition: border-color 0.15s;
        }
        .lesson-row:hover::after {
          border-color: rgba(59,130,246,0.6);
        }
        .section-block {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          overflow: hidden;
          margin-bottom: 16px;
        }
        .section-header {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .breadcrumb-link {
          color: #3B82F6;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.15s;
        }
        .breadcrumb-link:hover { color: #60A5FA; }
        .progress-track {
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          height: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 10px;
          background: rgba(255,255,255,0.35);
          filter: blur(3px);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease forwards; opacity: 0; }
      `}</style>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '40px 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}
          className="fade-up">
          <a href="/home" className="breadcrumb-link">Home</a>
          <span style={{ color: '#334155', fontSize: 13 }}>›</span>
          <a href={`/course/${course.id}`} className="breadcrumb-link">{course.title}</a>
          <span style={{ color: '#334155', fontSize: 13 }}>›</span>
          <span style={{ color: '#475569', fontSize: 13 }}>{unit.title}</span>
        </nav>

        {/* Unit Header */}
        <div className="fade-up" style={{ marginBottom: 28, animationDelay: '60ms' }}>
          <div style={{ color: '#334155', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>
            UNIT {unitIndex + 1}
          </div>
          <h1 style={{
            fontSize: 30, fontWeight: 700, color: '#F1F5F9',
            margin: 0, letterSpacing: '-0.6px', lineHeight: 1.2, marginBottom: 16
          }}>
            {unit.title}
          </h1>

          {/* Stats row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
              <BookOpen size={13} color="#475569" />
              {learnLessons.length} lessons
            </span>
            {quizLessons.length > 0 && (
              <span style={{ color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Brain size={13} color="#475569" />
                {quizLessons.length} quiz
              </span>
            )}
            {progress === 100 && (
              <span style={{
                background: 'rgba(16,185,129,0.15)', color: '#34D399',
                fontSize: 11, fontWeight: 700, padding: '2px 10px',
                borderRadius: 99, border: '1px solid rgba(16,185,129,0.25)'
              }}>COMPLETE</span>
            )}
          </div>
        </div>

        {/* About card */}
        <div className="fade-up" style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 14, padding: '20px 22px',
          marginBottom: 20, animationDelay: '100ms'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', margin: 0, letterSpacing: 0.5 }}>
              ABOUT THIS UNIT
            </h2>
            {progress > 0 && (
              <span style={{
                color: progress === 100 ? '#34D399' : '#3B82F6',
                fontSize: 13, fontWeight: 700, fontFamily: "'DM Mono', monospace"
              }}>
                {progress}%
              </span>
            )}
          </div>
          <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, margin: 0, marginBottom: progress > 0 ? 14 : 0 }}>
            {unit.description}
          </p>
          {progress > 0 && (
            <div className="progress-track">
              <div className="progress-fill" style={{
                width: `${progress}%`,
                background: progress === 100
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #3B82F6, #60A5FA)'
              }} />
            </div>
          )}
        </div>

        {/* Learn section */}
        {learnLessons.length > 0 && (
          <div className="section-block fade-up" style={{ animationDelay: '160ms' }}>
            <div className="section-header">
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(59,130,246,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Play size={13} color="#3B82F6" />
              </div>
              <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 600 }}>Learn</span>
              <span style={{ color: '#334155', fontSize: 12, marginLeft: 'auto', fontFamily: "'DM Mono', monospace" }}>
                {learnLessons.filter(l => completedLessons.includes(l.id)).length}/{learnLessons.length}
              </span>
            </div>

            {learnLessons.map((lesson, i) => {
              const completed = completedLessons.includes(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/course/${courseId}/unit/${unitId}/lesson/${lesson.id}`}
                  className={`lesson-row ${completed ? 'completed' : ''}`}
                  style={{ paddingRight: 40 }}
                >
                  {/* Status */}
                  <div style={{ flexShrink: 0 }}>
                    {completed ? (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CheckCircle size={14} color="#34D399" />
                      </div>
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                      </div>
                    )}
                  </div>

                  {/* Play icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: completed ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
                    border: `1px solid ${completed ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Play size={14} color={completed ? '#34D399' : '#3B82F6'} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: completed ? '#94A3B8' : '#E2E8F0',
                      fontSize: 14, fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {lesson.title}
                    </div>
                    {lesson.duration && (
                      <div style={{ color: '#334155', fontSize: 11, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} color="#334155" />
                        {lesson.duration} min
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Practice section */}
        {quizLessons.length > 0 && (
          <div className="section-block fade-up" style={{ animationDelay: '220ms' }}>
            <div className="section-header">
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(168,85,247,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Brain size={13} color="#A855F7" />
              </div>
              <span style={{ color: '#F1F5F9', fontSize: 14, fontWeight: 600 }}>Practice</span>
              <span style={{ color: '#334155', fontSize: 12, marginLeft: 'auto', fontFamily: "'DM Mono', monospace" }}>
                {quizLessons.filter(l => completedLessons.includes(l.id)).length}/{quizLessons.length}
              </span>
            </div>

            {quizLessons.map((lesson) => {
              const completed = completedLessons.includes(lesson.id);
              return (
                <Link
                  key={lesson.id}
                  to={`/course/${courseId}/unit/${unitId}/lesson/${lesson.id}`}
                  className={`lesson-row ${completed ? 'completed' : ''}`}
                  style={{ paddingRight: 40 }}
                >
                  {/* Status */}
                  <div style={{ flexShrink: 0 }}>
                    {completed ? (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CheckCircle size={14} color="#34D399" />
                      </div>
                    ) : (
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: '1.5px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                      </div>
                    )}
                  </div>

                  {/* Q icon */}
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: completed ? 'rgba(16,185,129,0.08)' : 'rgba(168,85,247,0.1)',
                    border: `1px solid ${completed ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.2)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: completed ? '#34D399' : '#A855F7',
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    Q
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: completed ? '#94A3B8' : '#E2E8F0',
                      fontSize: 14, fontWeight: 500,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {lesson.title}
                    </div>
                    {lesson.questions && (
                      <div style={{ color: '#334155', fontSize: 11, marginTop: 2 }}>
                        {lesson.questions.length} questions
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}