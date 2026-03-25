import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Header } from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { getUserProgress, getCourseProgress } from '../data/progress';
import { courses } from '../data/courses';
import { CheckCircle, BookOpen, Brain, Trophy, TrendingUp } from 'lucide-react';

export function DashboardPage() {
  const { profile } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, number>>({});

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
    };
    fetchData();
  }, []);

  const totalLessons = courses.reduce((acc, course) =>
    acc + course.units.reduce((a, unit) => a + unit.lessons.length, 0), 0);
  const avgQuizScore = Object.values(quizScores).length > 0
    ? Math.round(Object.values(quizScores).reduce((a, b) => a + b, 0) / Object.values(quizScores).length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome back, {profile?.name?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-gray-500 mt-2">Here's your learning progress at a glance.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{completedLessons.length}</div>
            <div className="text-sm text-gray-500">Lessons Completed</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalLessons}</div>
            <div className="text-sm text-gray-500">Total Lessons</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {Object.values(quizScores).length > 0 ? `${avgQuizScore}%` : '—'}
            </div>
            <div className="text-sm text-gray-500">Avg Quiz Score</div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {courses.filter(c => courseProgressMap[c.id] === 100).length}
            </div>
            <div className="text-sm text-gray-500">Courses Completed</div>
          </div>
        </div>

        {/* Course Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Course Progress</h2>
          </div>
          <div className="space-y-5">
            {courses.map((course) => {
              const progress = courseProgressMap[course.id] || 0;
              const totalCourseLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
              const completedCount = Math.round((progress / 100) * totalCourseLessons);
              return (
                <Link to={`/course/${course.id}`} key={course.id} className="block hover:opacity-80 transition-opacity">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{course.title}</span>
                    <span className="text-sm text-gray-500">{completedCount}/{totalCourseLessons} lessons · {progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
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

        {/* Quiz Scores */}
        {Object.keys(quizScores).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Quiz Scores</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(quizScores).map(([lessonId, score]) => (
                <div key={lessonId} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 mb-1">{lessonId}</div>
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