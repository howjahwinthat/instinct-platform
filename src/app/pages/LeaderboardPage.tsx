import { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { Trophy, Medal, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  total_score: number;
  quizzes_taken: number;
  avg_score: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: scores } = await supabase
        .from('quiz_scores')
        .select('user_id, score');

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name');

      if (!scores || !profiles) return;

      const profileMap = Object.fromEntries(
        profiles.map(p => [p.id, p.name])
      );

      const userMap: Record<string, { total: number; count: number }> = {};
      scores.forEach(s => {
        if (!userMap[s.user_id]) userMap[s.user_id] = { total: 0, count: 0 };
        userMap[s.user_id].total += s.score;
        userMap[s.user_id].count += 1;
      });

      const entries: LeaderboardEntry[] = Object.entries(userMap)
        .map(([user_id, data]) => ({
          user_id,
          name: profileMap[user_id] || 'Anonymous',
          total_score: data.total,
          quizzes_taken: data.count,
          avg_score: Math.round(data.total / data.count),
        }))
        .sort((a, b) => b.avg_score - a.avg_score);

      setLeaderboard(entries);
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-600';
    return 'text-gray-500 dark:text-gray-400';
  };

  const getRankBg = (index: number) => {
    if (index === 0) return 'bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700';
    if (index === 1) return 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600';
    if (index === 2) return 'bg-amber-50 dark:bg-amber-900 border-amber-200 dark:border-amber-700';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Quiz Leaderboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Top performers ranked by average quiz score</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 animate-pulse h-20" />
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No scores yet</h3>
            <p className="text-gray-500 dark:text-gray-500">Complete some quizzes to appear on the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.user_id}
                className={`rounded-xl p-5 border flex items-center gap-4 ${getRankBg(index)} ${
                  entry.user_id === user?.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* Rank */}
                <div className="w-10 text-center flex-shrink-0">
                  {index < 3 ? (
                    <Medal className={`w-7 h-7 mx-auto ${getMedalColor(index)}`} />
                  ) : (
                    <span className="text-lg font-bold text-gray-500 dark:text-gray-400">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1">
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {entry.name}
                    {entry.user_id === user?.id && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {entry.quizzes_taken} quiz{entry.quizzes_taken !== 1 ? 'zes' : ''} taken
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div className={`text-2xl font-bold ${
                    entry.avg_score >= 80 ? 'text-green-600' :
                    entry.avg_score >= 60 ? 'text-yellow-600' : 'text-red-500'
                  }`}>
                    {entry.avg_score}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">avg score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}