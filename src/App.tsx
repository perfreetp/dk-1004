import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TaskBoard } from '@/pages/TaskBoard';
import { NewTask } from '@/pages/NewTask';
import { RouteManagement } from '@/pages/RouteManagement';
import { ResourceCalendar } from '@/pages/ResourceCalendar';
import { TaskExecution } from '@/pages/TaskExecution';
import { Statistics } from '@/pages/Statistics';

type PageType = 'dashboard' | 'new-task' | 'routes' | 'resources' | 'statistics' | 'task-execution';

function App() {
  const [activePage, setActivePage] = useState<PageType>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const handleNavigate = (page: string) => {
    setActivePage(page as PageType);
    setSelectedTaskId(null);
  };

  const handleViewTask = (taskId: number) => {
    setSelectedTaskId(taskId);
    setActivePage('task-execution');
  };

  const handleBack = () => {
    setActivePage('dashboard');
    setSelectedTaskId(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <TaskBoard onViewTask={handleViewTask} />;
      case 'new-task':
        return <NewTask onBack={handleBack} />;
      case 'routes':
        return <RouteManagement />;
      case 'resources':
        return <ResourceCalendar />;
      case 'statistics':
        return <Statistics />;
      case 'task-execution':
        if (selectedTaskId !== null) {
          return <TaskExecution taskId={selectedTaskId} onBack={handleBack} />;
        }
        return <TaskBoard onViewTask={handleViewTask} />;
      default:
        return <TaskBoard onViewTask={handleViewTask} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
