import { useTaskStore } from '@/store/taskStore';
import { TaskCard } from '@/components/TaskCard';
import { Inbox, Clock, CheckCircle } from 'lucide-react';

interface TaskBoardProps {
  onViewTask: (id: number) => void;
}

export function TaskBoard({ onViewTask }: TaskBoardProps) {
  const { tasks, getTasksByStatus, getPilots, getRouteById } = useTaskStore();
  
  const pendingTasks = getTasksByStatus('pending');
  const activeTasks = getTasksByStatus('active');
  const completedTasks = getTasksByStatus('completed');
  
  const pilots = getPilots();
  
  const getPilotById = (id: number) => pilots.find((p) => p.id === id);

  const handleUpdateStatus = (id: number, status: 'pending' | 'active' | 'completed') => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      if (status === 'active') {
        useTaskStore.getState().updateTask(id, { 
          status, 
          takeoffTime: new Date().toISOString() 
        });
      } else if (status === 'completed') {
        useTaskStore.getState().updateTask(id, { 
          status, 
          landingTime: new Date().toISOString() 
        });
      } else {
        useTaskStore.getState().updateTask(id, { status });
      }
    }
  };

  const columns = [
    { 
      id: 'pending', 
      title: '待派发', 
      tasks: pendingTasks, 
      icon: Inbox, 
      color: 'bg-yellow-100 text-yellow-800',
      borderColor: 'border-yellow-300'
    },
    { 
      id: 'active', 
      title: '执行中', 
      tasks: activeTasks, 
      icon: Clock, 
      color: 'bg-blue-100 text-blue-800',
      borderColor: 'border-blue-300'
    },
    { 
      id: 'completed', 
      title: '已完成', 
      tasks: completedTasks, 
      icon: CheckCircle, 
      color: 'bg-green-100 text-green-800',
      borderColor: 'border-green-300'
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">任务看板</h2>
          <p className="text-gray-500 mt-1">管理和追踪所有无人机任务</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-sm text-gray-600">{pendingTasks.length} 待派发</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="text-sm text-gray-600">{activeTasks.length} 执行中</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">{completedTasks.length} 已完成</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.map((column) => {
          const Icon = column.icon;
          return (
            <div 
              key={column.id} 
              className={`bg-gray-50 rounded-xl border-t-4 ${column.borderColor} p-4`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${column.color.replace('bg-', 'text-')}`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${column.color}`}>
                  {column.tasks.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {column.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    pilot={getPilotById(task.pilotId)}
                    route={getRouteById(task.routeId)}
                    onView={onViewTask}
                    onUpdateStatus={handleUpdateStatus}
                  />
                ))}
                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">暂无任务</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
