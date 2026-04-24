import { Link, useNavigate } from 'react-router';
import { Search, Menu, ChevronDown, Lightbulb, LogOut, User, BarChart2, BookOpen, DollarSign, Trophy, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { courses } from '../data/courses';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';


interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
}

interface SearchResult {
  type: 'course' | 'unit' | 'lesson';
  courseId: string;
  courseName: string;
  unitId?: string;
  unitName?: string;
  lessonId?: string;
  lessonName?: string;
  path: string;
}

export function Header({ onMenuClick, showMenuButton = false }: HeaderProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
      if (coursesRef.current && !coursesRef.current.contains(event.target as Node)) setShowCoursesDropdown(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setShowUserDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 1) { setSearchResults([]); return; }
    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];
    courses.forEach(course => {
      if (course.title.toLowerCase().includes(query) || course.description.toLowerCase().includes(query)) {
        results.push({ type: 'course', courseId: course.id, courseName: course.title, path: `/course/${course.id}` });
      }
      course.units.forEach(unit => {
        if (unit.title.toLowerCase().includes(query) || unit.description.toLowerCase().includes(query)) {
          results.push({ type: 'unit', courseId: course.id, courseName: course.title, unitId: unit.id, unitName: unit.title, path: `/course/${course.id}/unit/${unit.id}` });
        }
        unit.lessons.forEach(lesson => {
          if (lesson.title.toLowerCase().includes(query)) {
            results.push({ type: 'lesson', courseId: course.id, courseName: course.title, unitId: unit.id, unitName: unit.title, lessonId: lesson.id, lessonName: lesson.title, path: `/course/${course.id}/unit/${unit.id}/lesson/${lesson.id}` });
          }
        });
      });
    });
    setSearchResults(results.slice(0, 8));
  }, [searchQuery]);

  const handleResultClick = (path: string) => {
    navigate(path); setSearchQuery(''); setShowResults(false); setMobileMenuOpen(false);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`); setShowCoursesDropdown(false); setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, index)}
        <span style={{ color: '#60A5FA', fontWeight: 700 }}>{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </span>
    );
  };

  const typeConfig: Record<string, { color: string; bg: string }> = {
    course: { color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
    unit: { color: '#A855F7', bg: 'rgba(168,85,247,0.15)' },
    lesson: { color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  };

  const navBtn = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 8,
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#64748B', fontSize: 13, fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.15s',
    textDecoration: 'none',
  } as React.CSSProperties;

  const initials = profile?.name
    ? profile.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        .nav-btn:hover { background: rgba(255,255,255,0.06) !important; color: #F1F5F9 !important; }
        .courses-item:hover { background: rgba(255,255,255,0.04) !important; }
        .search-result:hover { background: rgba(255,255,255,0.04) !important; }
        .user-item:hover { background: rgba(255,255,255,0.04) !important; }
        .mobile-item:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      <header style={{
        background: '#080C14',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', zIndex: 50,
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', height: 60, gap: 8 }}>

          {/* Logo */}
          <button
            onClick={() => navigate('/home')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 8px', borderRadius: 8, marginRight: 4,
              transition: 'opacity 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 12px rgba(59,130,246,0.3)',
            }}>
              <Lightbulb size={15} color="white" />
            </div>
            <span style={{ color: '#F1F5F9', fontSize: 16, fontWeight: 700, letterSpacing: '-0.3px' }}>
              Instinct
            </span>
          </button>

          {/* Left nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
            {/* Courses dropdown */}
            <div style={{ position: 'relative' }} ref={coursesRef} className="hidden-mobile">
              <button
                className="nav-btn"
                style={{ ...navBtn, display: 'flex' }}
                onClick={() => setShowCoursesDropdown(!showCoursesDropdown)}
              >
                <span>Courses</span>
                <ChevronDown size={13} />
              </button>
              {showCoursesDropdown && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                  width: 320, background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, zIndex: 100, overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}>
                  {courses.map((course, i) => (
                    <div
                      key={course.id}
                      className="courses-item"
                      style={{
                        padding: '12px 16px', cursor: 'pointer',
                        borderBottom: i < courses.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
                        }}>
                          {course.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>
                            {course.title}
                          </div>
                          <div style={{ color: '#475569', fontSize: 11, lineHeight: 1.4 }}>
                            {course.description.slice(0, 60)}...
                          </div>
                          <div style={{ color: '#3B82F6', fontSize: 10, marginTop: 4, fontWeight: 600 }}>
                            {course.skillsCount} skills
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="nav-btn" style={{ ...navBtn, display: 'none' }}
              onClick={() => navigate('/market')}>
              <BarChart2 size={14} /><span>Market</span>
            </button>
            <button className="nav-btn" style={{ ...navBtn, display: 'none' }}
              onClick={() => navigate('/journal')}>
              <BookOpen size={14} /><span>Journal</span>
            </button>
          </div>

          {/* Search - center */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 440 }} ref={searchRef}>
              <Search size={14} color="#334155" style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search courses, lessons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '8px 36px 8px 36px',
                  color: '#E2E8F0', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif",
                  outline: 'none', transition: 'border-color 0.15s', boxSizing: 'border-box',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = showResults ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.07)')}
                onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
                onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowResults(false); }}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#475569', padding: 2,
                  }}
                >
                  <X size={13} />
                </button>
              )}

              {/* Results dropdown */}
              {showResults && searchQuery && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                  width: '100%', background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, zIndex: 100, overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  maxHeight: 380, overflowY: 'auto',
                }}>
                  <div style={{
                    padding: '8px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: '#334155', fontSize: 11,
                    fontFamily: "'DM Mono', monospace"
                  }}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={result.path}
                      className="search-result"
                      style={{
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '2px 7px',
                          borderRadius: 99, letterSpacing: 0.8,
                          background: typeConfig[result.type].bg,
                          color: typeConfig[result.type].color,
                          flexShrink: 0, textTransform: 'uppercase'
                        }}>
                          {result.type}
                        </span>
                        <div style={{ fontSize: 13, color: '#CBD5E1', minWidth: 0 }}>
                          {result.type === 'course' && highlightMatch(result.courseName, searchQuery)}
                          {result.type === 'unit' && (
                            <span>{highlightMatch(result.unitName || '', searchQuery)}
                              <span style={{ color: '#334155', fontSize: 11, marginLeft: 6 }}>in {result.courseName}</span>
                            </span>
                          )}
                          {result.type === 'lesson' && (
                            <span>{highlightMatch(result.lessonName || '', searchQuery)}
                              <span style={{ color: '#334155', fontSize: 11, marginLeft: 6 }}>in {result.unitName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showResults && searchQuery.trim().length >= 1 && searchResults.length === 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 6px)',
                  width: '100%', background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, zIndex: 100, padding: '24px 16px', textAlign: 'center',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}>
                  <Search size={20} color="#1E293B" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ color: '#334155', fontSize: 13 }}>No results for "{searchQuery}"</div>
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <button className="nav-btn" style={navBtn} onClick={() => navigate('/market')}>
              <BarChart2 size={14} /><span style={{ display: 'none' }}>Market</span>
            </button>
            <button className="nav-btn" style={navBtn} onClick={() => navigate('/journal')}>
              <BookOpen size={14} /><span style={{ display: 'none' }}>Journal</span>
            </button>
            <button className="nav-btn" style={navBtn} onClick={() => navigate('/trades')}>
              <DollarSign size={14} /><span>Trades</span>
            </button>
            <button className="nav-btn" style={navBtn} onClick={() => navigate('/leaderboard')}>
              <Trophy size={14} /><span>Leaderboard</span>
            </button>


            {/* User menu */}
            <div style={{ position: 'relative' }} ref={userRef}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '5px 10px 5px 5px',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, #1D4ED8, #3B82F6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: 'white',
                  fontFamily: "'DM Mono', monospace"
                }}>
                  {initials}
                </div>
                <span style={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>
                  {profile?.name?.split(' ')[0] || 'User'}
                </span>
                <ChevronDown size={12} color="#475569" />
              </button>

              {showUserDropdown && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                  width: 200, background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, zIndex: 100, overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}>
                  <div style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}>{profile?.name}</div>
                    <div style={{ color: '#334155', fontSize: 11, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>
                      {profile?.email}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    className="user-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', textDecoration: 'none',
                      color: '#94A3B8', fontSize: 13, transition: 'background 0.15s',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User size={13} color="#475569" />
                    Dashboard
                  </Link>

                  <button
                    className="user-item"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', width: '100%',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#EF4444', fontSize: 13,
                      fontFamily: "'DM Sans', sans-serif",
                      transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onClick={handleLogout}
                  >
                    <LogOut size={13} color="#EF4444" />
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748B', padding: 6, borderRadius: 8,
                display: 'none',
              }}
              className="mobile-only"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{
            background: '#080C14',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 16px',
          }}>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={13} color="#334155" style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 10, padding: '8px 12px 8px 32px',
                  color: '#E2E8F0', fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              {searchResults.length > 0 && (
                <div style={{
                  position: 'absolute', left: 0, top: 'calc(100% + 4px)',
                  width: '100%', background: '#0D1117',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, zIndex: 10, overflow: 'hidden',
                  maxHeight: 220, overflowY: 'auto',
                }}>
                  {searchResults.map(result => (
                    <div
                      key={result.path}
                      className="search-result"
                      style={{
                        padding: '10px 14px', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div style={{ color: '#CBD5E1', fontSize: 13, fontWeight: 500 }}>
                        {result.lessonName || result.unitName || result.courseName}
                      </div>
                      <div style={{ color: '#334155', fontSize: 11 }}>{result.courseName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {[
              { icon: BookOpen, label: 'Courses', path: '/course/trading-fundamentals' },
              { icon: BarChart2, label: 'Market', path: '/market' },
              { icon: BookOpen, label: 'Journal', path: '/journal' },
              { icon: DollarSign, label: 'Trades', path: '/trades' },
              { icon: Trophy, label: 'Leaderboard', path: '/leaderboard' },
              { icon: User, label: 'Dashboard', path: '/dashboard' },
            ].map((item) => (
              <button
                key={item.path}
                className="mobile-item"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#94A3B8', fontSize: 14, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: 'left', transition: 'background 0.15s',
                  marginBottom: 2,
                }}
                onClick={() => { navigate(item.path); setMobileMenuOpen(false); }}
              >
                <item.icon size={16} color="#475569" />
                {item.label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 8, paddingTop: 10 }}>
              <div style={{ padding: '6px 12px', marginBottom: 6 }}>
                <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600 }}>{profile?.name}</div>
                <div style={{ color: '#334155', fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{profile?.email}</div>
              </div>
              <button
                className="mobile-item"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#EF4444', fontSize: 14, fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif", textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onClick={handleLogout}
              >
                <LogOut size={16} color="#EF4444" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}