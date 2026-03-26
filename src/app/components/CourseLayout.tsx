import { Outlet } from 'react-router';
import { useState } from 'react';
import { Header } from '../components/Header';
import { CourseSidebar } from '../components/CourseSidebar';

export function CourseLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />
      <div className="flex">
        <CourseSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950" style={{ height: 'calc(100vh - 60px)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}