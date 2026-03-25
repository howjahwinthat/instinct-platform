import { Link, useParams, Navigate } from 'react-router';
import { getCourseById } from '../data/courses';
import { Progress } from '../components/ui/progress';
import { getUnitProgress } from '../data/progress';
import { ArrowRight } from 'lucide-react';

export function CourseDetailPage() {
  const { courseId } = useParams();
  const course = getCourseById(courseId || '');

  if (!course) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link to="/" className="text-blue-600 hover:underline">Home</Link>
        <span className="text-gray-400">›</span>
        <span className="text-gray-600">{course.title}</span>
      </nav>

      {/* Course Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-4xl">
            {course.icon}
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-600">{course.units.length} units · {course.skillsCount} skills</p>
          </div>
        </div>
        <p className="text-lg text-gray-700">{course.description}</p>
      </div>

      {/* Units */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        
        {course.units.map((unit, index) => {
          const unitProgress = getUnitProgress(unit.lessons.map(l => l.id));
          const totalDuration = unit.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

          return (
            <Link
              key={unit.id}
              to={`/course/${course.id}/unit/${unit.id}`}
              className="block bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    UNIT {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {unit.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{unit.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{unit.lessons.length} lessons</span>
                    {totalDuration > 0 && (
                      <>
                        <span>·</span>
                        <span>{totalDuration} min</span>
                      </>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" />
              </div>

              {unitProgress > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-blue-600">{unitProgress}%</span>
                  </div>
                  <Progress value={unitProgress} className="h-2" />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">Educational Platform</h3>
        <p className="text-sm text-blue-800">
          This course is designed for educational purposes. Focus on understanding concepts and building 
          foundational knowledge before applying them to real markets. Always practice risk management 
          and never risk more than you can afford to lose.
        </p>
      </div>
    </div>
  );
}
