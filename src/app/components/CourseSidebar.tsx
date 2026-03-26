import { Link, useParams } from 'react-router';
import { Progress } from '../components/ui/progress';
import { getCourseById } from '../data/courses';
import { getUnitProgress } from '../data/progress';
import { useEffect, useState } from 'react';

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

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-200 ease-in-out
          lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}
        style={{ top: '60px', height: 'calc(100vh - 60px)' }}
      >
        <div className="p-6">
          <Link
            to={`/course/${course.id}`}
            className="flex items-start gap-3 mb-6 hover:bg-gray-50 dark:hover:bg-gray-800 p-3 -m-3 rounded"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
              {course.icon}
            </div>
            <div>
              <h2 className="font-semibold text-base text-gray-900 dark:text-white">{course.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{course.units.length} UNITS · {course.skillsCount} SKILLS</p>
            </div>
          </Link>

          <nav className="space-y-1">
            {course.units.map((unit, index) => {
              const isActive = unit.id === unitId;
              const unitProgress = unitProgressMap[unit.id] || 0;
              return (
                <div key={unit.id}>
                  <Link
                    to={`/course/${course.id}/unit/${unit.id}`}
                    className={`
                      block px-3 py-3 rounded transition-colors
                      ${isActive
                        ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-700 dark:border-blue-400 -ml-[1px]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }
                    `}
                  >
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                      UNIT {index + 1}
                    </div>
                    <div className="font-medium text-sm">{unit.title}</div>
                    {unitProgress > 0 && (
                      <div className="mt-2">
                        <Progress value={unitProgress} className="h-1" />
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}