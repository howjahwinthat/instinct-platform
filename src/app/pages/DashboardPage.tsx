import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, getCourseProgress } from '../data/progress';
import { courses } from '../data/courses';
import { CheckCircle, BookOpen, Brain, Trophy, TrendingUp } from 'lucide-react';
import { getStreak } from '../lib/streak';

export function DashboardPage() {
  const { profile } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { completedLessons, quizScores } = await getUserProgress();
      setCompletedLessons(completedLessons);
      setQuizScores(quizScores);

      const progressMap: Record<string, number> = {};
      await Promise.all(
        courses.map(async (course) => {
          const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
          const progress = await getCourseProgress(course.id, totalLessons);
          progressMap[course.id] = progress;
        })
      );
      setCourseProgressMap(progressMap);

      const streakData = await getStreak();
      setStreak(streakData);
    };
    fetchData();
  }, []);

  const totalLessons = courses.reduce((acc, course) =>
    acc + course.units.reduce((a, unit) => a + unit.lessons.length, 0), 0);
  const avgQuizScore = Object.values(quizScores).length > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.values(quizScores).length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Welcome back, {profile?.name?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Here's your learning progress at a glance.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedLessons.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Lessons Completed</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalLessons}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Lessons</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {Object.values(quizScores).length > 0 ? `${avgQuizScore}%` : '—'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Avg Quiz Score</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {courses.filter(c => courseProgressMap[c.id] === 100).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Courses Completed</div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {streak?.current_streak || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Day Streak</div>
            {streak && streak.longest_streak > 0 && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Best: {streak.longest_streak} days
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Progress</h2>
          </div>
          <div className="space-y-5">
            {courses.map((course) => {
              const progress = courseProgressMap[course.id] || 0;
              const totalCourseLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
              const completedCount = Math.round((progress / 100) * totalCourseLessons);
              return (
                <Link to={`/course/${course.id}`} key={course.id} className="block hover:opacity-80 transition-opacity">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{course.title}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{completedCount}/{totalCourseLessons} lessons · {progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {Object.keys(quizScores).length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quiz Scores</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(quizScores).map(([lessonId, score]) => (
                <div key={lessonId} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{lessonId}</div>
                  <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}