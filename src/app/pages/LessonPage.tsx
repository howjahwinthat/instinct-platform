import { Link, useParams, Navigate, useNavigate } from 'react-router';
import { getCourseById, getUnitById, getLessonById } from '../data/courses';
import { markLessonComplete, saveQuizScore, isLessonComplete } from '../data/progress';
import { QuizComponent } from '../components/QuizComponent';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { Button } from '../components/ui/button';
import { CheckCircle, ChevronLeft, ChevronRight, Save, StickyNote, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateStreak } from '../lib/streak';
import { supabase } from '../lib/supabase';

export function LessonPage() {
  const { courseId, unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const course = getCourseById(courseId || '');
  const unit = getUnitById(courseId || '', unitId || '');
  const lesson = getLessonById(courseId || '', unitId || '', lessonId || '');

  useEffect(() => {
    isLessonComplete(lessonId || '').then(setCompleted);
    fetchNote();
  }, [lessonId]);

  const fetchNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('lesson_notes')
      .select('content')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .single();

    if (data) {
      setNote(data.content);
    } else {
      setNote('');
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('lesson_notes').upsert({
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      content: note,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });

    setSavingNote(false);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (!course || !unit || !lesson) {
    return <Navigate to="/" replace />;
  }

  const currentLessonIndex = unit.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = unit.lessons[currentLessonIndex + 1];
  const prevLesson = unit.lessons[currentLessonIndex - 1];

  const handleMarkComplete = async () => {
    if (lesson.id) {
      await markLessonComplete(lesson.id, courseId || '', unitId || '');
      await updateStreak();
      setCompleted(true);
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (lesson.id) {
      await saveQuizScore(lesson.id, courseId || '', score);
      await updateStreak();
      setCompleted(true);
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/unit/${unitId}/lesson/${nextLesson.id}`);
    } else {
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
    <div className="min-h-full bg-gray-50 dark:bg-gray-950">
      <div className="flex">
        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${showNotes ? 'mr-80' : ''}`}>
          <div className="max-w-4xl mx-auto px-6 py-8">
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
              <span className="text-gray-600 dark:text-gray-400">{lesson.title}</span>
            </nav>

            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{lesson.title}</h1>
                  {lesson.duration && (
                    <p className="text-gray-600 dark:text-gray-400">{lesson.duration} minutes</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {completed && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900 px-4 py-2 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  )}
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      showNotes
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <StickyNote className="w-4 h-4" />
                    <span className="text-sm font-medium">Notes</span>
                  </button>
                </div>
              </div>
            </div>

            {lesson.type === 'article' && lesson.content && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
                <MarkdownRenderer content={lesson.content} />
                {!completed && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button onClick={handleMarkComplete} size="lg">
                      Mark as Complete
                      <CheckCircle className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {lesson.type === 'article' && !lesson.content && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">This lesson content is coming soon.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">We're working on creating comprehensive educational materials for this topic.</p>
                </div>
                {!completed && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={!prevLesson && course.units.findIndex(u => u.id === unitId) === 0}
              >
                <ChevronLeft className="mr-2 w-4 h-4" />
                Previous
              </Button>

              <Link to={`/course/${courseId}/unit/${unitId}`} className="text-blue-600 hover:underline">
                Back to Unit
              </Link>

              <Button onClick={handleNext}>
                {nextLesson ? 'Next Lesson' : 'Complete Unit'}
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Notes Side Panel */}
        {showNotes && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Lesson Notes</h3>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Notes for: <span className="font-medium text-gray-700 dark:text-gray-300">{lesson.title}</span>
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your notes, key takeaways, or questions here..."
                className="flex-1 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                onClick={handleSaveNote}
                disabled={savingNote || !note.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                {savingNote ? 'Saving...' : noteSaved ? '✓ Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}