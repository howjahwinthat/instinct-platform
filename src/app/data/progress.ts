import { UserProgress } from './types';

const STORAGE_KEY = 'instinct-user-progress';

export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return { completedLessons: [], quizScores: {} };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { completedLessons: [], quizScores: {} };
    }
  }
  return { completedLessons: [], quizScores: {} };
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function markLessonComplete(lessonId: string): void {
  const progress = getUserProgress();
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    saveUserProgress(progress);
  }
}

export function saveQuizScore(lessonId: string, score: number): void {
  const progress = getUserProgress();
  progress.quizScores[lessonId] = score;
  markLessonComplete(lessonId);
  saveUserProgress(progress);
}

export function isLessonComplete(lessonId: string): boolean {
  const progress = getUserProgress();
  return progress.completedLessons.includes(lessonId);
}

export function getQuizScore(lessonId: string): number | undefined {
  const progress = getUserProgress();
  return progress.quizScores[lessonId];
}

export function getCourseProgress(courseId: string, totalLessons: number): number {
  const progress = getUserProgress();
  const completedInCourse = progress.completedLessons.filter(
    id => id.startsWith(courseId) || id.includes(courseId)
  ).length;
  return totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;
}

export function getUnitProgress(unitLessons: string[]): number {
  const progress = getUserProgress();
  const completed = unitLessons.filter(id => progress.completedLessons.includes(id)).length;
  return unitLessons.length > 0 ? Math.round((completed / unitLessons.length) * 100) : 0;
}
