import { Link, useNavigate } from 'react-router';
import { Search, Menu, ChevronDown, Lightbulb, LogOut, User } from 'lucide-react';
import { Button } from '../components/ui/button';
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
  const searchRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close search results when clicking outside
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

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    courses.forEach(course => {
      // Search in course titles
      if (course.title.toLowerCase().includes(query) || 
          course.description.toLowerCase().includes(query)) {
        results.push({
          type: 'course',
          courseId: course.id,
          courseName: course.title,
          path: `/course/${course.id}`
        });
      }

      // Search in units
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

        // Search in lessons
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

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
  }, [searchQuery]);

  const handleResultClick = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
    setShowCoursesDropdown(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="bg-[#14181c] text-white border-b border-gray-700">
      <div className="flex items-center justify-between px-4 h-[60px]">
        <div className="flex items-center gap-4">
          {showMenuButton && (
            <button 
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-700 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80"
          >
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
              <div className="absolute left-0 top-full w-80 bg-gray-800 border border-gray-600 rounded-md z-10 mt-1 shadow-lg">
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
        </div>

        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowResults(true)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute left-0 top-full w-full bg-gray-800 border border-gray-600 rounded-b-md z-10 mt-1 shadow-lg max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={result.path}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                    onClick={() => handleResultClick(result.path)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-600 rounded text-white uppercase">{result.type}</span>
                      <div className="text-sm">
                        {result.type === 'course' && (
                          <span className="font-medium">{result.courseName}</span>
                        )}
                        {result.type === 'unit' && (
                          <>
                            <span className="text-gray-400">{result.courseName}</span>
                            <span className="mx-1 text-gray-500">›</span>
                            <span className="font-medium">{result.unitName}</span>
                          </>
                        )}
                        {result.type === 'lesson' && (
                          <>
                            <span className="text-gray-400">{result.courseName}</span>
                            <span className="mx-1 text-gray-500">›</span>
                            <span className="text-gray-400">{result.unitName}</span>
                            <span className="mx-1 text-gray-500">›</span>
                            <span className="font-medium">{result.lessonName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showResults && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
              <div className="absolute left-0 top-full w-full bg-gray-800 border border-gray-600 rounded-b-md z-10 mt-1 shadow-lg">
                <div className="px-4 py-3 text-sm text-gray-400">
                  No results found for "{searchQuery}"
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={userRef}>
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
        </div>
      </div>
    </header>
  );
}