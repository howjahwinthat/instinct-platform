import { Link, useParams, Navigate } from 'react-router';
import { getCourseById, getUnitById } from '../data/courses';
import { Play, CheckCircle, Circle } from 'lucide-react';
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

  if (!course || !unit) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="text-gray-400">›</span>
        <Link to={`/course/${course.id}`} className="text-blue-600 hover:underline">
          {course.title}
        </Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">{unit.title}</span>
      </nav>

      <div className="mb-8">
        <div className="text-sm font-medium text-gray-500 mb-2">
          UNIT {course.units.findIndex(u => u.id === unit.id) + 1}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{unit.title}</h1>
      </div>

      <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-3">About this unit</h2>
        <p className="text-gray-700 leading-relaxed">{unit.description}</p>
      </div>

      {unit.lessons.some(l => l.type === 'article' || l.type === 'video') && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Learn</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {unit.lessons
              .filter(lesson => lesson.type === 'article' || lesson.type === 'video')
              .map(lesson => {
                const completed = completedLessons.includes(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/course/${courseId}/unit/${unitId}/lesson/${lesson.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.duration && (
                        <p className="text-sm text-gray-500">{lesson.duration} min</p>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}

      {unit.lessons.some(l => l.type === 'quiz') && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Practice</h2>
          <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
            {unit.lessons
              .filter(lesson => lesson.type === 'quiz')
              .map(lesson => {
                const completed = completedLessons.includes(lesson.id);
                return (
                  <Link
                    key={lesson.id}
                    to={`/course/${courseId}/unit/${unitId}/lesson/${lesson.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      {completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-semibold text-sm">Q</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{lesson.title}</h3>
                      {lesson.questions && (
                        <p className="text-sm text-gray-500">{lesson.questions.length} questions</p>
                      )}
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}