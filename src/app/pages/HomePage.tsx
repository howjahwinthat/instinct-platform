import { Link } from 'react-router';
import { Header } from '../components/Header';
import { courses } from '../data/courses';
import { ArrowRight, BookOpen, Target, Shield, Brain } from 'lucide-react';
import { Button } from '../components/ui/button';

export function HomePage() {
  const icons = {
    '📊': BookOpen,
    '📈': Target,
    '🛡️': Shield,
    '🧠': Brain,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Learn to Trade with Confidence
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            A structured, progressive learning platform for trading education. 
            Master financial markets through clear lessons, interactive quizzes, and a proven curriculum.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/course/trading-fundamentals">
                Start Learning
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/course/trading-fundamentals">Browse Courses</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Structured Learning Path</h3>
            <p className="text-gray-600">
              Follow a clear progression from beginner to intermediate concepts with organized modules and lessons.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Interactive Quizzes</h3>
            <p className="text-gray-600">
              Test your knowledge with quizzes after each section to reinforce learning and track progress.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Risk-First Approach</h3>
            <p className="text-gray-600">
              Learn responsible trading with emphasis on risk management, discipline, and long-term thinking.
            </p>
          </div>
        </div>

        {/* Courses */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Learning Paths</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => {
              const IconComponent = icons[course.icon as keyof typeof icons] || BookOpen;
              
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{course.units.length} Units</span>
                        <span>·</span>
                        <span>{course.skillsCount} Skills</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Why Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Instinct?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">The Problem</h3>
              <p className="text-gray-600 mb-4">
                Learning to trade is difficult due to fragmented information, misleading content, 
                and the absence of structured educational resources. Most aspiring traders rely on 
                unverified sources and trial-and-error approaches.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">The Solution</h3>
              <p className="text-gray-600 mb-4">
                Instinct provides a clear, progressive learning path modeled after proven educational 
                platforms. Learn trading concepts systematically, from fundamentals to advanced strategies, 
                with emphasis on discipline and responsible trading.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">
              <strong>Important:</strong> This platform is for educational purposes only. 
              It does not execute trades or provide financial advice. Always conduct your own 
              research and consider consulting with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
