import { createBrowserRouter } from 'react-router';
import { HomePage } from './pages/HomePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { UnitDetailPage } from './pages/UnitDetailPage';
import { LessonPage } from './pages/LessonPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketPage } from './pages/MarketPage';
import { CourseLayout } from './components/CourseLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { JournalPage } from './pages/JournalPage';
import { TradeLogPage } from './pages/TradeLogPage';
import { LeaderboardPage } from './pages/LeaderboardPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
  path: '/leaderboard',
  element: (
    <ProtectedRoute>
      <LeaderboardPage />
    </ProtectedRoute>
    )
  },
  {
  path: '/journal',
  element:  (
    <ProtectedRoute>
      <JournalPage />
    </ProtectedRoute>
    )
  },
  {
  path: '/trades',
  element: (
    <ProtectedRoute>
      <TradeLogPage />
    </ProtectedRoute>
    )
  },
  {
    path: '/signup',
    element: <SignupPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/market',
    element: (
      <ProtectedRoute>
        <MarketPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/course/:courseId',
    element: (
      <ProtectedRoute>
        <CourseLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <CourseDetailPage />
      },
      {
        path: 'unit/:unitId',
        element: <UnitDetailPage />
      },
      {
        path: 'unit/:unitId/lesson/:lessonId',
        element: <LessonPage />
      }
    ]
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
          <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
          <a href="/" className="text-blue-600 hover:underline">Go back home</a>
        </div>
      </div>
    )
  }
]);