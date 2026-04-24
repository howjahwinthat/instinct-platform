import { Link, useParams, Navigate, useNavigate } from 'react-router';
import { getCourseById, getUnitById, getLessonById } from '../data/courses';
import { markLessonComplete, saveQuizScore, isLessonComplete } from '../data/progress';
import { QuizComponent } from '../components/QuizComponent';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { CheckCircle, ChevronLeft, ChevronRight, Save, StickyNote, X, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateStreak } from '../lib/streak';
import { supabase } from '../lib/supabase';
import { Toast } from '../components/Toast';
import { fireConfetti, fireSmallConfetti } from '../lib/confetti';

export function LessonPage() {
  const { courseId, unitId, lessonId } = useParams();
  const navigate = useNavigate();
  const [completed, setCompleted] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [toast, setToast] = useState<{ message: string; emoji: string } | null>(null);

  const course = getCourseById(courseId || '');
  const unit = getUnitById(courseId || '', unitId || '');
  const lesson = getLessonById(courseId || '', unitId || '', lessonId || '');

  useEffect(() => {
    isLessonComplete(lessonId || '', courseId || '').then(setCompleted);
    fetchNote();
  }, [lessonId]);

  const fetchNote = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('lesson_notes').select('content')
      .eq('user_id', user.id).eq('lesson_id', lessonId).single();
    if (data) setNote(data.content);
    else setNote('');
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setSavingNote(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('lesson_notes').upsert({
      user_id: user.id, lesson_id: lessonId, course_id: courseId,
      content: note, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' });
    setSavingNote(false);
    setNoteSaved(true);
    fireSmallConfetti();
    setToast({ message: 'Notes saved!', emoji: '📝' });
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (!course || !unit || !lesson) return <Navigate to="/" replace />;

  const currentLessonIndex = unit.lessons.findIndex(l => l.id === lesson.id);
  const nextLesson = unit.lessons[currentLessonIndex + 1];
  const prevLesson = unit.lessons[currentLessonIndex - 1];

  const handleMarkComplete = async () => {
    if (lesson.id) {
      await markLessonComplete(lesson.id, courseId || '', unitId || '');
      await updateStreak();
      setCompleted(true);
      fireConfetti();
      setToast({ message: 'Lesson Complete! Keep it up! 🚀', emoji: '🎉' });
    }
  };

  const handleQuizComplete = async (score: number) => {
    if (lesson.id) {
      await saveQuizScore(lesson.id, courseId || '', score);
      await updateStreak();
      setCompleted(true);
      if (score >= 80) {
        fireConfetti();
        setToast({ message: `Quiz Crushed! You scored ${score}%!`, emoji: '🏆' });
      } else if (score >= 60) {
        fireSmallConfetti();
        setToast({ message: `Quiz Complete! You scored ${score}%`, emoji: '✅' });
      } else {
        setToast({ message: `Quiz done. You scored ${score}% — keep practicing!`, emoji: '💪' });
      }
    }
  };

  const handleNext = () => {
    if (nextLesson) {
      navigate(`/course/${courseId}/unit/${unitId}/lesson/${nextLesson.id}`);
    } else {
      const currentUnitIndex = course.units.findIndex(u => u.id === unitId);
      const nextUnit = course.units[currentUnitIndex + 1];
      if (nextUnit) navigate(`/course/${courseId}/unit/${nextUnit.id}`);
      else navigate(`/course/${courseId}`);
    }
  };

  const handlePrevious = () => {
    if (prevLesson) navigate(`/course/${courseId}/unit/${unitId}/lesson/${prevLesson.id}`);
    else navigate(`/course/${courseId}/unit/${unitId}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');

        .lesson-content {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 20px;
          color: #CBD5E1;
          line-height: 1.8;
          font-size: 15px;
        }
        .lesson-content h1, .lesson-content h2, .lesson-content h3 {
          color: #F1F5F9;
          font-weight: 700;
          letter-spacing: -0.3px;
          margin-top: 28px;
          margin-bottom: 12px;
        }
        .lesson-content h1 { font-size: 24px; }
        .lesson-content h2 { font-size: 20px; }
        .lesson-content h3 { font-size: 17px; color: #94A3B8; }
        .lesson-content p { color: #94A3B8; margin-bottom: 16px; }
        .lesson-content strong { color: #E2E8F0; font-weight: 600; }
        .lesson-content ul, .lesson-content ol {
          color: #94A3B8; padding-left: 20px; margin-bottom: 16px;
        }
        .lesson-content li { margin-bottom: 6px; }
        .lesson-content code {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          color: #60A5FA;
          padding: 2px 6px; border-radius: 4px;
          font-family: 'DM Mono', monospace; font-size: 13px;
        }
        .lesson-content blockquote {
          border-left: 3px solid #3B82F6;
          padding-left: 16px;
          color: #64748B;
          margin: 16px 0;
          font-style: italic;
        }
        .nav-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 18px; border-radius: 10px;
          font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.15s ease;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #94A3B8; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
        }
        .nav-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: #F1F5F9;
        }
        .nav-btn.primary {
          background: #3B82F6;
          border-color: #3B82F6;
          color: white;
        }
        .nav-btn.primary:hover { background: #2563EB; }
        .nav-btn:disabled {
          opacity: 0.3; cursor: not-allowed;
        }
        .complete-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 10px;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white; border: none; cursor: pointer;
          font-size: 14px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s ease;
          box-shadow: 0 0 20px rgba(16,185,129,0.25);
        }
        .complete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 28px rgba(16,185,129,0.35);
        }
        .notes-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 8px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; transition: all 0.15s;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: #64748B; font-family: 'DM Sans', sans-serif;
        }
        .notes-btn.active {
          background: rgba(59,130,246,0.15);
          border-color: rgba(59,130,246,0.3);
          color: #3B82F6;
        }
        .notes-btn:hover { border-color: rgba(255,255,255,0.14); color: #94A3B8; }
        .breadcrumb-link {
          color: #3B82F6; text-decoration: none;
          font-size: 13px; transition: color 0.15s;
        }
        .breadcrumb-link:hover { color: #60A5FA; }
        .notes-panel {
          position: fixed; right: 0; top: 60px;
          height: calc(100vh - 60px); width: 320px;
          background: #0D1117;
          border-left: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column;
          z-index: 40;
          box-shadow: -20px 0 60px rgba(0,0,0,0.4);
        }
        .notes-textarea {
          flex: 1; width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px;
          color: #CBD5E1;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.6;
          resize: none;
          outline: none;
          transition: border-color 0.15s;
        }
        .notes-textarea:focus { border-color: rgba(59,130,246,0.4); }
        .notes-textarea::placeholder { color: #334155; }
        .save-notes-btn {
          width: 100%; display: flex; align-items: center;
          justify-content: center; gap: 6px;
          padding: 10px; border-radius: 8px;
          background: #3B82F6; color: white;
          border: none; cursor: pointer;
          font-size: 13px; font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
          margin-top: 10px;
        }
        .save-notes-btn:hover { background: #2563EB; }
        .save-notes-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .completed-badge {
          display: flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 8px;
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.25);
          color: #34D399; font-size: 13px; font-weight: 600;
        }
        .coming-soon {
          text-align: center; padding: 60px 20px;
          color: #475569;
        }
      `}</style>

      <div style={{ display: 'flex' }}>
        {/* Main content */}
        <div style={{
          flex: 1,
          marginRight: showNotes ? 320 : 0,
          transition: 'margin-right 0.3s ease'
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', padding: '36px 24px' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
              <a href="/home" className="breadcrumb-link">Home</a>
              <span style={{ color: '#334155', fontSize: 13 }}>›</span>
              <a href={`/course/${course.id}`} className="breadcrumb-link">{course.title}</a>
              <span style={{ color: '#334155', fontSize: 13 }}>›</span>
              <a href={`/course/${courseId}/unit/${unitId}`} className="breadcrumb-link">{unit.title}</a>
              <span style={{ color: '#334155', fontSize: 13 }}>›</span>
              <span style={{ color: '#475569', fontSize: 13 }}>{lesson.title}</span>
            </nav>

            {/* Lesson header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <h1 style={{
                    fontSize: 28, fontWeight: 700, color: '#F1F5F9',
                    margin: 0, letterSpacing: '-0.6px', lineHeight: 1.2, marginBottom: 8
                  }}>
                    {lesson.title}
                  </h1>
                  {lesson.duration && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 13 }}>
                      <Clock size={13} color="#475569" />
                      <span>{lesson.duration} min read</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {completed && (
                    <div className="completed-badge">
                      <CheckCircle size={14} color="#34D399" />
                      <span>Done</span>
                    </div>
                  )}
                  <button
                    className={`notes-btn ${showNotes ? 'active' : ''}`}
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    <StickyNote size={14} />
                    Notes
                  </button>
                </div>
              </div>
            </div>

            {/* Article content */}
            {lesson.type === 'article' && lesson.content && (
              <div className="lesson-content">
                <MarkdownRenderer content={lesson.content} />
                {!completed && (
                  <div style={{
                    marginTop: 32, paddingTop: 24,
                    borderTop: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <button className="complete-btn" onClick={handleMarkComplete}>
                      <CheckCircle size={16} />
                      Mark as Complete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Coming soon */}
            {lesson.type === 'article' && !lesson.content && (
              <div className="lesson-content">
                <div className="coming-soon">
                  <div style={{ fontSize: 40, marginBottom: 16 }}>🚧</div>
                  <p style={{ color: '#475569', marginBottom: 6 }}>Content coming soon.</p>
                  <p style={{ fontSize: 13, color: '#334155' }}>
                    We're working on comprehensive materials for this topic.
                  </p>
                </div>
                {!completed && (
                  <div style={{ paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button className="complete-btn" onClick={handleMarkComplete}>
                      <CheckCircle size={16} />
                      Mark as Complete
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quiz */}
            {lesson.type === 'quiz' && lesson.questions && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 32, marginBottom: 20
              }}>
                <QuizComponent
                  questions={lesson.questions}
                  onComplete={handleQuizComplete}
                />
              </div>
            )}

            {/* Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
              <button
                className="nav-btn"
                onClick={handlePrevious}
                disabled={!prevLesson && course.units.findIndex(u => u.id === unitId) === 0}
              >
                <ChevronLeft size={15} />
                Previous
              </button>

              
                <Link
  to={`/course/${courseId}/unit/${unitId}`}
  style={{ color: '#475569', fontSize: 13, textDecoration: 'none', transition: 'color 0.15s' }}
>
  ← Back to Unit
</Link>

              <button className="nav-btn primary" onClick={handleNext}>
                {nextLesson ? 'Next Lesson' : 'Complete Unit'}
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes panel */}
        {showNotes && (
          <div className="notes-panel">
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <StickyNote size={15} color="#3B82F6" />
                <span style={{ color: '#F1F5F9', fontWeight: 600, fontSize: 14 }}>Lesson Notes</span>
              </div>
              <button
                onClick={() => setShowNotes(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#475569', padding: 4, borderRadius: 6,
                  transition: 'color 0.15s'
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ color: '#334155', fontSize: 11, marginBottom: 10, fontWeight: 500 }}>
                {lesson.title}
              </div>
              <textarea
                className="notes-textarea"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write your notes, key takeaways, or questions here..."
              />
              <button
                className="save-notes-btn"
                onClick={handleSaveNote}
                disabled={savingNote || !note.trim()}
              >
                <Save size={13} />
                {savingNote ? 'Saving...' : noteSaved ? '✓ Saved!' : 'Save Notes'}
              </button>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          emoji={toast.emoji}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}