import { Link } from 'react-router';
import { Lightbulb, BookOpen, Target, Shield, Brain, TrendingUp, CheckCircle, BarChart2, Trophy, ArrowRight } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');`}</style>
    

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold">Instinct</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900 bg-opacity-40 border border-blue-700 rounded-full px-4 py-2 text-sm text-blue-300 mb-8">
          <TrendingUp className="w-4 h-4" />
          <span>The smarter way to learn trading</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          Learn to Trade
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            with Confidence
          </span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          A structured, progressive trading education platform. Master financial markets through
          clear lessons, interactive quizzes, and real-time market data.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Start Learning Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-16 border-t border-gray-800">
          <div>
            <div className="text-3xl font-black text-white">4</div>
            <div className="text-sm text-gray-500 mt-1">Courses</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">36+</div>
            <div className="text-sm text-gray-500 mt-1">Lessons</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">100%</div>
            <div className="text-sm text-gray-500 mt-1">Free</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Everything you need to learn trading</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Built for beginners who want to learn trading the right way — structured, disciplined, and risk-aware.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              color: 'text-blue-400',
              bg: 'bg-blue-900 bg-opacity-30',
              title: 'Structured Courses',
              desc: 'Follow a clear learning path from fundamentals to advanced strategies. No more jumping between random YouTube videos.'
            },
            {
              icon: Target,
              color: 'text-green-400',
              bg: 'bg-green-900 bg-opacity-30',
              title: 'Interactive Quizzes',
              desc: 'Test your knowledge after every lesson. Track your scores and see your improvement over time on the leaderboard.'
            },
            {
              icon: BarChart2,
              color: 'text-purple-400',
              bg: 'bg-purple-900 bg-opacity-30',
              title: 'Live Market Data',
              desc: 'Watch real stock charts while you learn. Apply theory to what\'s actually happening in the markets right now.'
            },
            {
              icon: Shield,
              color: 'text-yellow-400',
              bg: 'bg-yellow-900 bg-opacity-30',
              title: 'Risk-First Approach',
              desc: 'Learn responsible trading with emphasis on risk management and discipline before chasing profits.'
            },
            {
              icon: TrendingUp,
              color: 'text-cyan-400',
              bg: 'bg-cyan-900 bg-opacity-30',
              title: 'Progress Tracking',
              desc: 'See exactly where you are in each course. Daily streaks keep you motivated and consistent.'
            },
            {
              icon: Brain,
              color: 'text-pink-400',
              bg: 'bg-pink-900 bg-opacity-30',
              title: 'Trading Journal',
              desc: 'Write notes, track your thoughts, and reflect on your learning journey all in one place.'
            },
          ].map((feature, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors">
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Preview */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">4 courses to take you from zero to trader</h2>
          <p className="text-gray-400">Each course builds on the last — start at the beginning and work your way up.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { num: '01', title: 'Trading Fundamentals', desc: 'Market structure, order types, and how financial instruments work.', lessons: 12 },
            { num: '02', title: 'Technical Analysis', desc: 'Charts, indicators, and how to identify trading opportunities.', lessons: 9 },
            { num: '03', title: 'Risk Management', desc: 'Position sizing, stop losses, and protecting your capital.', lessons: 9 },
            { num: '04', title: 'Trading Psychology', desc: 'Emotions, discipline, and the mental game of trading.', lessons: 6 },
          ].map((course) => (
            <div key={course.num} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-start gap-4 hover:border-gray-600 transition-colors">
              <div className="text-4xl font-black text-gray-700 flex-shrink-0">{course.num}</div>
              <div>
                <h3 className="text-lg font-bold mb-1">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-3">{course.desc}</p>
                <div className="text-xs text-blue-400">{course.lessons} lessons</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Instinct */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-20">
        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-10 md:p-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Why Instinct?</h2>
              <div className="space-y-4">
                {[
                  'No fragmented YouTube videos or paid courses',
                  'Structured curriculum that actually makes sense',
                  'Learn at your own pace with progress tracking',
                  'Real market data to apply what you learn',
                  'Built by a trader who learned the hard way',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
                <div className="text-2xl font-black mb-1">Leaderboard</div>
                <div className="text-gray-400 text-sm">Compete with other traders on quiz scores</div>
              </div>
              <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
                <div className="text-2xl font-black mb-1">Daily Streaks</div>
                <div className="text-gray-400 text-sm">Stay consistent with streak tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 md:px-16 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-6">
          Ready to learn trading
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            the right way?
          </span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
          Join Instinct today and start your structured trading education journey. Free forever.
        </p>
        <Link
          to="/signup"
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors inline-flex items-center gap-2"
        >
          Get Started Free
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 md:px-16 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-blue-400" />
            <span className="font-bold">Instinct</span>
          </div>
          <p className="text-gray-600 text-sm">
            For educational purposes only. Not financial advice.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}