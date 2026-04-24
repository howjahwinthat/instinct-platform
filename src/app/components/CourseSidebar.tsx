import { Link, useParams } from 'react-router';
import { getCourseById } from '../data/courses';
import { getUnitProgress } from '../data/progress';
import { useEffect, useState } from 'react';
import { CheckCircle, Circle, ChevronRight, Lock } from 'lucide-react';

interface CourseSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CourseSidebar({ isOpen = true, onClose }: CourseSidebarProps) {
  const { courseId, unitId } = useParams();
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

  if (!course) return null;

  const totalProgress = course.units.length > 0
    ? Math.round(Object.values(unitProgressMap).reduce((a, b) => a + b, 0) / course.units.length)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .sidebar-unit {
          display: block;
          border-radius: 10px;
          padding: 12px 14px;
          text-decoration: none;
          transition: all 0.15s ease;
          position: relative;
          border: 1px solid transparent;
        }
        .sidebar-unit:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.06);
        }
        .sidebar-unit.active {
          background: rgba(59,130,246,0.12);
          border-color: rgba(59,130,246,0.25);
        }
        .sidebar-unit.active::before {
          content: '';
          position: absolute;
          left: 0; top: 20%; bottom: 20%;
          width: 3px;
          background: #3B82F6;
          border-radius: 0 3px 3px 0;
        }
        .progress-track {
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          height: 3px;
          overflow: hidden;
          margin-top: 8px;
        }
        .progress-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          transition: width 0.8s cubic-bezier(0.4,0,0.2,1);
        }
        .overall-track {
          background: rgba(255,255,255,0.06);
          border-radius: 99px;
          height: 4px;
          overflow: hidden;
          margin-top: 10px;
        }
        .overall-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          transition: width 1s cubic-bezier(0.4,0,0.2,1);
          position: relative;
        }
        .overall-fill::after {
          content: '';
          position: absolute;
          right: 0; top: 0; bottom: 0;
          width: 12px;
          background: rgba(255,255,255,0.4);
          filter: blur(3px);
        }
      `}</style>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:transform-none overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        style={{
          top: '60px',
          height: 'calc(100vh - 60px)',
          width: 256,
          background: '#0A0F1A',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Course Header */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Link
            to={`/course/${course.id}`}
            style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', marginBottom: 16 }}
          >
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, boxShadow: '0 0 16px rgba(59,130,246,0.25)'
            }}>
              {course.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                color: '#F1F5F9', fontSize: 13, fontWeight: 700,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                letterSpacing: '-0.2px'
              }}>
                {course.title}
              </div>
              <div style={{ color: '#475569', fontSize: 11, marginTop: 2 }}>
                {course.units.length} units · {course.skillsCount} skills
              </div>
            </div>
          </Link>

          {/* Overall progress */}
          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B', fontSize: 11, fontWeight: 500 }}>OVERALL</span>
              <span style={{
                color: totalProgress === 100 ? '#34D399' : '#3B82F6',
                fontSize: 13, fontWeight: 700,
                fontFamily: "'DM Mono', monospace"
              }}>
                {totalProgress}%
              </span>
            </div>
            <div className="overall-track">
              <div className="overall-fill" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Units */}
        <nav style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ color: '#334155', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, padding: '4px 6px 8px' }}>
            UNITS
          </div>

          {course.units.map((unit, index) => {
            const isActive = unit.id === unitId;
            const unitProgress = unitProgressMap[unit.id] || 0;
            const isComplete = unitProgress === 100;
            const inProgress = unitProgress > 0 && unitProgress < 100;

            return (
              <Link
                key={unit.id}
                to={`/course/${course.id}/unit/${unit.id}`}
                className={`sidebar-unit ${isActive ? 'active' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {/* Icon */}
                  <div style={{ flexShrink: 0, marginTop: 1 }}>
                    {isComplete ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(16,185,129,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <CheckCircle size={12} color="#34D399" />
                      </div>
                    ) : inProgress ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid #3B82F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6' }} />
                      </div>
                    ) : (
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isActive ? '#93C5FD' : '#475569',
                      fontSize: 10, fontWeight: 600, letterSpacing: 0.8, marginBottom: 3
                    }}>
                      UNIT {index + 1}
                    </div>
                    <div style={{
                      color: isActive ? '#F1F5F9' : isComplete ? '#94A3B8' : '#CBD5E1',
                      fontSize: 13, fontWeight: 500, lineHeight: 1.3,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    }}>
                      {unit.title}
                    </div>

                    {/* Progress bar */}
                    {inProgress && (
                      <>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${unitProgress}%` }} />
                        </div>
                        <div style={{ color: '#475569', fontSize: 10, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                          {unitProgress}%
                        </div>
                      </>
                    )}

                    {isComplete && (
                      <div style={{ color: '#34D399', fontSize: 10, marginTop: 3, fontWeight: 600 }}>
                        Complete ✓
                      </div>
                    )}
                  </div>

                  <ChevronRight
                    size={12}
                    color={isActive ? '#3B82F6' : '#1E293B'}
                    style={{ flexShrink: 0, marginTop: 4 }}
                  />
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}