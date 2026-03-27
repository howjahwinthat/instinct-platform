import { Link, useNavigate } from 'react-router';
import { Search, Menu, ChevronDown, Lightbulb, LogOut, User, BarChart2, Sun, Moon, BookOpen, DollarSign, Trophy, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { courses } from '../data/courses';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const { isDark, toggleTheme } = useTheme();
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (coursesRef.current && !coursesRef.current.contains(event.target as Node)) {
        setShowCoursesDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    courses.forEach(course => {
      if (course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query)) {
        results.push({
          type: 'course',
          courseId: course.id,
          courseName: course.title,
          path: `/course/${course.id}`
        });
      }

      course.units.forEach(unit => {
        if (unit.title.toLowerCase().includes(query) ||
            unit.description.toLowerCase().includes(query)) {
          results.push({
            type: 'unit',
            courseId: course.id,
            courseName: course.title,
            unitId: unit.id,
            unitName: unit.title,
            path: `/course/${course.id}/unit/${unit.id}`
          });
        }

        unit.lessons.forEach(lesson => {
          if (lesson.title.toLowerCase().includes(query)) {
            results.push({
              type: 'lesson',
              courseId: course.id,
              courseName: course.title,
              unitId: unit.id,
              unitName: unit.title,
              lessonId: lesson.id,
              lessonName: lesson.title,
              path: `/course/${course.id}/unit/${unit.id}/lesson/${lesson.id}`
            });
          }
        });
      });
    });

    setSearchResults(results.slice(0, 8));
  }, [searchQuery]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
    setMobileMenuOpen(false);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
    setShowCoursesDropdown(false);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login');
    }
  };

  const mobileNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, index)}
        <span className="text-blue-400 font-bold">{text.slice(index, index + query.length)}</span>
        {text.slice(index + query.length)}
      </span>
    );
  };

  const typeColors: Record<string, string> = {
    course: 'bg-blue-500',
    unit: 'bg-purple-500',
    lesson: 'bg-green-500',
  };

  return (
    <>
      <header className="bg-[#14181c] text-white border-b border-gray-700 relative z-50">
        <div className="flex items-center px-4 h-[60px] gap-4">

          {/* LEFT: Logo + Nav */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 hover:opacity-80 mr-2">
              <Lightbulb className="w-8 h-8" />
              <span className="text-xl font-semibold">Instinct</span>
            </button>

            <div className="relative hidden md:block" ref={coursesRef}>
              <button
                onClick={() => setShowCoursesDropdown(!showCoursesDropdown)}
                className="flex items-center gap-1 px-3 py-2 hover:bg-gray-700 rounded"
              >
                <span>Courses</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showCoursesDropdown && (
                <div className="absolute left-0 top-full w-80 bg-gray-800 border border-gray-600 rounded-md z-[100] mt-1 shadow-lg">
                  {courses.map(course => (
                    <div
                      key={course.id}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{course.icon}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm mb-1">{course.title}</div>
                          <div className="text-xs text-gray-400">{course.description}</div>
                          <div className="text-xs text-blue-400 mt-1">{course.skillsCount} skills</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => navigate('/market')} className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-gray-700 rounded">
              <BarChart2 className="w-4 h-4" />
              <span>Market</span>
            </button>

            <button onClick={() => navigate('/journal')} className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-gray-700 rounded">
              <BookOpen className="w-4 h-4" />
              <span>Journal</span>
            </button>
          </div>

          {/* CENTER: Search */}
          <div className="flex-1 flex justify-center px-4 hidden md:block">
            <div className="relative w-full max-w-md mx-auto" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-full bg-gray-800 text-white pl-10 pr-8 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setShowResults(false); }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {showResults && searchQuery && searchResults.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-gray-900 border border-gray-700 rounded-xl z-[100] mt-2 shadow-2xl max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 border-b border-gray-800">
                    <span className="text-xs text-gray-500">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"</span>
                  </div>
                  {searchResults.map((result) => (
                    <div
                      key={result.path}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-800 border-b border-gray-800 last:border-b-0 transition-colors"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 ${typeColors[result.type]} rounded-full text-white uppercase font-medium flex-shrink-0`}>
                          {result.type}
                        </span>
                        <div className="text-sm min-w-0">
                          {result.type === 'course' && (
                            <span className="font-medium text-white">
                              {highlightMatch(result.courseName, searchQuery)}
                            </span>
                          )}
                          {result.type === 'unit' && (
                            <div>
                              <span className="font-medium text-white">
                                {highlightMatch(result.unitName || '', searchQuery)}
                              </span>
                              <span className="text-gray-500 text-xs ml-2">in {result.courseName}</span>
                            </div>
                          )}
                          {result.type === 'lesson' && (
                            <div>
                              <span className="font-medium text-white">
                                {highlightMatch(result.lessonName || '', searchQuery)}
                              </span>
                              <span className="text-gray-500 text-xs ml-2">in {result.unitName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showResults && searchQuery.trim().length >= 1 && searchResults.length === 0 && (
                <div className="absolute left-0 top-full w-full bg-gray-900 border border-gray-700 rounded-xl z-[100] mt-2 shadow-2xl">
                  <div className="px-4 py-6 text-center">
                    <Search className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-400">No results for "{searchQuery}"</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button onClick={() => navigate('/trades')} className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-gray-700 rounded">
              <DollarSign className="w-4 h-4" />
              <span>Trades</span>
            </button>

            <button onClick={() => navigate('/leaderboard')} className="hidden md:flex items-center gap-1 px-3 py-2 hover:bg-gray-700 rounded">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <div className="relative hidden md:block" ref={userRef}>
              <div
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 px-3 py-2 rounded"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                  </span>
                </div>
                <span className="hidden sm:inline">{profile?.name || 'User'}</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              {showUserDropdown && (
                <div className="absolute right-0 top-full w-48 bg-gray-800 border border-gray-600 rounded-md z-10 mt-1 shadow-lg">
                  <div className="px-4 py-3 border-b border-gray-700">
                    <div className="text-sm font-medium">{profile?.name}</div>
                    <div className="text-xs text-gray-400">{profile?.email}</div>
                  </div>
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 hover:bg-gray-700 flex items-center gap-2"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <div
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-700 rounded"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#14181c] border-t border-gray-700 px-4 py-4 space-y-1">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-xl border border-gray-600 focus:outline-none focus:border-blue-500"
              />
              {searchResults.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-gray-900 border border-gray-700 rounded-xl z-10 mt-1 shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.path}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-800 border-b border-gray-800 last:border-b-0"
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div className="text-sm text-white font-medium">{result.lessonName || result.unitName || result.courseName}</div>
                      <div className="text-xs text-gray-400">{result.courseName}</div>
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
                onClick={() => mobileNav(item.path)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-gray-700 rounded-lg text-left transition-colors"
              >
                <item.icon className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">{item.label}</span>
              </button>
            ))}

            <div className="border-t border-gray-700 pt-3 mt-3">
              <div className="px-3 py-2 mb-2">
                <div className="text-sm font-medium text-white">{profile?.name}</div>
                <div className="text-xs text-gray-400">{profile?.email}</div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-900 hover:bg-opacity-30 rounded-lg text-left transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}