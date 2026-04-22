import { supabase } from '../lib/supabase';

export async function markLessonComplete(lessonId: string, courseId: string, unitId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('lesson_progress').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    unit_id: unitId,
  }, { onConflict: 'user_id,lesson_id,course_id' });
}

export async function saveQuizScore(lessonId: string, courseId: string, score: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from('quiz_scores').upsert({
    user_id: user.id,
    lesson_id: lessonId,
    course_id: courseId,
    score,
  }, { onConflict: 'user_id,lesson_id,course_id' });
  await markLessonComplete(lessonId, courseId, '');
}

export async function getUserProgress() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { completedLessons: [], quizScores: {} };

  const { data: lessons } = await supabase
    .from('lesson_progress')
    .select('lesson_id, course_id')
    .eq('user_id', user.id);

  const { data: scores } = await supabase
    .from('quiz_scores')
    .select('lesson_id, course_id, score')
    .eq('user_id', user.id);

  const completedLessons = lessons?.map(l => `${l.course_id}:${l.lesson_id}`) || [];
  const quizScores = Object.fromEntries(
    scores?.map(s => [`${s.course_id}:${s.lesson_id}`, s.score]) || []
  );

  return { completedLessons, quizScores };
}

export async function isLessonComplete(lessonId: string, courseId?: string): Promise<boolean> {
  const { completedLessons } = await getUserProgress();
  if (courseId) {
    return completedLessons.includes(`${courseId}:${lessonId}`);
  }
  return completedLessons.some(l => l.endsWith(`:${lessonId}`));
}

export async function getQuizScore(lessonId: string, courseId?: string): Promise<number | undefined> {
  const { quizScores } = await getUserProgress();
  if (courseId) {
    return quizScores[`${courseId}:${lessonId}`];
  }
  const key = Object.keys(quizScores).find(k => k.endsWith(`:${lessonId}`));
  return key ? quizScores[key] : undefined;
}

export async function getCourseProgress(courseId: string, totalLessons: number): Promise<number> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from('lesson_progress')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('course_id', courseId);
  const completed = count || 0;
  return totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
}

export async function getUnitProgress(unitLessons: string[], courseId?: string): Promise<number> {
  const { completedLessons } = await getUserProgress();
  const completed = unitLessons.filter(id => {
    if (courseId) return completedLessons.includes(`${courseId}:${id}`);
    return completedLessons.some(l => l.endsWith(`:${id}`));
  }).length;
  return unitLessons.length > 0 ? Math.round((completed / unitLessons.length) * 100) : 0;
}