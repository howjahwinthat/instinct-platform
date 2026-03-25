import { Link, useParams, Navigate, useNavigate } from 'react-router';
import { getCourseById, getUnitById, getLessonById } from '../data/courses';
import { markLessonComplete, saveQuizScore, isLessonComplete } from '../data/progress';
import { QuizComponent } from '../components/QuizComponent';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { Button } from '../components/ui/button';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export function LessonPage() {
  const { courseId, unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);

  const course = getCourseById(courseId || '');
  const unit = getUnitById(courseId || '', unitId || '');
  const lesson = getLessonById(courseId || '', unitId || '', lessonId || '');

  useEffect(() => {
    setCompleted(isLessonComplete(lessonId || ''));
  }, [lessonId]);

  if (!course || !unit || !lesson) {
    return <Navigate to="/" replace />;
  }

  const currentLessonIndex = unit.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = unit.lessons[currentLessonIndex + 1];
  const prevLesson = unit.lessons[currentLessonIndex - 1];

  const handleMarkComplete = () => {
    if (lesson.id) {
      markLessonComplete(lesson.id);
      setCompleted(true);
    }
  };

  const handleQuizComplete = (score: number) => {
    if (lesson.id) {
      saveQuizScore(lesson.id, score);
      setCompleted(true);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/unit/${unitId}/lesson/${nextLesson.id}`);
    } else {
      // Find next unit
      const currentUnitIndex = course.units.findIndex(u => u.id === unitId);
      const nextUnit = course.units[currentUnitIndex + 1];
      if (nextUnit) {
        navigate(`/course/${courseId}/unit/${nextUnit.id}`);
      } else {
        navigate(`/course/${courseId}`);
      }
    }
  };

  const handlePrevious = () => {
    if (prevLesson) {
      navigate(`/course/${courseId}/unit/${unitId}/lesson/${prevLesson.id}`);
    } else {
      navigate(`/course/${courseId}/unit/${unitId}`);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6">
          <Link to="/" className="text-blue-600 hover:underline">Home</Link>
          <span className="text-gray-400">›</span>
          <Link to={`/course/${course.id}`} className="text-blue-600 hover:underline">
            {course.title}
          </Link>
          <span className="text-gray-400">›</span>
          <Link to={`/course/${courseId}/unit/${unitId}`} className="text-blue-600 hover:underline">
            {unit.title}
          </Link>
          <span className="text-gray-400">›</span>
          <span className="text-gray-600">{lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              {lesson.duration && (
                <p className="text-gray-600">{lesson.duration} minutes</p>
              )}
            </div>
            {completed && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        {lesson.type === 'article' && lesson.content && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <MarkdownRenderer content={lesson.content} />
            
            {!completed && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button onClick={handleMarkComplete} size="lg">
                  Mark as Complete
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {lesson.type === 'article' && !lesson.content && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">This lesson content is coming soon.</p>
              <p className="text-sm text-gray-400">We're working on creating comprehensive educational materials for this topic.</p>
            </div>
            
            {!completed && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <Button onClick={handleMarkComplete} size="lg">
                  Mark as Complete
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        )}

        {lesson.type === 'quiz' && lesson.questions && (
          <QuizComponent 
            questions={lesson.questions} 
            onComplete={handleQuizComplete}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!prevLesson && course.units.findIndex(u => u.id === unitId) === 0}
          >
            <ChevronLeft className="mr-2 w-4 h-4" />
            Previous
          </Button>

          <Link 
            to={`/course/${courseId}/unit/${unitId}`}
            className="text-blue-600 hover:underline"
          >
            Back to Unit
          </Link>

          <Button onClick={handleNext}>
            {nextLesson ? 'Next Lesson' : 'Complete Unit'}
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}